import React, { useState } from "react";
import { draftDocument } from "../../api/approvalApi";

const ApprovalForm = () => {
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      title,
      docType: "RESIGN",
      departmentId: 2,
      userId: 1001,
      roleId: 10,
      empId: 1001,
      docContent: { reason, lastWorkDate: "2025-10-31" },
      approvalLine: [
        { order: 1, approverId: "2001", decision: "PENDING", comment: "" },
        { order: 2, approverId: "3001", decision: "PENDING", comment: "" },
      ],
    };

    try {
      const res = await draftDocument(data);
      alert(`문서 저장 완료: ${res.id}`);
    } catch (err) {
      console.error(err);
      alert("오류 발생!");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>전자결재 작성</h2>
      <input
        type="text"
        placeholder="제목 입력"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="퇴직 사유"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <button type="submit">임시저장</button>
    </form>
  );
};

export default ApprovalForm;