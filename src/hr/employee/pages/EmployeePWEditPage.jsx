import { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import axiosInstance from "../../../common/axiosInstance";

/**
 * [🔐 EmployeePWEdit.jsx]
 * 로그인한 사용자가 자신의 비밀번호를 변경하는 페이지
 * - 현재 비밀번호 / 새 비밀번호 / 새 비밀번호 확인
 * - 본인 계정만 변경 가능 (백엔드에서 AccessDeniedException 처리)
 */
const EmployeePWEdit = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 로그인 정보(localStorage에서 가져옴)
  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
  console.log(userInfo.userId);
  const userId = userInfo?.userId;

  // 비밀번호 변경 요청 함수
  const onFinish = async (values) => {
    if (values.newPw !== values.confirmPw) {
      message.error("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.put(`/users/${userId}/password`, {
        currentPw: values.currentPw,
        newPw: values.newPw,
      });

      message.success("비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.");
      form.resetFields();

      // 비밀번호 변경 후 자동 로그아웃 (보안상 안전)
      setTimeout(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userInfo");
        window.location.href = "/login";
      }, 1500);
    } catch (error) {
      console.error("비밀번호 변경 실패:", error);
      if (error.response?.status === 403) {
        message.error("본인 계정만 수정할 수 있습니다.");
      } else if (error.response?.data?.message?.includes("일치하지 않습니다")) {
        message.error("현재 비밀번호가 올바르지 않습니다.");
      } else {
        message.error("비밀번호 변경 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="🔐 비밀번호 변경"
      bordered={false}
      style={{
        maxWidth: 480,
        margin: "40px auto",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="현재 비밀번호"
          name="currentPw"
          rules={[{ required: true, message: "현재 비밀번호를 입력해주세요." }]}
        >
          <Input.Password placeholder="현재 비밀번호" />
        </Form.Item>

        <Form.Item
          label="새 비밀번호"
          name="newPw"
          rules={[
            { required: true, message: "새 비밀번호를 입력해주세요." },
            { min: 8, message: "비밀번호는 최소 8자 이상이어야 합니다." },
          ]}
        >
          <Input.Password placeholder="새 비밀번호 (8자 이상)" />
        </Form.Item>

        <Form.Item
          label="새 비밀번호 확인"
          name="confirmPw"
          dependencies={["newPw"]}
          rules={[
            { required: true, message: "비밀번호 확인을 입력해주세요." },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPw") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("비밀번호가 일치하지 않습니다."));
              },
            }),
          ]}
        >
          <Input.Password placeholder="새 비밀번호 확인" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{ marginTop: 10 }}
          >
            비밀번호 변경
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EmployeePWEdit;
