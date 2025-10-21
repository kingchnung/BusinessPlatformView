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
import { fetchUserProfile } from "../../api/userApi"; // ✅ 추가
import { useSelector } from "react-redux";

const { Option } = Select;

const ApprovalPolicyPage = () => {
  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [positions, setPositions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [form] = Form.useForm();
  const [selectKey, setSelectKey] = useState(0);
  const [documentTypes, setDocumentTypes] = useState([]);

  const { user: currentUser } = useSelector((state) => state.auth);
  const [userProfile, setUserProfile] = useState(null); // ✅ 사용자 상세정보 저장

  /** ✅ 로그인한 사용자 정보 불러오기 */
  const loadUserProfile = async () => {
    try {
      if (!currentUser?.userId) return;
      const profile = await fetchUserProfile(currentUser.userId);
      console.log("✅ 사용자 프로필 로드 완료:", profile);
      setUserProfile(profile);
    } catch (err) {
      console.error("❌ 사용자 프로필 로드 실패:", err);
      message.error("사용자 정보를 불러오지 못했습니다.");
    }
  };

  /** ✅ 문서유형 로드 */
  const loadDocumentTypes = async () => {
    try {
      const res = await fetchDocumentTypes();
      const data = res?.data?.data || res?.data || [];
      const formatted = (data || []).map((t) => ({
        label: t.label || t.name || t.code,
        value: t.code,
      }));
      setDocumentTypes(formatted);
    } catch (err) {
      console.error("❌ 문서유형 데이터 로드 실패:", err);
      message.error("문서유형 정보를 불러오지 못했습니다.");
    }
  };

  /** ✅ 정책 목록 로드 */
  const loadPolicies = async () => {
    setLoading(true);
    try {
      const res = await fetchPolicies();
      console.log("📦 fetchPolicies 응답:", res);
      // ✅ 데이터 구조 안전하게 처리
      const data =
        Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : [];

      setPolicies(data);
    } catch (err) {
      console.error("❌ 정책 목록 로드 실패:", err);
      message.error("정책 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /** ✅ 직급 목록 로드 */
  const loadPositions = async () => {
    try {
      const res = await fetchPositions();
      const data = res?.data?.data || res?.data || res || [];
      const formatted = (data || []).map((pos) => ({
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
    } catch (err) {
      console.error("❌ 직급 데이터 로드 실패:", err);
      message.error("직급 정보를 불러오지 못했습니다.");
    }
  };

  /** ✅ 최초 로딩 시 실행 */
  useEffect(() => {
    loadUserProfile(); // ✅ 사용자 부서 정보 로드
    loadPolicies();
    loadPositions();
    loadDocumentTypes();
  }, []);

  /** ✅ 신규 정책 등록 모달 열기 */
  const openNewPolicyModal = async () => {
    if (positions.length === 0) await loadPositions();
    setSelectKey((prev) => prev + 1);
    setEditingPolicy(null);
    form.resetFields();
    setModalOpen(true);
  };

  /** ✅ 수정 모달 열기 */
  const openEditModal = (policy) => {
    setEditingPolicy(policy);
    form.setFieldsValue({
      policyName: policy.policyName,
      docType: policy.docType,
      approverRoles: policy.steps || [],
    });
    setModalOpen(true);
  };

  /** ✅ 저장 (추가 or 수정) */
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        policyName: values.policyName,
        docType: values.docType,
        steps: values.approverRoles.map((role, index) => ({
          stepOrder: index + 1,
          // ✅ 로그인한 사용자의 부서코드를 userProfile에서 가져옴
          deptName: userProfile?.deptName || "미지정부서",
          positionCode: role,
          empId: userProfile?.empId || 1,
        })),
      };

      console.log("🛰️ 정책 등록 요청 payload:", payload);

      await createPolicy(payload);
      message.success("결재선 정책이 등록되었습니다.");
      setModalOpen(false);
      loadPolicies();
    } catch (err) {
      console.error(err);
      message.error("정책 등록 중 오류가 발생했습니다.");
    }
  };

  /** ✅ 삭제 */
  const handleDelete = (id) => {
    Modal.confirm({
      title: "정말 비활성화하시겠습니까?",
      content: "비활성화된 정책은 다시 활성화해야 사용할 수 있습니다.",
      okText: "비활성화",
      okType: "danger",
      cancelText: "취소",
      onOk: async () => {
        await deactivatePolicy(id);
        message.success("정책이 비활성화되었습니다.");
        loadPolicies();
      },
    });
  };

  /** ✅ 테이블 컬럼 정의 */
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
          .map(
            (s) =>
              `${s.deptName ? `${s.deptName} ` : ""}${
                s.positionName || "-"
              } (${s.stepOrder})`
          )
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
            onClick={() => handleDelete(record.id)}
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

          <Form.Item
            label="결재자 순서 (직급)"
            name="approverRoles"
            rules={[{ required: true, message: "결재자 직급을 선택하세요." }]}
          >
            <Select
              mode="multiple"
              allowClear
              loading={positions.length === 0}
              placeholder="결재 순서에 포함될 직급을 선택하세요"
              style={{ width: "100%" }}
              options={positions}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ApprovalPolicyPage;
