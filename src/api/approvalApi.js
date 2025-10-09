import axiosInstance from "./axiosInstance";

// 전자결재 문서 리스트 조회
export const getApprovalList = async (page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get("/approvals", {
      params : {page, size},
    });
    
    console.log("Approval List API Response : ", response.data);
    return response.data;

  } catch (error) {
    console.error("리스트 불러오기 실패 : ", error);
    throw error;
  }
};

// 상세 조회
export const getApprovalDetail = async (docId) => {
  const response = await axiosInstance.get(`/approvals/${docId}`);
  return response.data;
};

// 문서 상신
export const submitDocument = async (data) => {
  const response = await axiosInstance.post("/approvals/submit", data);
  return response.data;
};

// 임시저장
export const draftApproval = async (data) => {
  const response = await axiosInstance.post("/approvals/draft", data);
  return response.data;
};

// 승인
export const approveDocument = async (docId) => {
  const response = await axiosInstance.put(`/approvals/${docId}/approve`);
  return response.data;
};

// 반려
export const rejectDocument = async (docId, reason) => {
  const response = await axiosInstance.put(`/approvals/${docId}/reject`, { reason });
  return response.data;
};

//파일 업로드
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axiosInstance.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ✅ 파일 미리보기 (새 창에서 열기)
export const previewFile = (id) => {
  window.open(`http://localhost:8080/api/upload/download/${id}?inline=true`, "_blank");
};

// ✅ 파일 다운로드
export const downloadFile = async (id) => {
  const res = await axiosInstance.get(`/upload/download/${id}`, {
    responseType: "blob",
  });
  return res;
};