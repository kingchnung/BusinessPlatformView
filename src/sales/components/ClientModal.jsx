import React, { useEffect } from "react";
import { Modal, Form, Input, Button, message, Upload, Row, Col } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { registerClient, modifyClient } from "../../api/sales/clientApi";

const ClientModal = ({ open, onClose, clientData, onRefresh }) => {
  const [form] = Form.useForm();
  const isEditing = !!clientData;

  useEffect(() => {
    if (open) {
      if (isEditing) {
        form.setFieldsValue(clientData);
      } else {
        form.resetFields();
      }
    }
  }, [open, clientData, form, isEditing]);

  const handleFinish = async (values) => {
    try {
      // 👇 [수정] 파일 정보를 values 객체에 포함시키는 로직
      const formData = new FormData();
      
      // 파일이 있으면 formData에 추가
      if (values.upload && values.upload[0]) {
        formData.append('file', values.upload[0].originFileObj);
      }
      
      // 나머지 텍스트 데이터를 JSON 형태로 변환하여 추가
      const clientInfo = { ...values };
      delete clientInfo.upload; // 파일 정보는 제외
      formData.append('clientDTO', new Blob([JSON.stringify(clientInfo)], { type: "application/json" }));


      if (isEditing) {
        await modifyClient(clientData.clientNo, formData);
        message.success("거래처 정보가 수정되었습니다.");
      } else {
        await registerClient(formData);
        message.success("신규 거래처가 등록되었습니다.");
      }
      onClose();
      onRefresh();
    } catch (error) {
       // 백엔드에서 오는 에러 메시지를 직접 표시
       const errorMessage = error.response?.data?.message || "처리 중 오류가 발생했습니다.";
       message.error(errorMessage);
    }
  };
  
  // Ant Design Form이 Upload 컴포넌트의 값을 처리하는 방식
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  return (
    <Modal
      title={isEditing ? "거래처 정보 수정" : "신규 거래처 등록"}
      open={open}
      onCancel={onClose}
      footer={null}
      width={800} // 모달 너비 조정
    >
      {/* 👇 [수정] multipart/form-data 전송을 위해 encType 추가 */}
      <Form form={form} layout="vertical" onFinish={handleFinish} encType="multipart/form-data" style={{ marginTop: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              name="clientId" 
              label="사업자 등록번호" 
              rules={[
                { required: true, message: '사업자 등록번호를 입력해주세요.' },
                { pattern: /^[0-9]{10}$/, message: '- 없이 10자리 숫자만 입력해주세요.' }
              ]}
            >
              <Input placeholder="1234567890" maxLength={10} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="clientCompany" label="거래처명" rules={[{ required: true, message: '거래처명을 입력해주세요.' }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="clientCeo" label="대표자명" rules={[{ required: true, message: '대표자명을 입력해주세요.' }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="clientBusinessType" label="업태/종목">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="clientAddress" label="주소">
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="clientContact" label="연락처">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="clientEmail" label="이메일" rules={[{ type: 'email', message: '올바른 이메일 형식이 아닙니다.' }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        
        {/* 👇 [수정] Form이 파일 업로드를 인식하도록 수정 */}
        <Form.Item
          name="upload"
          label="사업자등록증"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload name="logo" action="/upload.do" listType="picture" beforeUpload={() => false}>
            <Button icon={<UploadOutlined />}>파일 선택</Button>
          </Upload>
        </Form.Item>

        <Form.Item name="clientNote" label="비고">
          <Input.TextArea rows={4} />
        </Form.Item>
        <div style={{ textAlign: "right", marginTop: "20px" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>취소</Button>
          <Button type="primary" htmlType="submit">
            {isEditing ? "수정" : "등록"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ClientModal;