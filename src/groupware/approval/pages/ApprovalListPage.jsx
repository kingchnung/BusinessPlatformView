import React, { useState } from "react";
import ApprovalList from "../component/ApprovalList";
import MainLayout from "../../../layouts/MainLayout";
import { Modal } from "antd";
import ApprovalForm from "../component/ApprovalForm";

const ApprovalListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setIsModalOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <MainLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>전자결재 문서함</h2>
        <button
          onClick={() => setIsModalOpen(true)}
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
      {/* ✅ ApprovalForm을 모달로 표시 */}
      <Modal
        title="전자결재 작성"
        open={isModalOpen}
        footer={null}
        width={700}
        centered
        onCancel={() => setIsModalOpen(false)}
        maskClosable={false}
      >
        <ApprovalForm onSuccess={handleSuccess} />
      </Modal>
      <ApprovalList key={refreshKey}/>
    </MainLayout>
  );
};

export default ApprovalListPage;