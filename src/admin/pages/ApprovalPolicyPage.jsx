import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  activatePolicy,
  createPolicy,
  deactivatePolicy,
  deletePolicy,
  fetchDocumentTypes,
  fetchPolicies,
} from "../../api/groupware/policyApi";
import { fetchEmployees } from "../../api/hr/employeeApi";
import { useSelector } from "react-redux";
import { useWatch } from "antd/es/form/Form"; // ✅ 실시간 감시용 Hook

const { Option } = Select;

const ApprovalPolicyPage = () => {
  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState("deactivate");
  const [selectedId, setSelectedId] = useState(null);
  const [form] = Form.useForm();
  const [documentTypes, setDocumentTypes] = useState([]);
  const [employees, setEmployees] = useState([]);

  // ✅ useWatch로 Form 내부의 steps 필드 변경을 실시간 감시
  const steps = useWatch("steps", form);

  const { user: currentUser } = useSelector((state) => state.auth);

  /** 🔹 문서유형 목록 로드 */
  const loadDocumentTypes = async () => {
    try {
      const res = await fetchDocumentTypes();
      const data = res?.data?.data || res?.data || [];
      const formatted = data.map((t) => ({
        label: t.label || t.name || t.code,
        value: t.code,
      }));
      setDocumentTypes(formatted);
    } catch {
      message.error("문서유형 정보를 불러오지 못했습니다.");
    }
  };

  /** 🔹 직원 목록 로드 */
  const loadEmployees = async () => {
    try {
      const res = await fetchEmployees();
      // ✅ res가 배열이므로 바로 사용 가능
      const data = Array.isArray(res) ? res : res?.data || [];

      const formatted = data.map((emp) => ({
        label: `${emp.empName}`,
        value: emp.empId, // approverId로 사용
        empId: emp.empId,
        empNo: emp.empNo,
        empName: emp.empName,
        deptCode: emp.deptId,
        deptName: emp.deptName,
        positionCode: emp.positionCode,
        positionName: emp.positionName,
      }));

      setEmployees(formatted);
      console.log("✅ 직원 목록 로드됨:", formatted);
    } catch (err) {
      console.error("❌ 직원 목록 로드 실패:", err);
      message.error("직원 정보를 불러오지 못했습니다.");
    }
  };

  /** 🔹 정책 목록 로드 */
  const loadPolicies = async () => {
    setLoading(true);
    try {
      const res = await fetchPolicies();
      const data = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];
      const sortedData = [...data].sort((a, b) =>
        (a.policyName || "").localeCompare(b.policyName || "", "ko-KR")
      );
      setPolicies(sortedData);
    } catch {
      message.error("정책 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /** ✅ 초기 로드 */
  useEffect(() => {
    loadEmployees();
    loadDocumentTypes();
    loadPolicies();
  }, []);

  /** 🔹 새 정책 등록 */
  const openNewPolicyModal = async () => {
    setEditingPolicy(null);
    form.resetFields();
    setModalOpen(true);
  };

  /** 🔹 수정 모달 열기 */
  const openEditModal = (policy) => {
    setEditingPolicy(policy);
    form.setFieldsValue({
      policyName: policy.policyName,
      docType: policy.docType,
      steps: policy.steps || [],
    });
    setModalOpen(true);
  };

  /** 🔹 저장 처리 */
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const stepsArray = Array.isArray(values.steps) ? values.steps : [];

      if (stepsArray.length === 0) {
        message.warning("최소 한 개 이상의 결재 단계를 추가해주세요.");
        return;
      }

      const payload = {
        policyName: values.policyName,
        docType: values.docType,
        steps: stepsArray.map((step, index) => ({
          stepOrder: index + 1,
          approverId: step.approverId,
          approverName: step.approverName,
          deptCode: step.deptCode,
          deptName: step.deptName,
          positionCode: step.positionCode,
          positionName: step.positionName,
        })),
      };

      if (editingPolicy) {
        await updatePolicy(editingPolicy.id, payload);
        message.success("결재선 정책이 수정되었습니다.");
      } else {
        await createPolicy(payload);
        message.success("결재선 정책이 등록되었습니다.");
      }

      setModalOpen(false);
      loadPolicies();
    } catch (err) {
      console.error(err);
      message.error("정책 저장 중 오류가 발생했습니다.");
    }
  };

  /** 🔹 상태 변경 모달 */
  const openConfirmModal = (id, mode) => {
    setSelectedId(id);
    setConfirmMode(mode);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    try {
      if (!selectedId) return;
      if (confirmMode === "deactivate") {
        await deactivatePolicy(selectedId);
        message.warning("정책이 비활성화되었습니다.");
      } else if (confirmMode === "activate") {
        await activatePolicy(selectedId);
        message.success("정책이 다시 활성화되었습니다.");
      } else if (confirmMode === "delete") {
        await deletePolicy(selectedId);
        message.success("정책이 삭제되었습니다.");
      }
      loadPolicies();
    } catch (err) {
      console.error(err);
      message.error("정책 처리 중 오류가 발생했습니다.");
    } finally {
      setConfirmOpen(false);
    }
  };

  /** 🔹 테이블 컬럼 정의 */
  const columns = [
    { title: "정책명", dataIndex: "policyName", key: "policyName" },
    {
      title: "문서유형",
      dataIndex: "docType",
      key: "docType",
      render: (code) => {
        const found = documentTypes.find((t) => t.value === code);
        return found ? found.label : code;
      },
    },
    {
      title: "결재선",
      dataIndex: "steps",
      key: "steps",
      render: (steps) =>
        steps?.length
          ? steps
              .sort((a, b) => a.stepOrder - b.stepOrder)
              .map(
                (s) =>
                  `${s.stepOrder}. ${s.approverName || "-"} (${s.deptName || "-"}/${s.positionName || "-"})`
              )
              .join(" → ")
          : "(결재 단계 없음)",
    },
    {
      title: "상태",
      dataIndex: "active",
      key: "active",
      align: "center",
      render: (active) =>
        active ? (
          <span style={{ color: "green", fontWeight: 600 }}>● 활성</span>
        ) : (
          <span style={{ color: "red", fontWeight: 600 }}>● 비활성</span>
        ),
    },
    {
      title: "관리",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          {record.active ? (
            <>
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => openEditModal(record)}
              >
                수정
              </Button>
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
                onClick={() => openConfirmModal(record.id, "deactivate")}
              >
                비활성화
              </Button>
            </>
          ) : (
            <>
              <Button
                type="primary"
                size="small"
                onClick={() => openConfirmModal(record.id, "activate")}
              >
                활성화
              </Button>
              <Button
                danger
                size="small"
                onClick={() => openConfirmModal(record.id, "delete")}
              >
                삭제
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="결재선 정책 관리"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openNewPolicyModal}
        >
          신규 정책 추가
        </Button>
      }
      style={{
        margin: 20,
        borderRadius: 12,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
    >
      <Table
        loading={loading}
        rowKey="id"
        columns={columns}
        dataSource={Array.isArray(policies) ? policies : []}
        pagination={false}
      />

      {/* ✅ 등록/수정 모달 */}
      <Modal
        title={editingPolicy ? "결재선 정책 수정" : "새 결재선 정책 추가"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText="저장"
        cancelText="취소"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="정책명"
            name="policyName"
            rules={[{ required: true, message: "정책명을 입력하세요." }]}
          >
            <Input placeholder="예: 일반 결재 / 지출 결재" />
          </Form.Item>

          <Form.Item
            label="문서 유형"
            name="docType"
            rules={[{ required: true, message: "문서 유형을 선택하세요." }]}
          >
            <Select placeholder="문서 유형 선택" options={documentTypes} />
          </Form.Item>

          {/* ✅ Form.List로 결재선 관리 */}
          <Form.List name="steps">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => {
                  // 🔹 useWatch에서 실시간 steps 상태 가져오기
                  const currentStep = steps?.[name] || {};

                  return (
                    <div
                      key={key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: 8,
                      }}
                    >
                      {/* 결재자 선택 */}
                      <Form.Item
                        {...restField}
                        name={[name, "approverId"]}
                        label="결재자"
                        rules={[{ required: true, message: "결재자를 선택하세요." }]}
                        style={{ flex: 2 }}
                      >
                        <Select
                          showSearch
                          placeholder="결재자 선택"
                          options={employees}
                          onChange={(value, option) => {
                            // ✅ 선택 시 결재자 정보 전체를 Form에 반영
                            form.setFieldValue(["steps", name], {
                              approverId: value,
                              approverName: option.empName,
                              deptCode: option.deptCode,
                              deptName: option.deptName,
                              positionCode: option.positionCode,
                              positionName: option.positionName,
                              empId: value,
                            });
                          }}
                        />
                      </Form.Item>

                      {/* ✅ 실시간 부서 / 직급 표시 (useWatch 기반) */}
                      <div style={{ flex: 1, color: "#555" }}>
                        {currentStep?.deptName || "-"}
                      </div>
                      <div style={{ flex: 1, color: "#555" }}>
                        {currentStep?.positionName || "-"}
                      </div>

                      <Button
                        danger
                        type="text"
                        onClick={() => remove(name)}
                        style={{ marginTop: 28 }}
                      >
                        삭제
                      </Button>
                    </div>
                  );
                })}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    + 단계 추가
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* ✅ 상태 변경 모달 */}
      <Modal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onOk={handleConfirm}
        okText={
          confirmMode === "deactivate"
            ? "비활성화"
            : confirmMode === "activate"
            ? "활성화"
            : "삭제"
        }
        cancelText="취소"
        okType={
          confirmMode === "delete" || confirmMode === "deactivate"
            ? "danger"
            : "primary"
        }
        title={
          confirmMode === "deactivate"
            ? "정책 비활성화"
            : confirmMode === "activate"
            ? "정책 활성화"
            : "정책 삭제"
        }
      >
        <p>
          {confirmMode === "deactivate"
            ? "이 정책을 비활성화하면 문서 작성 시 자동 결재선으로 적용되지 않습니다."
            : confirmMode === "activate"
            ? "이 정책을 다시 활성화하시겠습니까?"
            : "이 정책을 완전히 삭제하시겠습니까? 복구할 수 없습니다."}
        </p>
      </Modal>
    </Card>
  );
};

export default ApprovalPolicyPage;
