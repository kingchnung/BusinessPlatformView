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
  createPolicy,
  deactivatePolicy,
  fetchDocumentTypes,
  fetchPolicies,
} from "../../api/groupware/policyApi";
import { fetchPositions } from "../../api/hr/positionAPI";
import { fetchUserProfile } from "../../api/userApi";
import { useSelector } from "react-redux";
import { fetchDepartments } from "../../api/hr/departmentsAPI";

const { Option } = Select;

const ApprovalPolicyPage = () => {
  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [positions, setPositions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false); // ✅ 비활성화 모달
  const [selectedId, setSelectedId] = useState(null);    // ✅ 비활성화 대상 ID
  const [form] = Form.useForm();
  const [documentTypes, setDocumentTypes] = useState([]);
  const [departments, setDepartments] = useState([]);

  const { user: currentUser } = useSelector((state) => state.auth);
  const [userProfile, setUserProfile] = useState(null);

  /** 사용자 프로필 */
  const loadUserProfile = async () => {
    try {
      if (!currentUser?.userId) return;
      const profile = await fetchUserProfile(currentUser.userId);
      setUserProfile(profile);
    } catch {
      message.error("사용자 정보를 불러오지 못했습니다.");
    }
  };

  /** ✅ 부서 목록 로드 (최종 확정 버전) */
  const loadDepartments = async () => {
    try {
      const res = await fetchDepartments();
      const data = res || [];

      console.log("📦 부서 API 응답:", data);

      // ✅ 응답이 배열이면 그대로 사용
      const raw = Array.isArray(data) ? data : data.data || [];

      // ✅ Antd Select에 맞는 형태로 변환
      const formatted = raw.map((d) => ({
        label: d.deptName,   // 드롭다운 표시 텍스트
        value: d.deptCode,   // 내부 값
      }));

      console.log("✅ 변환된 부서 목록:", formatted);
      setDepartments(formatted);
    } catch (err) {
      console.error("❌ 부서 목록 로드 실패:", err);
      message.error("부서 정보를 불러오지 못했습니다.");
    }
  };

  /** 문서 유형 */
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

  /** 정책 목록 */
  const loadPolicies = async () => {
    setLoading(true);
    try {
      const res = await fetchPolicies();
      const data =
        Array.isArray(res?.data)
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

  /** 직급 목록 */
  const loadPositions = async () => {
    try {
      const res = await fetchPositions();
      const data = res?.data?.data || res?.data || res || [];
      const formatted = data.map((pos) => ({
        label:
          pos.positionName ||
          pos.position_name ||
          pos.name ||
          `직급-${pos.positionCode}`,
        value:
          pos.positionCode ||
          pos.position_code ||
          pos.code ||
          pos.id,
      }));
      setPositions(formatted);
    } catch {
      message.error("직급 정보를 불러오지 못했습니다.");
    }
  };

  /** 초기 데이터 로드 */
  useEffect(() => {
    loadUserProfile();
    loadDepartments();
    loadPolicies();
    loadPositions();
    loadDocumentTypes();
  }, []);

  /** 새 정책 등록 */
  const openNewPolicyModal = async () => {
    if (positions.length === 0) await loadPositions();
    setEditingPolicy(null);
    form.resetFields();
    setModalOpen(true);
  };

  /** 수정 모달 */
  const openEditModal = (policy) => {
    setEditingPolicy(policy);
    form.setFieldsValue({
      policyName: policy.policyName,
      docType: policy.docType,
      approverRoles: policy.steps || [],
    });
    setModalOpen(true);
  };

  /** 저장 */
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
          deptCode: step.deptCode,
          positionCode: step.positionCode,
          empId: null,
        })),
      };

      await createPolicy(payload);
      message.success("결재선 정책이 등록되었습니다.");
      setModalOpen(false);
      loadPolicies();
    } catch {
      message.error("정책 등록 중 오류가 발생했습니다.");
    }
  };

  /** ✅ 비활성화 버튼 클릭 */
  const handleDeactivateClick = (id) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  /** ✅ 실제 비활성화 실행 */
  const handleDeactivateConfirm = async () => {
    try {
      await deactivatePolicy(selectedId);
      message.success("정책이 비활성화되었습니다.");
      loadPolicies();
    } catch (err) {
      console.error(err);
      message.error("비활성화 중 오류가 발생했습니다.");
    } finally {
      setConfirmOpen(false);
    }
  };

  /** 테이블 컬럼 정의 */
  const columns = [
    { title: "정책명", dataIndex: "policyName", key: "policyName" },
    {
      title: "문서유형",
      dataIndex: "docType",
      key: "docType",
      render: (t) => t || "-",
    },
    {
      title: "결재자 순서 (직급)",
      dataIndex: "steps",
      key: "steps",
      render: (steps) =>
        steps?.length
          ? steps
            .sort((a, b) => a.stepOrder - b.stepOrder)
            .map((s) => `${s.deptName || "-"}/${s.positionName || "-"}`)
            .join(" → ")
          : "(결재 단계 없음)",
    },
    {
      title: "관리",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
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
            onClick={() => handleDeactivateClick(record.id)}
          >
            비활성화
          </Button>
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

      {/* ✅ 일반 등록/수정 모달 */}
      <Modal
        title={editingPolicy ? "결재선 정책 수정" : "새 결재선 정책 추가"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText="저장"
        cancelText="취소"
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
            <Select
              placeholder="결재 정책이 적용될 문서 유형을 선택하세요"
              options={documentTypes}
            />
          </Form.Item>

          <Form.List name="steps">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: 8,
                    }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "deptCode"]}
                      label="부서"
                      rules={[{ required: true, message: "부서를 선택하세요." }]}
                      style={{ flex: 1 }}
                    >
                      <Select
                        key={departments.length} // ✅ 이 한 줄로 강제 리렌더
                        allowClear
                        placeholder="부서 선택"
                        options={departments.map((d) => ({
                          label: String(d.label),
                          value: String(d.value),
                        }))} // ✅ 타입 보장
                        style={{ width: "100%" }}
                      />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "positionCode"]}
                      label="직급"
                      rules={[{ required: true, message: "직급을 선택하세요." }]}
                      style={{ flex: 1 }}
                    >
                      <Select
                        placeholder="직급 선택"
                        options={positions}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>

                    <Button
                      danger
                      type="text"
                      onClick={() => remove(name)}
                      style={{ marginTop: 28 }}
                    >
                      삭제
                    </Button>
                  </div>
                ))}
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

      {/* ✅ 비활성화 확인 모달 */}
      <Modal
        open={confirmOpen}
        title="정말 비활성화하시겠습니까?"
        onCancel={() => setConfirmOpen(false)}
        onOk={handleDeactivateConfirm}
        okText="비활성화"
        cancelText="취소"
        okType="danger"
      >
        <p>비활성화된 정책은 다시 활성화해야 사용할 수 있습니다.</p>
      </Modal>
    </Card>
  );
};

export default ApprovalPolicyPage;
