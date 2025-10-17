import React, { useState, useEffect } from "react";
import {  Button,  Form,  Input,  Modal,  message,  Space,  Popconfirm,
} from "antd";
import {
  LoginOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, logout } from "../slice/authSlice";
import { loginUser } from "../api/login/authApi";

const LoginSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);

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
    setLoading(true);
    try {
      // ✅ 1. 분리된 API 함수를 호출하여 로그인 로직을 위임합니다.
      const { user, token, refreshToken } = await loginUser(values);
      

      // ✅ 2. 성공 후 UI 관련 처리만 담당합니다.
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      dispatch(loginSuccess({ user, token }));

      message.success(`${user.empName || user.username}님 환영합니다 👋`);
      setIsModalOpen(false);
      navigate("/main");

    } catch (err) {
      message.error("로그인 실패! 아이디 또는 비밀번호를 확인하세요.", {err});
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
