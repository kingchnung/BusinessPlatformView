import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../slice/authSlice";

export default function RootLayout() {
  const dispatch = useDispatch();

  // ✅ 바로 이곳이 이 로직이 있어야 할 정확한 위치입니다.
  // 이 컴포넌트는 앱이 시작될 때 최상위에서 렌더링되므로,
  // 훅(Hook)을 사용하는 데 아무런 문제가 없습니다.
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