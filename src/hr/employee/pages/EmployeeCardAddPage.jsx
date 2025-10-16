import React, { useState } from "react";
import { Card, message } from "antd";
import { useDispatch } from "react-redux";
import { addEmployee } from "../slice/hrSlice";
import EmployeeCardForm from "../components/EmployeeCardForm";
import { useNavigate } from "react-router-dom";

/**
 * ========================================
 * ✅ EmployeeCardAddPage
 * - 인사카드 등록 페이지 (관리자 전용)
 * - EmployeeCardForm에서 입력받은 데이터 → dispatch(addEmployee)
 * ========================================
 */
const EmployeeCardAddPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  /** 🔹 등록 처리 함수 */
  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      console.log("📤 전송 데이터:", formData);

      // Redux Thunk dispatch → hrSlice.addEmployee
      await dispatch(addEmployee(formData)).unwrap();

      message.success("인사카드 등록이 완료되었습니다 ✅");
      navigate("/hr/employee/cards"); // 목록 페이지로 이동 (필요에 따라 경로 변경)
    } catch (error) {
      console.error("❌ 등록 오류:", error);
      message.error("인사카드 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="인사카드 등록"
      style={{
        margin: 16,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        background: "#fff",
      }}
    >
      <EmployeeCardForm onSubmit={handleSubmit} loading={loading} />
    </Card>
  );
};

export default EmployeeCardAddPage;
