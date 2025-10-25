import axios from "axios";
import { message } from "antd";

// ✅ 1️⃣ Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: { "Content-Type": "application/json",  },
});

// ✅ 2️⃣ 요청 인터셉터 - JWT 자동 첨부
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 3️⃣ 응답 인터셉터 - 만료/연결 실패 감지
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // --- (1) 서버 다운 or 연결 실패 시 ---
    if (!error.response || error.code === "ERR_NETWORK") {
      message.error("서버 연결이 끊어졌습니다. 다시 로그인해주세요.");
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // --- (2) Access Token 만료 시 (401 처리) ---
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 루프 방지
      try {
        
        const res = await axios.post(
          "http://localhost:8080/api/auth/refresh",
          {},
          { withCredentials: true }
        );

        const { accessToken, user } = res.data;
        if (accessToken) {
        localStorage.setItem("token", accessToken);
        if (user) localStorage.setItem("user", JSON.stringify(user));

        axiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error("🔒 Refresh Token 만료 또는 유효하지 않음:", refreshError);
        message.warning("세션이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ✅ 4️⃣ (선택) 주기적 서버 헬스체크 (10분마다)
const startHealthCheck = (intervalMs = 600000) => {
  setInterval(async () => {
    try {
      await axiosInstance.get("/health");
    } catch {
      message.error("서버 연결이 끊어졌습니다. 다시 로그인해주세요.");
      localStorage.clear();
      window.location.href = "/login";
    }
  }, intervalMs);
};
startHealthCheck(600000);

export default axiosInstance;
