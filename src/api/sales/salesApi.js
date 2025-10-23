import axiosInstance from "../../common/axiosInstance";

export const listSales = async (params) => {
  const { data } = await axiosInstance.get("/sales/sales/list", {
    params: params,
  });
  return data; // PageResponseDTO<SalesDTO>
};

export const getSales = async (salesId) => {
  const { data } = await axiosInstance.get(`/sales/sales/${salesId}`);
  return data; // SalesDTO
};

export const registerSales = async (payload) => {
  // 백엔드가 salesDate와 salesId를 서버에서 세팅
  const { data } = await axiosInstance.post("/sales/sales/", payload);
  return data; // { SalesId: "YYYYMMDD-####" }
};

export const modifySales = async (salesId, payload) => {
  const { data } = await axiosInstance.put(`/sales/sales/${salesId}`, payload);
  return data; // { RESULT: "SUCCESS" }
};

export const removeSales = async (salesId) => {
  const { data } = await axiosInstance.delete(`/sales/sales/${salesId}`);
  return data; // { RESULT: "SUCCESS" }
};

export const listSalesByClient = async (clientId) => {
  const { data } = await axiosInstance.get(`/sales/sales/client/${clientId}`);
  return data; // List<SalesDTO>
};
