import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Input, Button, Typography, Form, message } from "antd";
import axiosInstance from "../common/axiosInstance";

const { Title, Text } = Typography;

export default function FindPassword() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleResetPassword = async (values) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/reset-password", values);
      message.success(
        res.data.message ||
          "임시 비밀번호가 이메일로 전송되었습니다. 로그인 화면으로 돌아갑니다."
      );
      navigate("/login");
    } catch (err) {
      console.error("비밀번호 재설정 실패:", err);
      message.error("입력하신 정보와 일치하는 계정을 찾을 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Card style={styles.card} bordered={false} hoverable>
        {/* 로고 + 타이틀 */}
        <div style={styles.logoContainer}>
          <img src="/logo_bizmate.png" alt="BizMate Logo" style={styles.logo} />
          <Title level={3} style={styles.title}>
            비밀번호 재설정
          </Title>
          <Text type="secondary">등록된 이메일로 임시 비밀번호를 발급합니다</Text>
        </div>

        {/* 비밀번호 재설정 폼 */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleResetPassword}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            label="아이디"
            name="username"
            rules={[{ required: true, message: "아이디를 입력하세요." }]}
          >
            <Input size="large" placeholder="아이디" />
          </Form.Item>

          <Form.Item
            label="등록된 이메일"
            name="email"
            rules={[{ required: true, message: "등록된 이메일을 입력하세요." }]}
          >
            <Input size="large" placeholder="example@company.com" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            style={{ marginTop: 10, backgroundColor: "#1677ff" }}
          >
            임시 비밀번호 발급
          </Button>
        </Form>

        {/* 푸터 영역 */}
        <div style={styles.footer}>
          <Button type="link" onClick={() => navigate("/login")}>
            로그인 화면으로 돌아가기
          </Button>
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 12 }}>
            ⓒ 2025 BizMate Inc. All rights reserved.
          </Text>
        </div>
      </Card>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #f0f5ff 0%, #ffffff 100%)",
  },
  card: {
    width: 380,
    padding: "20px 30px",
    borderRadius: 16,
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  logoContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 70,
    marginBottom: 8,
  },
  title: {
    marginBottom: 4,
    color: "#1677ff",
    fontWeight: 600,
  },
  footer: {
    marginTop: 24,
  },
};
