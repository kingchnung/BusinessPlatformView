// 📁 src/approval/component/Resubmit.jsx
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
  Popconfirm,
  List,
} from "antd";
import { UploadOutlined, ArrowLeftOutlined, RedoOutlined, DeleteOutlined } from "@ant-design/icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getApprovalDetail, resubmitDocument } from "../../../api/groupware/approvalApi";

const { Title } = Typography;

const Resubmit = () => {
  const navigate = useNavigate();
  const { docId } = useParams();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(location.state || null);
  const [fileList, setFileList] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("user"));

  // ✅ 문서 로드
  useEffect(() => {
    if (detail && detail.attachments) {
      setExistingFiles(detail.attachments || []);
    }
  }, [detail]);

  // ✅ form 초기값
  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        title: detail.title,
        departmentName: detail.departmentName,
        authorName: detail.authorName,
      });
      console.log("📄 재상신 문서 로드 완료:", detail);
    }
  }, [detail, form]);

  // ✅ 기존 파일 삭제 핸들러
  const handleRemoveExisting = (id) => {
    setExistingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // ✅ 새 파일 업로드 핸들러
  const handleFileChange = ({ fileList: newList }) => {
    setFileList(newList);
  };

  // ✅ 재상신 처리
  const handleResubmit = async (values) => {
    try {
      if (!detail) {
        message.warning("문서 정보를 불러올 수 없습니다.");
        return;
      }

      setLoading(true);

      const updatedDto = {
        ...detail,
        title: values.title,
        docContent: { ...detail.docContent, 수정내용: values.comment || "수정없음" },
        departmentId: detail.department?.deptId || detail.departmentId,
        departmentCode: detail.department?.deptCode || detail.departmentCode,
        departmentName: detail.department?.deptName || detail.departmentName,
        username: currentUser.username,
        userId: currentUser.userId,
        // ✅ 남은 첨부파일 유지
        attachments: existingFiles.map((f) => ({
          id: f.id,
          originalName: f.originalName,
          storedName: f.storedName,
        })),
      };

      console.log("🔁 [재상신 요청 DTO]", updatedDto, fileList);

      await resubmitDocument(detail.id, updatedDto, fileList);

      message.success("문서가 재상신되었습니다 ✅");
      navigate("/approvals");
    } catch (err) {
      console.error("❌ 재상신 실패:", err);
      message.error("문서 재상신 중 오류가 발생했습니다.");
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
          문서 재상신
        </Title>
      </Space>

      <Card bordered style={{ borderRadius: 12 }}>
        <Form
          layout="vertical"
          form={form}
          onFinish={handleResubmit}
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

          <Form.Item label="수정 / 보완 내용" name="comment">
            <Input.TextArea
              rows={4}
              placeholder="반려 사유를 참고하여 보완한 내용을 입력하세요."
            />
          </Form.Item>

          {/* ✅ 기존 첨부파일 목록 출력 */}
          {(existingFiles && existingFiles.length > 0) && (
            <>
              <Divider />
              <Title level={5}>기존 첨부파일</Title>
              <List
                bordered
                dataSource={existingFiles}
                renderItem={(file) => (
                  <List.Item
                    actions={[
                      <Popconfirm
                        title="삭제하시겠습니까?"
                        onConfirm={() => handleRemoveExisting(file.id)}
                        okText="삭제"
                        cancelText="취소"
                      >
                        <Button
                          icon={<DeleteOutlined />}
                          size="small"
                          danger
                          type="text"
                        >
                          삭제
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    {file.originalName}
                  </List.Item>
                )}
              />
            </>
          )}

          <Divider />

          <Form.Item label="새 첨부파일 추가">
            <Upload
              multiple
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
            >
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
                icon={<RedoOutlined />}
                loading={loading}
                style={{ borderRadius: 8 }}
              >
                🔁 재상신
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Resubmit;
