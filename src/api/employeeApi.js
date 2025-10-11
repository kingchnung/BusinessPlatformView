import axiosInstance from "./axiosInstance";

// ✅ 직원 전체 목록 불러오기
export const fetchEmployees = async () => {
  const res = await axiosInstance.get("/employees");
  return res.data;
};