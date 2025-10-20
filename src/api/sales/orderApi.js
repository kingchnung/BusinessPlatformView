import axiosInstance from "../../common/axiosInstance";
import { handleApiError } from "../../util/apiErrorUtil";

/**
 * 1️⃣ 주문 목록 조회
 * (백엔드 수정 가능성: 검색/필터링 파라미터 추가)
 */
export const getOrderList = async (page = 1, size = 10 /*, searchParams */) => {
  try {
    const response = await axiosInstance.get("/sales/order/list", {
      params: { page, size /*, ...searchParams */ },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * 2️⃣ 특정 주문 상세 조회 (필요시 사용)
 */
export const getOrder = async (orderId) => {
    try {
        const response = await axiosInstance.get(`/sales/order/${orderId}`);
        return response.data;
    } catch (error) {
        handleApiError(error);
         throw error; 
    }
}


/**
 * 3️⃣ 신규 주문 등록
 */
export const registerOrder = async (orderData) => {
  try {
    const response = await axiosInstance.post("/sales/order/", orderData);
    return response.data; 
  } catch (error) {
    handleApiError(error);
    throw error; 
  }
};

/**
 * 4️⃣ 주문 정보 수정
 */
export const modifyOrder = async (orderId, orderData) => {
  try {
    const response = await axiosInstance.put(`/sales/order/${orderId}`, orderData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * 5️⃣ 주문 삭제
 */
export const removeOrder = async (orderId) => {
  try {
    const response = await axiosInstance.delete(`/sales/order/${orderId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};