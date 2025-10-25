import { message } from "antd";

/**
 * ✅ 공통 API 에러 핸들러
 * - JWT 만료 → 자동 로그아웃
 * - 404, 500 등 공통 에러 처리
 */
export const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    switch (status) {
      case 401:
      case 403:
        message.error("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.clear();
        window.location.href = "/login";
        break;
      case 404:
        message.warning("요청하신 데이터를 찾을 수 없습니다.");
        break;
      case 500:
        // message.error("서버 내부 오류가 발생했습니다.");
        console.error("❌ API Error (500):", data?.message || error.message);
        break;
      default:
        message.warning(`요청 실패 (상태코드: ${status})`);
    }
  } else if (error.request) {
    message.error("서버 응답이 없습니다. 네트워크 연결을 확인하세요.");
  } else {
    message.error(`요청 오류: ${error.message}`);
  }

  console.error("❌ API Error:", error);
  throw error;
};
