import axiosInstance from "../../common/axiosInstance";
import { message } from "antd";
import { handleApiError } from "../../util/apiErrorUtil";

/**
 * ==============================
 * ✅ 직위(Position) API 모듈
 * ==============================
 */

/** 1️⃣ 전체 직위 목록 조회 */
export const fetchPositions = async () => {
  try {
    const res = await axiosInstance.get("/positions");
    console.log("📊 직위 목록:", res.data);
    return res.data;
  } catch (error) {
    message.error("직위 목록 조회 실패");
    handleApiError(error);
  }
};

/** 2️⃣ 단일 직위 조회 */
export const fetchPositionDetail = async (positionCode) => {
  try {
    const res = await axiosInstance.get(`/positions/${positionCode}`);
    console.log("📋 직위 상세:", res.data);
    return res.data;
  } catch (error) {
    message.error("직위 상세 조회 실패");
    handleApiError(error);
  }
};

/** 3️⃣ 신규 직위 등록 (필요 시) */
export const createPosition = async (data) => {
  try {
    const res = await axiosInstance.post("/positions/add", data);
    message.success("직위 등록 완료");
    return res.data;
  } catch (error) {
    message.error("직위 등록 실패");
    handleApiError(error);
  }
};
