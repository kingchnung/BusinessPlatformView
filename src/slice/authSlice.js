import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,   // { userId, empId, roleId, departmentId, name }
  token: null,  // JWT or mock token
  isAuthenticated: false,
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

      // --- 👇 로그아웃 시 localStorage에서도 제거 ---
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('roles');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;