// 👇 1. 'Form'에서 useWatch를 사용하기 위해 'Form'을 직접 import (기존 코드와 동일)
import React, { useEffect } from "react";
import { useSelector } from "react-redux"; 
import { Modal, Form, Input, Button, message, Upload, Row, Col, Typography, Switch } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { registerClient, modifyClient } from "../../api/sales/clientApi";
import axiosInstance from "../../common/axiosInstance";

// 백엔드 서버 주소를 변수로 저장 (API 호출 시에도 사용 가능)
const SERVER_URL = "http://localhost:8080";

const ClientModal = ({ open, onClose, clientData, onRefresh }) => {
  const [form] = Form.useForm();
  const isEditing = !!clientData;
  const { user: currentUser } = useSelector((state) => state.auth);

  // 'businessLicenseFile' 필드값을 실시간으로 감시
  const fileList = Form.useWatch('businessLicenseFile', form);
  // 파일 목록이 비어있는지 여부에 따라 'disabled' 상태 계산
  const isSwitchDisabled = !fileList || fileList.length === 0;

  useEffect(() => {
    if (open) {
      if (isEditing) {
        // [수정 모드]
        const modifiedData = { 
          ...clientData,
          clientId: clientData.clientId.replaceAll("-", ""),
          writerInfo: `${clientData.writer} (${clientData.userId})`,
          businessLicenseFile: clientData.businessLicenseFile
            ? [{ 
                uid: "-1", 
                name: clientData.businessLicenseFile, 
                status: "done",
                // 다운로드 URL을 API 엔드포인트로 설정
                url: `${SERVER_URL}/api/files/download/${clientData.businessLicenseFile}` 
              }]
            : [],
        };
        form.setFieldsValue(modifiedData);
      } else {
        // [등록 모드]
        form.resetFields();

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
        const day = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        form.setFieldsValue({ 
          validationStatus: false,
          writerInfo: currentUser ? `${currentUser.empName} (${currentUser.username})` : "로그인 정보 없음",
          registrationDate: formattedDate 
        });
      }
    }
  }, [open, clientData, form, isEditing, currentUser]);
  
  // 파일이 제거되어 Switch가 비활성화되면, 값을 '대기(false)'로 리셋합니다.
  useEffect(() => {
    if (isSwitchDisabled) {
      form.setFieldsValue({ validationStatus: false });
    }
  }, [isSwitchDisabled, form]);

 const handleDownload = async (file) => {
    if (!file || !file.name) {
      message.error("잘못된 파일 정보입니다.");
      return;
    }
    try {
      // axiosInstance를 사용해서 GET 요청 (토큰 자동 포함됨)
      const response = await axiosInstance.get(`/files/download/${file.name}`, {
        responseType: 'blob', // 응답을 Blob 형태로 받음
      });

      // Blob 데이터를 사용해 다운로드 링크 생성 및 클릭
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name); // 다운로드될 파일 이름 설정
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link); // 링크 제거
      window.URL.revokeObjectURL(url); // 메모리 해제

    } catch (error) {
      console.error("파일 다운로드 실패:", error);
      // 백엔드에서 오는 에러 메시지(JSON 형태)를 처리할 수도 있습니다.
      if (error.response && error.response.data instanceof Blob && error.response.data.type === "application/json") {
          const reader = new FileReader();
          reader.onload = function() {
              const errorData = JSON.parse(this.result);
              message.error(errorData.message || "파일 다운로드에 실패했습니다.");
          }
          reader.readAsText(error.response.data);
      } else {
          message.error("파일 다운로드에 실패했습니다.");
      }
    }
  };

  const handleFinish = async (values) => {
    try {
      const formData = new FormData();
      
      const fileList = values.businessLicenseFile || [];
      const newFile = fileList.length > 0 ? fileList[0] : null;

      if (newFile && newFile.originFileObj) {
        formData.append('file', newFile.originFileObj);
      }
      
      const clientInfo = { ...values };

      if (fileList.length === 0) {
        clientInfo.businessLicenseFile = null;
      } 
      else if (newFile && !newFile.originFileObj) {
        clientInfo.businessLicenseFile = newFile.name;
      } 
      else if (newFile && newFile.originFileObj) {
         delete clientInfo.businessLicenseFile;
      }

      delete clientInfo.writerInfo;
      delete clientInfo.registrationDate;
      
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
       const errorMessage = error.response?.data?.message || "처리 중 오류가 발생했습니다.";
       message.error(errorMessage);
    }
  };
  
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  return (
    <Modal
      title={isEditing ? "거래처 상세 및 수정" : "신규 거래처 등록"}
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} encType="multipart/form-data" style={{ marginTop: 24 }}>
        
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="registrationDate" label="등록일">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="writerInfo" label="담당자 (ID)">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
        </>
        
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
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="businessLicenseFile"
              label="사업자등록증"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload 
                name="logo" 
                action="/upload.do" 
                listType="picture" 
                beforeUpload={() => false}
                maxCount={1}
                // onPreview 핸들러 추가: 파일명 클릭 시 url 열기
                onPreview={handleDownload}
              >
                <Button icon={<UploadOutlined />}>파일 선택</Button>
              </Upload>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="validationStatus"
              label="사업자등록증 진위여부"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="완료" 
                unCheckedChildren="대기"
                disabled={isSwitchDisabled}
              />
            </Form.Item>
          </Col>
        </Row>

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