import axiosInstance from "../../common/axiosInstance";
import { handleApiError } from "../../util/apiErrorUtil";

/**
 * 1️⃣ 주문 목록 조회
 */
// 👇 startDate, endDate 파라미터 추가
export const getOrderList = async (  
  page = 1,
  size = 10,
  search,
  keyword,
  startDate,
  endDate,
  minAmount, 
  maxAmount ) => {
  try {
    const response = await axiosInstance.get("/sales/order/list", {
      // 👇 params에 startDate, endDate 추가
      params: { page, size, search, keyword, startDate, endDate, minAmount, maxAmount },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error; // 에러를 다시 던져서 slice에서 처리하도록 함
  }
};

/**
 * 2️⃣ 특정 주문 상세 조회
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

/**
 * 6️⃣ 여러 주문 한번에 삭제
 */
export const removeOrders = async (orderIds) => {
  try {
    const response = await axiosInstance.delete(`/sales/order/list`, {
      data: orderIds
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

