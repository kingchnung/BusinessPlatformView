import axios from "axios";
import store from "../store";

const axiosInstance = axios.create({
    baseURL:"http://localhost:8080/api",
    headers: {
        "Content-Type":"application/json",
        Authorization:"Basic" + btoa("tester:1234"), //임시계정
    },
    withCredentials: true, //CORS + 쿠키 허용
});

// Redux store의 토큰을 매 요청 시 자동으로 포함
axiosInstance.interceptors.request.use((config) => {
  const token = store.getState().auth?.token;
  if(token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;