import axiosInstance from "../../common/axiosInstance";
import { message } from "antd";
import { handleApiError } from "../../util/apiErrorUtil"; // 에러 핸들러가 있다면 사용

/**
 * ========================================
 * ✅ 인사발령(Assignment) API 모듈
 * ========================================
 */

/** 1️⃣ 신규 인사발령 등록 (부서 이동 등) */
export const createAssignment = async (assignmentData) => {
  try {
    // 백엔드 컨트롤러의 @PostMapping("/move")와 연결됩니다.
    const res = await axiosInstance.post("/assignments/move", assignmentData);
    // 성공 메시지는 handleSave 함수에서 여러 건을 한 번에 처리하므로 여기서는 생략해도 좋습니다.
    return res.data;
  } catch (error) {
    // 실패 메시지는 여기서 일관되게 처리합니다.
    message.error("인사발령 등록에 실패했습니다.");
    handleApiError(error);
    throw error; // 에러를 다시 던져서 Promise.all이 실패를 인지하도록 합니다.
  }
};

/** 2️⃣ 특정 직원의 발령 이력 전체 조회 */
export const getHistoryByEmployee = async (empId) => {
  try {
    const res = await axiosInstance.get(`/assignments/employee/${empId}`);
    return res.data;
  } catch (error) {
    message.error("직원 발령 이력 조회에 실패했습니다.");
    handleApiError(error);
  }
};

/** 3️⃣ 특정 부서의 발령 이력 전체 조회 */
export const getHistoryByDepartment = async (deptId) => {
  try {
    const res = await axiosInstance.get(`/assignments/department/${deptId}`);
    return res.data;
  } catch (error) {    
    message.error("부서 발령 이력 조회에 실패했습니다.");
    handleApiError(error);
  }
};