import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    userId: 1001,
    roleId: 10,
    empId: 1001,
    username: "tester",
  },
  token: "mock-jwt-token-123",
};

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    clearUser: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setUser, clearUser } = loginSlice.actions;
export default loginSlice.reducer;