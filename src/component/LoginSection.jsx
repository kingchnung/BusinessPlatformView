import React, { useState, useEffect } from "react";
import {

  Button,
 Form,
 Input,
 Modal,
 message,
 Space,
 Popconfirm,
  Card,
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
import axiosInstance from "../common/axiosInstance";
import { jwtDecode } from "jwt-decode";

const LoginSection = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isFindPwModalOpen, setIsFindPwModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // ✅ 추가
  const [form] = Form.useForm();
  const [findPwForm] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  /* ✅ 새로고침 시 Redux 상태 복원 */
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      dispatch(
        loginSuccess({
          token: savedToken,
          user: {
            ...parsedUser,
            deptName: parsedUser.deptName || "소속 부서 미지정",
            deptCode: parsedUser.deptCode || "-",
            ...parsedUser,
          },
        })
      );
    }
  }, [dispatch]);

  /* ✅ 로그인 요청 */
  const handleLogin = async (values) => {
    setLoading(true);
    setErrorMsg(""); // 초기화

    try {
      const { user, token, refreshToken } = await loginUser(values);

      const decoded = jwtDecode(token);
      console.log("Decoded Token : ", decoded);

      console.log("✅ [Login Response user data]:", JSON.stringify(user, null, 2));

      const userWithDept = {
        ...user,
        deptName: decoded.deptName || "소속 부서 미지정",
        deptCode: decoded.deptCode || "-",
        empName: decoded.empName || user.empName,
        email: decoded.email || user.email,
        username: decoded.username,
      };

      

      // ✅ 2. 성공 후 UI 관련 처리만 담당합니다.
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(userWithDept));
      dispatch(loginSuccess({ user: userWithDept, token }));

      message.success(`${userWithDept.deptName} ${userWithDept.empName}님 환영합니다 👋`);
      setIsLoginModalOpen(false);
      navigate("/main");
    } catch (err) {
      console.error("로그인 실패:", err);

      // ✅ 1️⃣ 서버 응답 확인
      const error =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "로그인에 실패했습니다.";

      // ✅ 2️⃣ 케이스별 메시지 처리
      let displayMsg = "로그인에 실패했습니다.";

      if (error.includes("비밀번호")) {
        // 백엔드에서 "남은 시도" 안내 포함 시 그대로 표시
        displayMsg = error.includes("남은 시도")
          ? `❌ ${error}`
          : "❌ 비밀번호가 일치하지 않습니다. 다시 확인해주세요.";
      } else if (error.includes("사용자를 찾을 수 없습니다")) {
        displayMsg = "❌ 아이디를 확인해주세요. 존재하지 않는 계정입니다.";
      } else if (error.includes("잠금")) {
        displayMsg = "🔒 계정이 잠겼습니다. 관리자에게 문의하세요.";
      }

      message.error(displayMsg);
      setErrorMsg(displayMsg);
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

  /* ✅ 비밀번호 재설정 */
  const handleResetPassword = async (values) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/reset-password", values);
      message.success(
        res.data.message ||
          "임시 비밀번호가 이메일로 전송되었습니다. 로그인 화면으로 돌아갑니다."
      );
      setIsFindPwModalOpen(false);
      setIsLoginModalOpen(true);
    } catch (err) {
      message.error("입력하신 정보와 일치하는 계정을 찾을 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Space align="center">
        {isAuthenticated ? (
          <>
            <span style={{ color: "#fff", marginRight: 8 }}>
              <UserOutlined style={{ marginRight: 4 }} />
              {user?.deptName || "소속 부서 미지정"} {user.empName} 님 환영합니다 😊
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
            onClick={() => setIsLoginModalOpen(true)}
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
        open={isLoginModalOpen}
        onCancel={() => setIsLoginModalOpen(false)}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleLogin}>
          <Form.Item
            label="아이디"
            name="username"
            rules={[{ required: true, message: "아이디를 입력하세요." }]}
            validateStatus={errorMsg.includes("사용자") ? "error" : ""}
          >
            <Input placeholder="아이디 입력" />
          </Form.Item>

          <Form.Item
            label="비밀번호"
            name="password"
            rules={[{ required: true, message: "비밀번호를 입력하세요." }]}
            validateStatus={errorMsg.includes("비밀번호") ? "error" : ""}
            help={
              errorMsg.includes("비밀번호") || errorMsg.includes("남은 시도")
                ? errorMsg
                : ""
            }
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

          <div style={{ textAlign: "right", marginTop: "8px" }}>
            <Button
              type="link"
              onClick={() => {
                setIsLoginModalOpen(false);
                setIsFindPwModalOpen(true);
              }}
            >
              비밀번호를 잊으셨나요?
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ✅ 비밀번호 찾기 모달 */}
      <Modal
        title="비밀번호 재설정"
        open={isFindPwModalOpen}
        onCancel={() => setIsFindPwModalOpen(false)}
        footer={null}
        centered
      >
        <Card bordered={false}>
          <Form
            form={findPwForm}
            layout="vertical"
            onFinish={handleResetPassword}
          >
            <Form.Item
              label="아이디"
              name="username"
              rules={[{ required: true, message: "아이디를 입력하세요." }]}
            >
              <Input placeholder="아이디 입력" />
            </Form.Item>

            <Form.Item
              label="등록된 이메일"
              name="email"
              rules={[
                { required: true, message: "등록된 이메일을 입력하세요." },
              ]}
            >
              <Input placeholder="example@company.com" />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ marginTop: "8px" }}
            >
              임시 비밀번호 발급
            </Button>

            <div style={{ textAlign: "right", marginTop: "8px" }}>
              <Button
                type="link"
                onClick={() => {
                  setIsFindPwModalOpen(false);
                  setIsLoginModalOpen(true);
                }}
              >
                로그인 화면으로 돌아가기
              </Button>
            </div>
          </Form>
        </Card>
      </Modal>
    </>
  );
};

export default LoginSection;
