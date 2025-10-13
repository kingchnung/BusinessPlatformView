import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  message,
  Space,
  Popconfirm,
} from "antd";
import {
  LoginOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, logout } from "../slice/authSlice";
import { jwtDecode } from "jwt-decode";

const LoginSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, token, isAuthenticated } = useSelector((state) => state.auth);

  // ✅ 새로고침 시 Redux 상태 복원
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      dispatch(
        loginSuccess({
          token: savedToken,
          user: JSON.parse(savedUser),
        })
      );
    }
  }, [dispatch]);

  // ✅ 로그인 요청
  const handleLogin = async (values) => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8080/api/auth/login", values);
      console.log("login response:", res.data);
      
      const token = res.data.accessToken;
      const refreshToken = res.data.refreshToken;
      const authorities = res.data.roles?.map((r) => r.authority) || [];

      console.log("🔑 accessToken:", token);
      console.log("🧾 전체 authorities:", authorities);

      if (!token || typeof token != "string") {
        throw new Error("유효하지 않은 토큰입니다.");
      }

      const userRoles = authorities.filter((auth) => auth.startsWith("ROLE_"));
      const userPermissions = authorities.filter((auth) => !auth.startsWith("ROLE_"));

      console.log("🏷️ 역할 목록 (Roles):", userRoles);
      console.log("🔐 권한 목록 (Permissions):", userPermissions);

      const decoded = jwtDecode(token);
      console.log("🧩 decoded token:", decoded);

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("roles", JSON.stringify(userRoles));
      localStorage.setItem("permissions", JSON.stringify(userPermissions));
      localStorage.setItem("user", JSON.stringify(res.data));

      console.log("💾 저장된 roles:", JSON.parse(localStorage.getItem("roles")));
      console.log("💾 저장된 permissions:", JSON.parse(localStorage.getItem("permissions")));
      console.log("💾 저장된 user:", JSON.parse(localStorage.getItem("user")));
      
      
      dispatch(
        loginSuccess({
          token: res.data.accessToken,
          user: res.data,
        })
      );

      message.success(`${res.data.empName}님 환영합니다 👋`);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      message.error("로그인 실패! 아이디 또는 비밀번호를 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(logout());
    message.success("로그아웃 되었습니다 👋");
    navigate("/");
  };

  return (
    <>
      <Space align="center">
        {isAuthenticated ? (
          <>
            <span style={{ color: "#fff", marginRight: 8 }}>
              <UserOutlined style={{ marginRight: 4 }} />
              {user?.empName || user?.username}님 환영합니다 😊
            </span>

            <Popconfirm
              title="로그아웃 하시겠습니까?"
              okText="로그아웃"
              cancelText="취소"
              placement="bottomRight"
              onConfirm={handleLogout}
            >
              <Button
                type="default"
                icon={<LogoutOutlined />}
                style={{
                  borderColor: "#fff",
                  color: "#fff",
                  background: "transparent",
                }}
              >
                로그아웃
              </Button>
            </Popconfirm>
          </>
        ) : (
          <Button
            type="primary"
            icon={<LoginOutlined />}
            onClick={() => setIsModalOpen(true)}
            style={{
              background: "#1890ff",
              border: "none",
              color: "#fff",
              fontWeight: 500,
            }}
          >
            로그인
          </Button>
        )}
      </Space>

      {/* ✅ 로그인 모달 */}
      <Modal
        title="BizMate 로그인"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleLogin}>
          <Form.Item
            label="아이디"
            name="username"
            rules={[{ required: true, message: "아이디를 입력하세요." }]}
          >
            <Input placeholder="아이디 입력" />
          </Form.Item>

          <Form.Item
            label="비밀번호"
            name="password"
            rules={[{ required: true, message: "비밀번호를 입력하세요." }]}
          >
            <Input.Password placeholder="비밀번호 입력" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{
              marginTop: "8px",
            }}
          >
            로그인
          </Button>
        </Form>
      </Modal>
    </>
  );
};

export default LoginSection;
