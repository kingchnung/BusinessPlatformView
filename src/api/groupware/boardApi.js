import axiosInstance from "../../common/axiosInstance";
import { message } from "antd";
import { handleApiError } from "../../util/apiErrorUtil";

/**
 * 2️⃣ 게시글 목록 조회
 */
export const getBoardList = async (type = "ALL") => {
  try {
    const params = type !== "ALL" ? { type } : {}; // ✅ ALL일 때는 파라미터 제거
    const res = await axiosInstance.get("/boards", { params });
    console.log("📋 게시글 목록:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ 게시글 목록 조회 실패:", error);
    message.error("게시글 목록 조회 실패");
  }
};

/**
 * 2️⃣ 게시글 상세 조회
 */
export const getBoardDetail = async (boardNo) => {
  try {
    const res = await axiosInstance.get(`/boards/${boardNo}`);
    console.log("📄 게시글 상세:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ 게시글 상세 조회 실패:", error);
    message.error("게시글 상세 조회 실패");
    handleApiError(error);
  }
};

/**
 * 3️⃣ 게시글 등록
 */
export const createBoard = async (boardData) => {
  try {
    console.log("📝 게시글 등록 요청:", boardData);
    const res = await axiosInstance.post("/boards", boardData);
    message.success("게시글이 등록되었습니다 ✅");
    return res.data;
  } catch (error) {
    console.error("❌ 게시글 등록 실패:", error);
    message.error("게시글 등록 중 오류가 발생했습니다.");
    handleApiError(error);
  }
};

/**
 * 4️⃣ 게시글 수정
 */
export const updateBoard = async (boardNo, boardData) => {
  try {
    console.log("✏️ 게시글 수정 요청:", boardNo, boardData);
    const res = await axiosInstance.put(`/boards/${boardNo}`, boardData);
    message.success("게시글이 수정되었습니다 ✨");
    return res.data;
  } catch (error) {
    console.error("❌ 게시글 수정 실패:", error);
    message.error("게시글 수정 실패");
    handleApiError(error);
  }
};

/**
 * 5️⃣ 게시글 삭제 (논리삭제)
 */
export const deleteBoard = async (boardNo) => {
  try {
    const res = await axiosInstance.delete(`/boards/${boardNo}`);
    message.success("게시글이 삭제되었습니다 🗑️");
    return res.data;
  } catch (error) {
    console.error("❌ 게시글 삭제 실패:", error);
    message.error("게시글 삭제 실패");
    handleApiError(error);
  }
};

/**
 * 6️⃣ 댓글 목록 조회
 */
export const getComments = async (boardNo) => {
  try {
    const res = await axiosInstance.get(`/boards/${boardNo}/comment`);
    console.log("💬 댓글 목록:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ 댓글 목록 조회 실패:", error);
    message.error("댓글 목록 조회 실패");
    handleApiError(error);
  }
};

/**
 * 7️⃣ 댓글 등록
 */
export const addComment = async (boardNo, content) => {
  try {
    const res = await axiosInstance.post(`/boards/${boardNo}/comment`, {
      content,
    });
    message.success("댓글이 등록되었습니다 💬");
    return res.data;
  } catch (error) {
    console.error("❌ 댓글 등록 실패:", error);
    message.error("댓글 등록 실패");
    handleApiError(error);
  }
};

/**
 * 8️⃣ 댓글 삭제
 */
export const deleteComment = async (boardNo, commentNo) => {
  try {
    await axiosInstance.delete(`/boards/${boardNo}/comment/${commentNo}`);
    message.success("댓글이 삭제되었습니다 🗑️");
  } catch (error) {
    console.error("❌ 댓글 삭제 실패:", error);
    message.error("댓글 삭제 실패");
    handleApiError(error);
  }
};