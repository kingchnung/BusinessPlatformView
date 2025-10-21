import axiosInstance from "../common/axiosInstance";
import { message } from "antd";

/**
 * [JWT 기반 사용자 API 공통 에러 처리]
 * - JWT 만료(401, 403) → 자동 로그아웃 및 로그인 페이지로 이동
 * - 서버 에러(500) → 사용자에게 알림
 * - 네트워크 실패 → 연결 문제 안내
 */
const handleApiError = (error) => {
  if (error.response) {
    const { status } = error.response;

    switch (status) {
      case 401:
      case 403:
        message.error("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login"; // ✅ 자동 리다이렉트
        break;

      case 404:
        message.warning("요청하신 리소스를 찾을 수 없습니다.");
        break;

      case 500:
        message.error("서버 처리 중 오류가 발생했습니다.");
        break;

      default:
        message.warning(`요청 실패 (${status})`);
    }
  } else if (error.request) {
    // 요청은 전송되었지만 응답이 없음
    message.error("서버 응답이 없습니다. 네트워크를 확인하세요.");
  } else {
    // 그 외 에러
    message.error(`요청 오류: ${error.message}`);
  }

  throw error; // 호출한 컴포넌트에서도 처리 가능하도록 재던짐
};

/**
 * ✅ [전체 사용자 목록 조회]
 * - JWT Bearer 토큰 자동 포함
 * - 401 / 403 발생 시 자동 로그아웃 처리
 * - 정상 응답 시 사용자 배열 반환
 */
export const fetchUsers = async () => {
  try {
    const res = await axiosInstance.get("/users/list");
    console.log("✅ 사용자 목록 응답:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ 사용자 목록 조회 실패:", error);
    handleApiError(error);
  }
};

export const fetchUserProfile = async (userId) => {
  try {
    const res = await axiosInstance.get(`/users/${userId}`);
    console.log("✅ 사용자 프로필 응답:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ 사용자 프로필 조회 실패:", error);
    handleApiError(error);
  }
};
