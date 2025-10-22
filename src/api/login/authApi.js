import { jwtDecode } from "jwt-decode";
import axiosInstance from "../../common/axiosInstance";

/**
 * 사용자 로그인 요청을 처리하고, 성공 시 사용자 데이터와 토큰을 반환합니다.
 * @param {{username:string, password:string}} credentials
 * @returns {Promise<{user: object, token: string, refreshToken: string}>}
 */
export const loginUser = async (credentials) => {
  // 1. 서버에 로그인 요청을 보냅니다.
  // 'try'를 제거합니다. axios가 실패하면 자동으로 에러가 'throw' 됩니다.
  const res = await axiosInstance.post("/auth/login", credentials);

  // 2. 응답 데이터에서 토큰과 역할 정보를 추출합니다.
  const { accessToken, refreshToken, roles, userId, empId, username } = res.data || {};

  if (!accessToken) {
    throw new Error("응답에 AccessToken이 없습니다."); // 성공 로직 중의 에러는 OK
  }

  // 3. AccessToken을 디코딩하여 사용자 정보를 얻습니다.
  let decoded = {};
  try { decoded = jwtDecode(accessToken) || {}; } catch (_) {}

  // 4. 역할(Role)과 권한(Permission)을 분리합니다.
  const authorities = Array.isArray(roles)
    ? roles.map((r) => (typeof r === "string" ? r : r?.authority)).filter(Boolean)
    : [];
  const userRoles = authorities.filter((auth) => auth.startsWith("ROLE_"));
  const userPermissions = authorities.filter((auth) => !auth.startsWith("ROLE_"));

  // 5. 최종 사용자 데이터 객체를 생성합니다.
  const userData = {
    userId: userId ?? decoded.uid ?? decoded.userId ?? null,
    empId: empId ?? decoded.empId ?? null,
    username: username ?? decoded.username ?? null,
    empName: decoded.empName ?? null,
    email: decoded.email ?? null,
    roles: userRoles,
    permissions: userPermissions,
  };

  // 6. 컴포넌트에서 사용할 수 있도록 데이터를 반환합니다.
  return { user: userData, token: accessToken, refreshToken };

  // 'catch' 블록 전체를 제거합니다.
};