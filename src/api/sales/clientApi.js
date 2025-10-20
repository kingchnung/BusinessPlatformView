import axiosInstance from "../../common/axiosInstance";
import { message } from "antd";
import { handleApiError } from "../../util/apiErrorUtil";

/**
 * 1️⃣ 거래처 목록 조회
 * 백엔드 주소: @GetMapping("/list")
 */
export const getClientList = async (page = 1, size = 10, search, keyword) => {
  try {
   const response = await axiosInstance.get("/sales/client/list", {
   params: { page, size, search, keyword },
    });
     return response.data;
  } catch (error){
     handleApiError(error);
  };
};

/**
 * 2️⃣ 거래처 상세 정보 조회
 * 백엔드 주소: @GetMapping("/{clientNo}")
 */
export const getClient = async (clientNo) => {
  try {
    const response = await axiosInstance.get(`/sales/client/${clientNo}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * 3️⃣ 신규 거래처 등록
 * 백엔드 주소: @PostMapping("/")
 */
export const registerClient = async (clientData) => {
  try {
    const response = await axiosInstance.post("/sales/client/", clientData);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * 4️⃣ 거래처 정보 수정
 * 백엔드 주소: @PutMapping("/{clientNo}")
 */
export const modifyClient = async (clientNo, clientData) => {
  try {
  const response = await axiosInstance.put(`/sales/client/${clientNo}`, clientData);
  return response.data;
    } catch (error) {
    handleApiError(error);
  }
};

/**
 * 5️⃣ 거래처 정보 삭제
 * 백엔드 주소: @DeleteMapping("/{clientNo}")
 */
export const removeClient = async (clientNo) => {
  try{
  const response = await axiosInstance.delete(`/sales/client/${clientNo}`);
  return response.data;
    } catch (error) {
    handleApiError(error);
  }
};

  /**
 * 6️⃣ 여러 거래처 한번에 삭제
 */
export const removeClients = async (clientNos) => {
  try {
  const response = await axiosInstance.delete(`/sales/client/list`,
     { data: clientNos });
  return response.data;
  } catch (error) {
    handleApiError(error);
  }
};