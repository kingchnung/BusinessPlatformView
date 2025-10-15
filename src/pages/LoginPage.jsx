import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, Input, Button, Typography, Form, message } from "antd";
import axios from "axios";
import { loginSuccess } from "../slice/authSlice";
import { jwtDecode } from "jwt-decode";

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { username, password } = values;
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        username,
        password,
      });

      const { accessToken } = res.data;

      localStorage.setItem("token", accessToken);

      const decoded = jwtDecode(accessToken);

      const userData = {
        userId : decoded.uid,
        username : decoded.username,
        empName : decoded.empName,
        email : decoded.email || null,
        roles : decoded.roles || [],
      }

      // ✅ localStorage + Redux 저장
      localStorage.setItem("user", JSON.stringify(userData));
      dispatch(loginSuccess({ user: userData, token: accessToken }));

      message.success(`${userData.empName || userData.username}님 환영합니다!`);
      navigate("/");
    } catch (err) {
      console.error("로그인 실패:", err);
      message.error("아이디 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Card style={styles.card} bordered={false} hoverable>
        {/* 로고 + 타이틀 */}
        <div style={styles.logoContainer}>
          <img
            src="/logo_bizmate.png"
            alt="BizMate Logo"
            style={styles.logo}
          />
          <Title level={3} style={styles.title}>
            BizMate 로그인
          </Title>
          <Text type="secondary">
            기업을 위한 통합 관리 플랫폼
          </Text>
        </div>

        {/* 로그인 폼 */}
        <Form layout="vertical" onFinish={onFinish} style={{ marginTop: 24 }}>
          <Form.Item
            label="아이디"
            name="username"
            rules={[{ required: true, message: "아이디를 입력하세요." }]}
          >
            <Input size="large" placeholder="아이디" />
          </Form.Item>

          <Form.Item
            label="비밀번호"
            name="password"
            rules={[{ required: true, message: "비밀번호를 입력하세요." }]}
          >
            <Input.Password size="large" placeholder="비밀번호" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            style={{ marginTop: 10, backgroundColor: "#1677ff" }}
          >
            로그인
          </Button>
        </Form>

        {/* 푸터 영역 */}
        <div style={styles.footer}>
          <Text type="secondary" style={{ fontSize: 12 }}>
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
