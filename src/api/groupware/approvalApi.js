import axios from "axios";
import axiosInstance from "../../common/axiosInstance";
import { message } from "antd";

//
// ==============================
// ✅ 전자결재 API 모듈
// ==============================
//

/**
 * 1️⃣ 결재문서 리스트 조회
 */
export const getApprovalList = async (page = 1, size = 10) => {
  try {
    const response = await axiosInstance.get("/approvals", {
      params: { page, size },
    });
    console.log("📄 결재문서 목록:", response.data);
    return response.data;
  } catch (error) {
    message.error("결재문서 목록 조회 실패");
    handleApiError(error);
  }
};

/**
 * 2️⃣ 문서 상세 조회
 */
export const getApprovalDetail = async (docId) => {
  try {
    const response = await axiosInstance.get(`/approvals/${docId}`);
    console.log("📋 문서 상세:", response.data);
    return response.data;
  } catch (error) {
    message.error("문서 상세 조회 실패");
    handleApiError(error);
  }
};

/**
 * 3️⃣ 문서 상신 (Submit)
 */
export const submitDocument = async (dto) => {
  try {
    // 상태 로깅
    console.log("🚀 문서 상신 요청:", dto.status, dto);

    const response = await axiosInstance.post("/approvals/submit", dto);
    message.success("문서가 상신되었습니다 ✅");
    return response.data;
  } catch (error) {
    console.error("❌ 문서 상신 실패:", error);
    message.error("상신 처리 중 오류가 발생했습니다.");
    handleApiError(error);
    throw error;
  }
};

// ✅ 재상신 요청
export const resubmitDocument = async (docId, dto) => {

  const res = await axiosInstance.put(`/approvals/${docId}/resubmit`, dto);

  return res.data;
};



/**
 * 4️⃣ 문서 임시저장 (Draft)
 */
export const draftApproval = async (data) => {
  try {
    const response = await axiosInstance.post("/approvals/draft", data);
    message.success("임시저장 완료");
    console.log("💾 임시저장 성공:", response.data);
    return response.data;
  } catch (error) {
    message.error("임시저장 실패");
    handleApiError(error);
  }
};

/**
 * 5️⃣ 문서 승인 (Approve)
 */
export const approveDocument = async (docId) => {
  try {
    const response = await axiosInstance.put(`/approvals/${docId}/approve`);
    message.success("승인 완료");
    console.log("✅ 승인 성공:", response.data);
    return response.data;
  } catch (error) {
    message.error("승인 처리 실패");
    handleApiError(error);
  }
};

/**
 * 6️⃣ 문서 반려 (Reject)
 */
export const rejectDocument = async (docId, reason) => {
  try {
    const response = await axiosInstance.put(`/approvals/${docId}/reject`, { reason });
    message.success("반려 처리 완료");
    console.log("❌ 반려 성공:", response.data);
    return response.data;
  } catch (error) {
    message.error("반려 처리 실패");
    handleApiError(error);
  }
};

/**
 * 7️⃣ 파일 업로드 (문서 ID 있을 수도 / 없을 수도 있음)
 */
export const uploadFile = async (file, docId = null) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    // 문서ID가 있으면 함께 전송
    if (docId) formData.append("docId", docId);

    const response = await axiosInstance.post("/attachments", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("📎 업로드 성공:", response.data);
    message.success(`${file.name} 업로드 완료`);
    return response.data;
  } catch (error) {
    console.error("❌ 업로드 실패:", error);
    message.error(`${file.name} 업로드 실패`);
    throw error;
  }
};

/**
 * 8️⃣ 파일 미리보기 (새 창)
 */
export const previewFileAxios = async (id) => {
  const res = await axios.get(`http://localhost:8080/api/attachments/preview/${id}`, {
    responseType: "blob", // ✅ 파일 스트림으로 받기
  });

  const blob = new Blob([res.data]);
  const url = window.URL.createObjectURL(blob);
  window.open(url); // 새 탭으로 미리보기
};

/**
 * 9️⃣ 파일 다운로드
 */
export const downloadFile = async (id) => {
  try {
    const response = await axiosInstance.get(`/attachments/download/${id}`, {
      responseType: "blob",
    });
    console.log("📥 파일 다운로드 성공:", response);
    return response;
  } catch (error) {
    message.error("파일 다운로드 실패");
    handleApiError(error);
  }
};

export const getFileList = async (docId) => {
  try {
    const res = await axiosInstance.get(`/attachments/list/${docId}`);
    console.log("📎 첨부파일 목록:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ 첨부파일 목록 조회 실패:", error);
    message.error("첨부파일 목록 조회 실패");
    throw error;
  }
};

// ✅ 논리 삭제 API
export const deleteDocument = async (docId, reason) => {
  const res = await axiosInstance.delete(`/approvals/${docId}`, {
    params: { reason },
  });
  return res.data;
};
