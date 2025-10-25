import { message } from "antd";
import axiosInstance from "../../common/axiosInstance";
import { handleApiError } from "../../util/apiErrorUtil";

/**
 * ==============================
 * ✅ 프로젝트(Project) API 모듈
 * - CRUD + 상태변경(논리삭제)
 * - 권한별 데이터 조회 (일반/관리자)
 * ==============================
 */

/** 1️⃣ 프로젝트 목록 조회 (일반 사용자용 - 진행 중만) */
export const fetchActiveProjects = async () => {
  try {
    const res = await axiosInstance.get("/projects");
    console.log("📋 진행 중 프로젝트 목록:", res.data);
    return res.data || [];
  } catch (error) {
    message.error("프로젝트 목록 조회 실패");
    handleApiError(error);
    return [];
  }
};

/** 2️⃣ 전체 프로젝트 목록 조회 (관리자용 - 종료 포함) */
export const fetchAllProjectsForAdmin = async () => {
  try {
    const res = await axiosInstance.get("/projects/admin");
    console.log("📋 관리자용 전체 프로젝트:", res.data);
    return res.data || [];
  } catch (error) {
    message.error("전체 프로젝트 조회 실패");
    handleApiError(error);
    return [];
  }
};

/** 3️⃣ 프로젝트 상세 조회 */
export const fetchProjectDetail = async (projectId) => {
  try {
    const res = await axiosInstance.get(`/projects/${projectId}`);
    console.log("📄 프로젝트 상세:", res.data);
    return res.data;
  } catch (error) {
    message.error("프로젝트 상세 조회 실패");
    handleApiError(error);
  }
};

/** 4️⃣ 프로젝트 생성 (관리자 전용) */
export const createProjectbyapproval = async (data) => {
  try {
    const res = await axiosInstance.post("/projects/create", data);
    message.success("프로젝트 생성 완료");
    console.log("✅ 프로젝트 생성:", res.data);
    return res.data;
  } catch (error) {
    message.error("프로젝트 생성 실패");
    handleApiError(error);
  }
};

// ✅ 프로젝트 생성
export const createProject = async (payload) => {
  try{
  const res = await axiosInstance.post("/projects/add", payload);
  message.success("프로젝트 생성 완료");
  return res.data;
  } catch (error) {
    message.error("프로젝트 생성 실패");
    handleApiError(error);
  }
};

/** 5️⃣ 프로젝트 수정 (관리자 전용) */
export const updateProject = async (projectId, data) => {
  try {
    const res = await axiosInstance.put(`/projects/${projectId}`, data);
    message.success("프로젝트 수정 완료");
    console.log("✏️ 프로젝트 수정:", res.data);
    return res.data;
  } catch (error) {
    message.error("프로젝트 수정 실패");
    handleApiError(error);
  }
};

/** 6️⃣ 프로젝트 종료 처리 (논리삭제) */
export const closeProject = async (projectId) => {
  try {
    const res = await axiosInstance.patch(`/projects/${projectId}/close`);
    message.success("프로젝트 종료 처리 완료");
    console.log("🧾 프로젝트 종료:", res.data);
    return res.data;
  } catch (error) {
    message.error("프로젝트 종료 실패");
    handleApiError(error);
  }
};

/** ✅ 프로젝트 상태 변경 */
export const updateProjectStatus = async (projectId, status) => {
  try{
  const res = await axiosInstance.patch(`/projects/${projectId}/status`, null, {
    params: { status },
  });
  return res.data;
 } catch (error) {
    message.error("상태 변경 실패");
    handleApiError(error);
 }
};

/** 7️⃣ (선택) 프로젝트명으로 검색 */
export const searchProjectsByName = async (keyword) => {
  try {
    const res = await axiosInstance.get(`/projects/search`, { params: { keyword } });
    console.log("🔍 프로젝트 검색 결과:", res.data);
    return res.data || [];
  } catch (error) {
    message.error("프로젝트 검색 실패");
    handleApiError(error);
    return [];
  }
};
