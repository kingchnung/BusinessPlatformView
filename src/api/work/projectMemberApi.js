import axiosInstance from "../../common/axiosInstance";

/** ✅ 프로젝트별 구성원 조회 */
export const getProjectMembers = async (projectId) => {
  const res = await axiosInstance.get(`/members/project/${projectId}`);
  return res.data;
};

/** ✅ 구성원 추가 */
export const addProjectMember = async (payload) => {
  const res = await axiosInstance.post("/members", payload);
  return res.data;
};

/** ✅ 구성원 역할 변경 */
export const updateProjectMember = async (memberId, payload) => {
  const res = await axiosInstance.patch(`/members/${memberId}`, payload);
  return res.data;
};

/** ✅ 구성원 삭제 */
export const deleteProjectMember = async (memberId) => {
  await axiosInstance.delete(`/members/${memberId}`);
};

/** ✅ 구성원 일괄 동기화 (프로젝트 수정 시 사용) */
export const syncProjectMembers = async (projectId, memberList) => {
  const res = await axiosInstance.put(`/members/project/${projectId}/sync`, memberList);
  return res.data;
};
