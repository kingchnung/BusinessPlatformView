import axiosInstance from "../../common/axiosInstance";
import { handleApiError } from "../../util/apiErrorUtil";
import { message } from "antd";

/**
 * ======================================
 * ✅ Departments API
 * - 부서 목록 조회 (트리 생성용)
 * - 단일 부서 조회
 * - 신규 부서 등록
 * - 부서 수정 / 삭제
 * ======================================
 */

/** 1️⃣ 전체 부서 목록 조회 */
export const fetchDepartments = async () => {
  try {
    const res = await axiosInstance.get("/departments");
    console.log("🏢 부서 목록:", res.data);
    return res.data;
  } catch (error) {
    message.error("부서 목록 조회 실패");
    handleApiError(error);
    throw error;
  }
};

/** 2️⃣ 단일 부서 조회 */
export const fetchDepartmentDetail = async (deptId) => {
  try {
    const res = await axiosInstance.get(`/departments/${deptId}`);
    console.log("📋 부서 상세:", res.data);
    return res.data;
  } catch (error) {
    message.error("부서 상세 조회 실패");
    handleApiError(error);
    throw error;
  }
};

/** 3️⃣ 신규 부서 등록 */
export const createDepartment = async (data) => {
  try {
    const res = await axiosInstance.post("/departments/add", data);
    message.success("부서 등록 완료");
    return res.data;
  } catch (error) {
    message.error("부서 등록 실패");
    handleApiError(error);
    throw error;
  }
};

/** 4️⃣ 부서 수정 */
export const updateDepartment = async (deptId, data) => {
  try {
    const res = await axiosInstance.put(`/departments/${deptId}`, data);
    message.success("부서 정보 수정 완료");
    return res.data;
  } catch (error) {
    message.error("부서 수정 실패");
    handleApiError(error);
    throw error;
  }
};

/** 5️⃣ 부서 삭제 */
export const deleteDepartment = async (deptId) => {
  try {
    const res = await axiosInstance.delete(`/departments/${deptId}`);
    message.success("부서 삭제 완료");
    return res.data;
  } catch (error) {
    message.error("부서 삭제 실패");
    handleApiError(error);
    throw error;
  }
};
