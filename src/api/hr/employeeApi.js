

import { message } from "antd";
import axiosInstance from "../../common/axiosInstance";
import { handleApiError } from "../../util/apiErrorUtil";

/**
 * ==============================
 * ✅ 직원(Employee) API 모듈
 * - CRUD + 검색 + 상태변경
 * ==============================
 */

/** 1️⃣ 전체 직원 목록 조회 */
export const fetchEmployees = async (page = 1, size = 10) => {
  try {
    const res = await axiosInstance.get("/employees", { params: { page, size } });
    const data = res.data;
    console.log("👥 직원 목록:", data);

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.dtoList)) return data.dtoList;
    if (Array.isArray(data?.data)) return data.data;

    console.warn("⚠️ 예상치 못한 employees 응답 구조:", data);
    return []; // fallback
  } catch (error) {
    message.error("직원 목록 조회 실패");
    handleApiError(error);
    return []; // ✅ 실패 시도에도 배열 반환
  }
};

/** 2️⃣ 직원 상세 조회 */
export const fetchEmployeeDetail = async (empId) => {
  try {
    const res = await axiosInstance.get(`/employees/${empId}`);
    console.log("📋 직원 상세:", res.data);
    return res.data;
  } catch (error) {
    message.error("직원 정보 조회 실패");
    handleApiError(error);
  }
};

/** 3️⃣ 신규 직원 등록 */
export const createEmployee = async (data) => {
  try {
    const res = await axiosInstance.post("/employees/add", data);
    message.success("직원 등록 완료");
    console.log("✅ 직원 등록:", res.data);
    return res.data;
  } catch (error) {
    message.error("직원 등록 실패");
    handleApiError(error);
  }
};

/** 4️⃣ 직원 정보 수정 */
export const updateEmployee = async (empId, data) => {
  try {
    const res = await axiosInstance.put(`/employees/${empId}`, data);
    message.success("직원 정보 수정 완료");
    console.log("✏️ 직원 수정:", res.data);
    return res.data;
  } catch (error) {
    message.error("직원 정보 수정 실패");
    handleApiError(error);
  }
};

export const updateMyInfo = async (values) => {
  const res = await axiosInstance.put(`/employees/me`, values);
  return res.data;
};

/** 5️⃣ 직원 삭제 */
export const deleteEmployee = async (empId) => {
  try {
    const res = await axiosInstance.delete(`/employees/${empId}`);
    message.success("직원 삭제 완료");
    console.log("🗑️ 직원 삭제:", res.data);
    return res.data;
  } catch (error) {
    message.error("직원 삭제 실패");
    handleApiError(error);
  }
};
