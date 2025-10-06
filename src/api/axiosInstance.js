import axios from "axios";

const axiosInstance = axios.create({
    baseURL:"http://localhost:8080/api",
    headers: {
        "Content-Type":"application/json",
        Authorization:"Basic" + btoa("tester:1234"), //임시계정
    },
    withCredentials: false,
});

// 요청 인터셉터 (로그 찍기용)
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 (공통 에러 처리)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Response Error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;