import React, { useState, useEffect } from "react";
import {  Button,  Form,  Input,  Modal,  message,  Space,  Popconfirm,
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
import { jwtDecode } from "jwt-decode"; // ✅ 수정: 구조 분해 말고 직접 import

const LoginSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, token, isAuthenticated } = useSelector((state) => state.auth);

  /* ✅ 새로고침 시 Redux 상태 복원 */
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      dispatch(loginSuccess({ token: savedToken, user: JSON.parse(savedUser) }));
    }
  }, [dispatch]);

  /* ✅ 로그인 요청 */
  const handleLogin = async (values) => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8080/api/auth/login", values);
      console.log("🔐 login response:", res.data);

      const accessToken = res.data.accessToken;
      const refreshToken = res.data.refreshToken;

      if (!accessToken) throw new Error("AccessToken이 없습니다.");

      // ✅ 토큰 디코딩
      const decoded = jwtDecode(accessToken);
      console.log("🧩 decoded token:", decoded);

      // ✅ 역할 분류
      const authorities = res.data.roles?.map((r) => r.authority) || [];
      const userRoles = authorities.filter((auth) => auth.startsWith("ROLE_"));
      const userPermissions = authorities.filter((auth) => !auth.startsWith("ROLE_"));

      // ✅ 사용자 정보 정리 (명시적)
      const userData = {
        userId: decoded.uid,        // 서버 DB PK
        username: decoded.username, // 사번
        empName: decoded.empName,   // 이름
        email: decoded.email,       // 이메일
        roles: userRoles,
        permissions: userPermissions,
      };

      // ✅ 저장
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      dispatch(loginSuccess({ token: accessToken, user: userData }));

      message.success(`${userData.empName || userData.username}님 환영합니다 👋`);
      setIsModalOpen(false);
      navigate("/main");
    } catch (err) {
      console.error("❌ 로그인 실패:", err);
      message.error("로그인 실패! 아이디 또는 비밀번호를 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  /* ✅ 로그아웃 */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
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
              {user?.username} {user?.empName} 님 환영합니다 😊
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
            style={{ marginTop: "8px" }}
          >
            로그인
          </Button>
        </Form>
      </Modal>
    </>
  );
};

export default LoginSection;
