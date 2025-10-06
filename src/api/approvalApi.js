import axiosInstance from "./axiosInstance";

// 전자결재 문서 리스트 조회
export const fetchApprovalList = async (params) => {
  const response = await axiosInstance.get("/approvals", { params });
  return response.data;
};

// 단건 조회
export const fetchApprovalDetail = async (docId) => {
  const response = await axiosInstance.get(`/approvals/${docId}`);
  return response.data;
};

// 문서 상신
export const submitApproval = async (data) => {
  const response = await axiosInstance.post("/approvals/submit", data);
  return response.data;
};

// 임시저장
export const draftApproval = async (data) => {
  const response = await axiosInstance.post("/approvals/draft", data);
  return response.data;
};

// 승인
export const approveDocument = async (docId, body) => {
  const response = await axiosInstance.put(`/approvals/${docId}/approve`, body);
  return response.data;
};

// 반려
export const rejectDocument = async (docId, body) => {
  const response = await axiosInstance.put(`/approvals/${docId}/reject`, body);
  return response.data;
};