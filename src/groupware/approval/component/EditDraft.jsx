// 📁 src/approval/component/EditDraft.jsx
import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  message,
  Typography,
  Divider,
  Upload,
} from "antd";
import { UploadOutlined, ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getApprovalDetail, submitDocument } from "../../../api/groupware/approvalApi";

const { Title } = Typography;

const EditDraft = () => {
  const navigate = useNavigate();
  const { docId } = useParams();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(location.state || null);
  const currentUser = JSON.parse(localStorage.getItem("user"));

  // ✅ 문서 조회
  useEffect(() => {
    const fetchDetail = async () => {
      if (detail) return;
      try {
        const res = await getApprovalDetail(docId);
        setDetail(res);
      } catch (err) {
        console.error("❌ 문서 상세 조회 실패:", err);
        message.error("문서 정보를 불러올 수 없습니다.");
      }
    };
    fetchDetail();
  }, [docId]);

  // ✅ form 초기값
  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        title: detail.title,
        departmentName: detail.departmentName,
        authorName: detail.authorName,
      });
    }
  }, [detail, form]);

  // ✅ 재작성 (상신)
  const handleSubmit = async (values) => {
    try {
      if (!detail) return;
      setLoading(true);

      const dto = {
        ...detail,
        title: values.title,
        docContent: { ...detail.docContent, 수정내용: values.comment || "수정없음" },
        departmentId: detail.departmentId,
        departmentCode: detail.departmentCode,
        username: currentUser.username,
        userId: currentUser.userId,
      };

      console.log("📝 [임시저장 재작성 상신 DTO]", dto);

      await submitDocument(dto);
      message.success("문서가 상신되었습니다 ✅");
      navigate("/approvals");
    } catch (err) {
      console.error("❌ 임시저장 문서 상신 실패:", err);
      message.error("상신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!detail) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <p>문서 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Space align="center" style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          type="default"
          style={{ borderRadius: 6 }}
        >
          뒤로가기
        </Button>
        <Title level={4} style={{ margin: 0 }}>
          임시저장 문서 재작성
        </Title>
      </Space>

      <Card bordered style={{ borderRadius: 12 }}>
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          disabled={loading}
        >
          <Form.Item label="문서 ID" name="id" initialValue={detail.id}>
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="제목"
            name="title"
            rules={[{ required: true, message: "제목을 입력하세요." }]}
          >
            <Input placeholder="문서 제목을 입력하세요." />
          </Form.Item>

          <Form.Item label="부서명" name="departmentName">
            <Input disabled />
          </Form.Item>

          <Form.Item label="작성자" name="authorName">
            <Input disabled />
          </Form.Item>

          <Divider />

          <Form.Item label="보완 내용" name="comment">
            <Input.TextArea
              rows={4}
              placeholder="보완할 내용을 입력하세요."
            />
          </Form.Item>

          <Form.Item label="첨부파일">
            <Upload multiple beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>파일 선택</Button>
            </Upload>
          </Form.Item>

          <Divider />

          <Form.Item>
            <Space style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                onClick={() => navigate(-1)}
                icon={<ArrowLeftOutlined />}
                style={{ borderRadius: 8 }}
              >
                취소
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<EditOutlined />}
                loading={loading}
                style={{ borderRadius: 8 }}
              >
                ✏️ 재작성 상신
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditDraft;
