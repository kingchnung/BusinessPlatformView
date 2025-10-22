import { createSlice } from "@reduxjs/toolkit";

const safeParse = (value) => {
  try {
    if (!value || value === "undefined" || value === "null") return null;
    return JSON.parse(value);
  } catch (err) {
    console.warn("⚠️ 잘못된 user 데이터 감지, 초기화합니다:", value, err);
    return null;
  }
};

const savedToken = localStorage.getItem("token");
const savedUser = localStorage.getItem("user");

const initialState = {
  user: savedUser,
  token: savedToken || null,
  isAuthenticated: !!savedToken && !!savedUser, // ✅ 토큰과 유저 모두 있을 때만 로그인 상태 유지
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;


      // ✅ 안전하게 localStorage에도 반영 (중복 저장 방지용)
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // --- 👇 localStorage 저장 로직 추가 ---
      localStorage.setItem('token', token); // 토큰 저장
      localStorage.setItem('user', JSON.stringify(user)); // 사용자 정보 저장 (선택 사항)

      // 역할 정보 저장
      if (user && user.roles && Array.isArray(user.roles)) {
        localStorage.setItem('roles', JSON.stringify(user.roles));
      } else {
        console.warn("User roles not found or not an array in login payload:", user);
        // 역할 정보가 없으면 빈 배열 저장 (SideLayout에서 오류 방지)
        localStorage.setItem('roles', JSON.stringify([]));
      }

    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;


      // ✅ 로그아웃 시 스토리지 초기화
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("refreshToken"); // 있으면 같이 제거

      // --- 👇 로그아웃 시 localStorage에서도 제거 ---
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('roles');

    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
