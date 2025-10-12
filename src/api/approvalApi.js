import axios from "axios";
import axiosInstance from "../common/axiosInstance";
import { message } from "antd";

/**
 * 공통 에러 핸들러
 * - JWT 만료 → 로그아웃 및 로그인 페이지로 리다이렉트
 * - 404, 500, 네트워크 등 에러 공통 처리
 */
const handleApiError = (error) => {
  if (error.response) {
    const { status } = error.response;

    switch (status) {
      case 401:
      case 403:
        message.error("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        break;

      case 404:
        message.warning("요청하신 데이터를 찾을 수 없습니다.");
        break;

      case 500:
        message.error("서버 처리 중 오류가 발생했습니다.");
        break;

      default:
        message.warning(`요청 실패 (상태코드: ${status})`);
    }
  } else if (error.request) {
    message.error("서버 응답이 없습니다. 네트워크 연결을 확인하세요.");
  } else {
    message.error(`요청 오류: ${error.message}`);
  }

  console.error("❌ API Error:", error);
  throw error; // 호출한 컴포넌트에서도 추가 처리 가능
};

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
export const submitDocument = async (data) => {
  try {
    const response = await axiosInstance.post("/approvals/submit", data);
    message.success("상신 완료");
    console.log("🚀 문서 상신 성공:", response.data);
    return response.data;
  } catch (error) {
    message.error("문서 상신 실패");
    handleApiError(error);
  }
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
export const uploadFile = async (file, docId) => {
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
export const previewFile = (id) => {
  const token = localStorage.getItem("token");
  const url = `http://localhost:8080/api/upload/download/${id}?inline=true`;
  window.open(url, "_blank");
};

/**
 * 9️⃣ 파일 다운로드
 */
export const downloadFile = async (id) => {
  try {
    const response = await axiosInstance.get(`/upload/download/${id}`, {
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
