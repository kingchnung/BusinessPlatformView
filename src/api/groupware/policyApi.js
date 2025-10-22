import axiosInstance from "../../common/axiosInstance";

/** 결재선 정책 목록 조회 */
export const fetchPolicies = () => axiosInstance.get("/admin/policies");

/** 정책 등록 */
export const createPolicy = (data) => axiosInstance.post("/admin/policies", data);

/** 정책 수정 (선택사항: 별도 API가 있다면 PATCH) */
export const updatePolicy = (id, data) => axiosInstance.patch(`/admin/policies/${id}`, data);

/** 정책 비활성화 */
export const deactivatePolicy = (id) => axiosInstance.patch(`/admin/policies/${id}/deactivate`);

/** 정책 삭제 */
export const deletePolicy = (id) => axiosInstance.delete(`/admin/policies/${id}`);

export const fetchDocumentTypes = () => axiosInstance.get("/enums/document-types");