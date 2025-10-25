import axiosInstance from "../../common/axiosInstance";
import { handleApiError } from "../../util/apiErrorUtil";

/**
 * 1️⃣ 매출 목표 목록 조회
 * (백엔드 수정 필요: targetYear를 기준으로 필터링)
 */
export const getSalesTargetList = async (page = 1, size = 10, year) => {
  try {
    const response = await axiosInstance.get("/sales/salesTarget/list", {
      params: { page, size, year },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * 2️⃣ 신규 매출 목표 등록
 */
export const registerSalesTarget = async (targetData) => {
  try {
    const response = await axiosInstance.post("/sales/salesTarget/", targetData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error; // Modal에서 에러 메시지를 표시하기 위해 re-throw
  }
};

/**
 * 3️⃣ 매출 목표 수정
 */
export const modifySalesTarget = async (targetId, targetData) => {
  try {
    const response = await axiosInstance.put(`/sales/salesTarget/${targetId}`, targetData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * 4️⃣ 매출 목표 삭제
 */
export const removeSalesTarget = async (targetId) => {
  try {
    const response = await axiosInstance.delete(`/sales/salesTarget/${targetId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * 5️⃣ 여러 매출 목표 한번에 삭제
 */
export const removeSalesTargets = async (targetIds) => {
  try {
    const response = await axiosInstance.delete(`/sales/salesTarget/list`, {
      data: targetIds
    });
    return response.data; 
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};