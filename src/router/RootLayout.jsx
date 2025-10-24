import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../slice/authSlice";

export default function RootLayout() {
  const dispatch = useDispatch();

  
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (savedToken && savedUser) {
      dispatch(loginSuccess({ token: savedToken, user: JSON.parse(savedUser) }));
    }
  }, [dispatch]);

  // 이 컴포넌트는 자식 라우트들을 렌더링하는 역할만 합니다.
  return <Outlet />;
}