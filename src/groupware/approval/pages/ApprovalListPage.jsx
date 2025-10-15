import React from "react";
import { useNavigate } from "react-router-dom";
import MainPage from "../../../pages/MainPage";
import ApprovalList from "../component/ApprovalList";
import MainLayout from "../../../layouts/MainLayout";

const ApprovalListPage = () => {
  const navigate = useNavigate();

  const handleGoToDraft = () => {
    navigate("/approvals/draft"); // ✅ /draft 페이지로 이동
  };

  return (
    <MainLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>전자결재 문서함</h2>
        <button
          onClick={handleGoToDraft}
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          + 새 문서 작성
        </button>
      </div>

      <hr style={{ margin: "20px 0" }} />

      {/* 결재문서 목록 컴포넌트 */}
      <ApprovalList />
    </MainLayout>
  );
};

export default ApprovalListPage;