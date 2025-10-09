import React, { useState } from "react";
import { Form, Input, Button, Card, Space, message, DatePicker, Select, Upload, } from "antd";
import { UploadOutlined, PlusOutlined, MinusCircleOutlined, } from "@ant-design/icons";
import { draftApproval, submitDocument, uploadFile } from "../../api/approvalApi";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;

const ApprovalForm = ({ onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // ✅ 파일 업로드 처리
  const handleFileUpload = async ({ file, onSuccess, onError }) => {
    try {
      const res = await uploadFile(file); // api/approvalApi.js의 uploadFile 사용
      setUploadedFiles((prev) => [...prev, res]); // 서버에서 받은 FileAttachment 데이터 저장
      onSuccess("ok");
      message.success(`${file.name} 업로드 성공`);
    } catch (err) {
      console.error(err);
      onError(err);
      message.error(`${file.name} 업로드 실패`);
    }
  };

  const handleFileChange = ({ fileList }) => setFileList(fileList);

  const handleAction = async (type) => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const data = {
        title: values.title,
        docType: values.docType,
        docContent: {
          reason: values.reason,
          lastWorkDate: values.lastWorkDate.format("YYYY-MM-DD"),
        },
        approvalLine: (values.approvalLine).map((a, idx) => ({
          order: idx + 1,
          approverId: a.approverId,
          decision: "PENDING",
          comment: "",
        })),
        viewerIds: values.viewerIds || [],
        attachments: uploadedFiles,
      };

      const res =
        type === "draft"
          ? await draftApproval(data)
          : await submitDocument(data);

      message.success(
        type === "draft"
          ? `임시저장 완료: ${res.id}`
          : `상신 완료: ${res.id}`
      );

      onUpdate?.();
      form.resetFields();
      setFileList([]);

      if (type === "submit" || type === "draft") navigate("/approvals");
    } catch (err) {
      console.error(err);
      message.error("요청 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="전자결재 작성" variant="borderless" style={{ marginBottom: 24 }}>
      <Form form={form} layout="vertical">
        {/* ✅ 문서 타입 선택 */}
        <Form.Item
          label="문서 유형"
          name="docType"
          rules={[{ required: true, message: "문서 유형을 선택하세요." }]}
        >
          <Select
            placeholder="문서 유형을 선택하세요"
            options={[
              { label: "품의서", value: "REQUEST" },
              { label: "퇴직서", value: "RESIGN" },
              { label: "보고서", value: "REPORT" },
              { label: "인사발령", value: "HR_MOVE" },
            ]}
          />
        </Form.Item>

        {/* 제목 */}
        <Form.Item
          label="제목"
          name="title"
          rules={[{ required: true, message: "제목을 입력해주세요." }]}
        >
          <Input placeholder="제목 입력" />
        </Form.Item>

        {/* 사유 */}
        <Form.Item
          label="사유 / 내용"
          name="reason"
          rules={[{ required: true, message: "사유를 입력해주세요." }]}
        >
          <TextArea rows={4} placeholder="문서 내용을 입력하세요." />
        </Form.Item>

        {/* 날짜 */}
        <Form.Item
          label="예정일 (선택)"
          name="lastWorkDate"
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        {/* 결재자 라인 */}
        <Form.List
          name="approvalLine"
          initialValue={[{ approverId: "" }]} // ✅ 최소 1개 기본 항목
          rules={[
            {
              validator: async (_, line) => {
                if (!line || line.length < 1) {
                  return Promise.reject(new Error("결재자를 최소 1명 이상 추가하세요."));
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }) => (
            <>
              <label style={{ fontWeight: "bold" }}>결재자 라인</label>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{
                    display: "flex",
                    marginBottom: 8,
                    justifyContent: "space-between",
                  }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "approverId"]}
                    rules={[{ required: true, message: "결재자 ID를 입력하세요." }]}
                  >
                    <Input placeholder="결재자 ID 입력 (예: 2001)" />
                  </Form.Item>
                  <Button
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(name)}
                  />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  결재자 추가
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        {/* 열람자 */}
        <Form.Item label="열람자" name="viewerIds">
          <Select
            mode="multiple"
            placeholder="열람자 ID를 선택하세요"
            options={[
              { label: "김대리(4001)", value: "4001" },
              { label: "이주임(4002)", value: "4002" },
              { label: "박과장(4003)", value: "4003" },
            ]}
          />
        </Form.Item>

        {/* 첨부파일 */}
        <Form.Item label="첨부파일">
          <Upload
            name="file" 
            action="http://localhost:8080/api/upload"
            fileList={fileList}
            onChange={handleFileChange}
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.hwp"
          >
            <Button icon={<UploadOutlined />}>파일 업로드</Button>
          </Upload>
        </Form.Item>

        {/* 버튼 */}
        <Space>
          <Button
            type="default"
            onClick={() => handleAction("draft")}
            loading={loading}
          >
            임시저장
          </Button>
          <Button
            type="primary"
            onClick={() => handleAction("submit")}
            loading={loading}
          >
            상신
          </Button>
        </Space>
      </Form>
    </Card>
  );
};

export default ApprovalForm;
