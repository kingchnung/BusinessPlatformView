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
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;

/**
 * ✅ 관리자용 결재선 정책 관리 페이지
 * - 결재단계, 승인자 직급 등을 설정 가능
 */
const ApprovalPolicyPage = () => {
  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [form] = Form.useForm();

  /** ✅ 더미 데이터 (백엔드 연동 전 테스트용) */
  useEffect(() => {
    setPolicies([
      {
        id: 1,
        policyName: "일반 결재",
        department: "전사 공통",
        steps: 3,
        approverRoles: ["팀장", "부장", "대표이사"],
      },
      {
        id: 2,
        policyName: "지출 결재",
        department: "재무팀",
        steps: 2,
        approverRoles: ["팀장", "이사"],
      },
    ]);
  }, []);

  /** ✅ 신규 추가 버튼 클릭 */
  const openNewPolicyModal = () => {
    setEditingPolicy(null);
    form.resetFields();
    setModalOpen(true);
  };

  /** ✅ 수정 버튼 클릭 */
  const openEditModal = (policy) => {
    setEditingPolicy(policy);
    form.setFieldsValue(policy);
    setModalOpen(true);
  };

  /** ✅ 저장 (추가 또는 수정) */
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const updatedPolicy = {
        ...values,
        approverRoles: values.approverRoles.filter((v) => v),
      };

      if (editingPolicy) {
        setPolicies((prev) =>
          prev.map((p) =>
            p.id === editingPolicy.id ? { ...p, ...updatedPolicy } : p
          )
        );
        message.success("결재선 정책이 수정되었습니다.");
      } else {
        setPolicies((prev) => [
          ...prev,
          { id: Date.now(), ...updatedPolicy },
        ]);
        message.success("새 결재선 정책이 추가되었습니다.");
      }
      setModalOpen(false);
    } catch (err) {
      message.warning("입력값을 확인해주세요.");
    }
  };

  /** ✅ 삭제 */
  const handleDelete = (id) => {
    Modal.confirm({
      title: "정말 삭제하시겠습니까?",
      content: "삭제된 정책은 복구할 수 없습니다.",
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      onOk: () => {
        setPolicies((prev) => prev.filter((p) => p.id !== id));
        message.success("결재선 정책이 삭제되었습니다.");
      },
    });
  };

  /** ✅ 컬럼 정의 */
  const columns = [
    { title: "정책명", dataIndex: "policyName", key: "policyName" },
    { title: "대상 부서", dataIndex: "department", key: "department" },
    {
      title: "결재 단계수",
      dataIndex: "steps",
      key: "steps",
      align: "center",
      render: (steps) => `${steps}단계`,
    },
    {
      title: "결재자 순서",
      dataIndex: "approverRoles",
      key: "approverRoles",
      render: (roles) => roles.join(" → "),
    },
    {
      title: "작업",
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
            삭제
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="결재선 정책 관리"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openNewPolicyModal}>
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
        dataSource={policies}
        pagination={false}
      />

      {/* ✅ 추가/수정 모달 */}
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
            label="대상 부서"
            name="department"
            rules={[{ required: true, message: "대상 부서를 입력하세요." }]}
          >
            <Input placeholder="예: 개발팀 / 재무팀 / 전사공통" />
          </Form.Item>

          <Form.Item
            label="결재 단계 수"
            name="steps"
            rules={[{ required: true, message: "단계 수를 입력하세요." }]}
          >
            <Input type="number" min={1} max={5} placeholder="예: 3" />
          </Form.Item>

          <Form.Item label="결재자 순서 (직급)">
            <Select
              mode="tags"
              placeholder="결재 순서에 포함될 직급을 입력 또는 선택"
              style={{ width: "100%" }}
              name="approverRoles"
            >
              <Option value="사원">사원</Option>
              <Option value="대리">대리</Option>
              <Option value="팀장">팀장</Option>
              <Option value="부장">부장</Option>
              <Option value="대표이사">대표이사</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ApprovalPolicyPage;
