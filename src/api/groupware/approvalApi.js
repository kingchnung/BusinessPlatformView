import axios from "axios";
import axiosInstance from "../../common/axiosInstance";
import { message } from "antd";
import { handleApiError } from "../../util/apiErrorUtil";

//
// ==============================
// ✅ 전자결재 API 모듈
// ==============================
//

/**
 * 1️⃣ 결재문서 리스트 조회
 */
export const getApprovalList = async (page = 1, size = 10, status = "", keyword = "") => {
  try {
    const response = await axiosInstance.get("/approvals", {
      params: { page, size, status, keyword },
    });
    console.log("📄 결재문서 목록:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 결재문서 목록 조회 실패:", error);
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
export const resubmitDocument = async (docId, dto, fileList = []) => {

  try {
    const formData = new FormData();

    // ✅ JSON DTO를 문자열 Blob으로 감싸 전송
    formData.append("data", new Blob([JSON.stringify(dto)], { type: "application/json" }));

    // ✅ 새 첨부파일이 있으면 files[]로 추가
    if (fileList && fileList.length > 0) {
      fileList.forEach((file) => {
        formData.append("files", file.originFileObj || file);
      });
    }

    const response = await axiosInstance.put(
      `/approvals/${docId}/resubmit`, 
      formData
    );

    console.log("🔁 [재상신 성공]", response.data);
    return response.data;

  } catch (error) {
    console.error("❌ 재상신 실패:", error);
    message.error("문서 재상신 중 오류가 발생했습니다.");
    throw error;
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
    console.log("📤 승인 요청:", `/approvals/${docId}/approve`);
    const response = await axiosInstance.put(`/approvals/${docId}/approve`);
    message.success("승인 완료");
    console.log("✅ 승인 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 승인 실패:", error);
    message.error("승인 처리 실패");
    handleApiError(error);
  }
};

/**
 * 6️⃣ 문서 반려 (Reject)
 */
export const rejectDocument = async (docId, reason) => {
  try {
    const payload = { reason: reason || "사유 없음" }; // ✅ JSON 객체로 감싸기
    console.log("📤 반려 요청 payload:", payload);
    const response = await axiosInstance.put(`/approvals/${docId}/reject`, payload);
    message.success("반려 처리 완료");
    console.log("🔴 반려 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 반려 실패:", error);
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

    const response = await axiosInstance.post("/approvals/attachments", formData, {
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

export const previewFileAxios = async (id) => {
  try {
    const res = await axiosInstance.get(`/approvals/attachments/preview/${id}`, {
      responseType: "blob", // ✅ 파일 스트림으로 받기
    });

    if (!res || !res.data) {
      throw new Error("파일 데이터가 없습니다.");
    }

    // ✅ MIME 타입 자동 감지
    const contentType = res.headers["content-type"] || "application/octet-stream";

    // ✅ blob 생성
    const blob = new Blob([res.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);

    // ✅ PDF / 이미지 / 기타 형식별 처리
    if (contentType.includes("pdf") || contentType.includes("image")) {
      window.open(url, "_blank");
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers["content-disposition"]
        ? decodeURIComponent(
            res.headers["content-disposition"]
              .split("filename=")[1]
              ?.replaceAll('"', "") || "download"
          )
        : "download";
      a.click();
      a.remove();
    }

    // 브라우저 메모리 해제 (잠시 뒤)
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch (err) {
    console.error("❌ 미리보기 실패:", err);
    message.error("파일 미리보기를 불러올 수 없습니다.");
  }
};

/**
 * 9️⃣ 파일 다운로드
 */
export const downloadFile = async (id) => {
  try {
    const res = await axiosInstance.get(`approvals/attachments/download/${id}`, {
      responseType: "blob",
    });

    const contentType = res.headers["content-type"];
    const blob = new Blob([res.data], { type: contentType });

    const a = document.createElement("a");
    const url = window.URL.createObjectURL(blob);

    // ✅ 파일명 추출
    const fileName = decodeURIComponent(
      res.headers["content-disposition"]
        ?.split("filename=")[1]
        ?.replaceAll('"', "") || "download"
    );

    a.href = url;
    a.download = fileName;
    a.click();

    window.URL.revokeObjectURL(url);
    a.remove();

    message.success("📥 파일 다운로드 완료");
  } catch (err) {
    console.error("❌ 다운로드 실패:", err);
    message.error("파일 다운로드 실패");
  }
};

export const previewPdf = async (docId) => {
  try {
    if (!docId) throw new Error("docId가 없습니다.");

    const res = await axiosInstance.get(`/approvals/pdf/${docId}`, {
      responseType: "blob",
    });

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  } catch (error) {
    console.error("❌ PDF 미리보기 실패:", error);
    message.error("PDF 미리보기 중 오류가 발생했습니다.");
    throw error;
  }
};

export const downloadPdf = async (docId) => {
  try {
    if (!docId) throw new Error("docId가 없습니다.");

    const res = await axiosInstance.get(`/approvals/pdf/${docId}?download=true`, {
      responseType: "blob",
    });

    const blob = new Blob([res.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${docId}.pdf`;
    link.click();
  } catch (error) {
    console.error("❌ PDF 다운로드 실패:", error);
    message.error("PDF 다운로드 중 오류가 발생했습니다.");
    throw error;
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

/**
 * ✅ 관리자용 문서 조회 (검색 포함)
 */
export const getAdminApprovalList = async (page = 1, size = 10, keyword = "") => {
  try {
    const response = await axiosInstance.get("/approvals/admin/all", {
      params: { page, size, keyword },
    });
    return response.data;
  } catch (error) {
    message.error("관리자 문서 목록 조회 실패");
    handleApiError(error);
  }
};

export const forceApprove = (docId, reason) =>
  axiosInstance.put(`/approvals/admin/${docId}/force-approve`, null, {
    params: { reason },
  });

export const forceReject = (docId, reason) =>
  axiosInstance.put(`/approvals/admin/${docId}/force-reject`, null, {
    params: { reason },
  });

// 📄 문서 상태 목록
export const fetchDocumentStatuses = () => axiosInstance.get("/enums/document-status");
