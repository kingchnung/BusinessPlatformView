import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Spin } from "antd";
import axiosInstance from "../../../common/axiosInstance";
import { updateMyInfo } from "../../../api/hr/employeeApi";
import { useNavigate } from "react-router-dom";

const EmployeeMyEditPage = () => {
  const [form] = Form.useForm();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  
  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const res = await axiosInstance.get(`/employees/me`);
        const emp = res.data;
        setEmployee(emp);
        // 폼 초기화
        form.setFieldsValue({
          phone: emp.phone || "",
          email: emp.email || "",
          address: emp.address || "",
        });
      } catch (err) {
        console.error("인사카드 불러오기 오류: ", err)
        message.error("내 인사카드를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyInfo();
    
    },[form]);


  const onFinish = async (values) => {
    try {
      await updateMyInfo(values);
      message.success("내 인사카드가 수정되었습니다.");
      navigate("/hr/employee/cards");
    } catch (err) {
      console.error(err);
      message.error("수정 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" tip="내 인사카드 정보를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>내 인사카드 수정</h2>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="전화번호"
          name="phone"
          rules={[{ required: true, message: "전화번호를 입력하세요." }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="이메일"
          name="email"
          rules={[
            { required: true, message: "이메일을 입력하세요." },
            { type: "email", message: "유효한 이메일 형식이 아닙니다." },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="주소"
          name="address"
          rules={[{ required: true, message: "주소를 입력하세요." }]}
        >
          <Input.TextArea rows={2} />
        </Form.Item>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Button type="primary" htmlType="submit" style={{ width: 200 }}>
            수정하기
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EmployeeMyEditPage;
