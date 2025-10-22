import React, { useEffect, useState } from "react";
import ApprovalList from "../component/ApprovalList";
import { Modal } from "antd";
import ApprovalForm from "../component/ApprovalForm";
import { useLocation } from "react-router-dom";

const ApprovalListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const location = useLocation();

  // ✅ URL에서 status 파라미터 읽기
  const searchParams = new URLSearchParams(location.search);
  const status = searchParams.get("status") || "ALL";

  // ✅ 문서 상태 한글 매핑 (선택사항)
  const statusLabel = {
    ALL: "전체 문서",
    DRAFT: "임시저장 문서",
    IN_PROGRESS: "결재 대기 문서",
    APPROVED: "승인 문서",
    REJECTED: "반려 문서",
  };

  // ✅ status가 바뀔 때마다 ApprovalList 갱신
  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [status]);

  const handleSuccess = () => {
    setIsModalOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
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
      <ApprovalList key={refreshKey} status={status} />
    </>
  );
};

export default ApprovalListPage;