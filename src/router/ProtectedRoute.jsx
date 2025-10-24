import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // ✅ localStorage 유지 버전

  // ❌ 로그인 정보가 없을 때
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ 로그인된 경우에만 자식 컴포넌트 렌더링
  return children;
};

export default ProtectedRoute;
