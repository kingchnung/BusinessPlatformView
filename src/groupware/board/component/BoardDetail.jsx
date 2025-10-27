import React, { useEffect, useState, useMemo, useCallback } from "react"; // 🔹 useMemo 추가
import {
  Card,
  Button,
  List,
  Input,
  Space,
  message,
  Divider,
  Popconfirm,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import {
  getBoardDetail,
  getComments,
  addComment,
  deleteComment,
  deleteBoard,
} from "../../../api/groupware/boardApi";

const { TextArea } = Input;

function extractAuthorities(u) {
  if (!u) return [];
  const src = u.authorities ?? u.roles ?? [];
  if (Array.isArray(src)) {
    return src
      .map(a => (typeof a === "string" ? a : a?.authority))
      .filter(Boolean)
      .map(s => s.toUpperCase());
  }
  if (typeof src === "string") {
    return src.split(",").map(s => s.trim().toUpperCase());
  }
  return [];
}


const BoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");


  const user = JSON.parse(localStorage.getItem("user")) || null;

  const isAdminGlobal = useMemo(() => {
    const auths = extractAuthorities(user);
    return auths.some(a => ["ROLE_ADMIN", "ROLE_CEO", "SYS:ADMIN"].includes(a));
  }, [user]);


  // 🔹 서버에서 canEdit / canDelete 안 주는 경우 fallback 계산
  const computedPerm = useMemo(() => {
    if (!board) return { canEdit: false, canDelete: false };
    if (board.canEdit != null || board.canDelete != null) {
      return {
        canEdit: !!board.canEdit,
        canDelete: !!board.canDelete,
      };
    }
    const isAdmin = user?.authorities?.some((a) =>
      ["ROLE_ADMIN", "ROLE_CEO", "sys:admin"].includes(a)
    );
    const isAuthor = user?.username && board?.authorId === user.username;
    const isNotice = board?.boardType === "NOTICE";
    return {
      canEdit: !!(isAdmin || (isAuthor && !isNotice)),
      canDelete: !!(isAdmin || isAuthor),
    };
  }, [board, user]); // 🔹 변경됨: 권한 계산

  const loadData = useCallback(async () => {
    try {
      const detail = await getBoardDetail(id);
      setBoard(detail);
      const commentList = await getComments(id);
      setComments(commentList || []);
    } catch (e) {
      message.error("댓글을 불러오지 못했습니다.");
      console.error(e);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return message.warning("댓글을 입력하세요.");
    try {
      await addComment(id, newComment);
      message.success("댓글 등록 완료");
      setNewComment("");
      loadData();
    } catch (err) {
      const status = err?.response?.status; // 🔹 에러 코드 분기
      if (status === 403) {
        message.error(err.response?.data?.message || "권한이 없습니다.");
        return;
      }
      if (status === 401) {
        message.error("인증이 필요합니다.");
        // navigate("/login");  // 🔹 로그인 이동은 원할 때만 활성화
        return;
      }
      message.error("댓글 등록 중 오류가 발생했습니다.");
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBoard(id);
      message.success("게시글 삭제 완료");
      navigate("/boards");
    } catch (err) {
      const status = err?.response?.status; // 🔹 여기서도 403 예외 처리
      if (status === 403) {
        message.error(err.response?.data?.message || "권한이 없습니다.");
        return;
      }
      if (status === 401) {
        message.error("인증이 필요합니다.");
        // navigate("/login");
        return;
      }
      message.error("게시글 삭제 중 오류가 발생했습니다.");
      console.error("게시글 삭제 실패:", err);
    }
  };

  const handleDeleteComment = async (commentNo) => {
    try {
      await deleteComment(id, commentNo);
      loadData();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 403) {
        message.error(err.response?.data?.message || "권한이 없습니다.");
        return;
      }
      if (status === 401) {
        message.error("인증이 필요합니다.");
        // navigate("/login");
        return;
      }
      message.error("댓글 삭제 중 오류가 발생했습니다.");
      console.error(err);
    }
  };

  if (!board) return <div style={{ padding: 24 }}>로딩 중...</div>;

  console.log("board detail =", board);
  console.log("local user   =", user);

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={board.title}
        variant="borderless" // 🔹 bordered={false} 대신 variant="borderless" (antd 경고 해결)
        extra={
          <Space>
            {/* 🔹 권한별 버튼 노출 */}
            {computedPerm.canEdit && (
              <Button type="default" onClick={() => navigate(`/boards/${id}/edit`)}>
                수정
              </Button>
            )}
            {computedPerm.canDelete && (
              <Popconfirm
                title="이 게시글을 삭제하시겠습니까?"
                okText="삭제"
                cancelText="취소"
                onConfirm={handleDelete}
              >
                <Button danger type="primary">삭제</Button>
              </Popconfirm>
            )}
            <Button onClick={() => navigate("/boards")}>목록</Button>
          </Space>
        }
      >
        <p>
          <b>작성자:</b> {board.authorName}
        </p>
        <Divider />
        <div style={{ whiteSpace: "pre-wrap", marginBottom: 24 }}>
          {board.content}
        </div>
      </Card>

      <Card title="댓글" style={{ marginTop: 24 }}>
        <List
          dataSource={comments}
          renderItem={(item) => {
            const isAuthor = !!(user?.username && item?.authorId === user.username);
            const canDeleteThisComment = isAdminGlobal || isAuthor; // ✅ 관리자 or 본인만

            // 익명/실명 표시는 서버가 내려준 authorName 그대로 사용
            const displayName = item.authorName;

            return (
              <List.Item
                actions={
                  canDeleteThisComment
                    ? [
                      <Popconfirm
                        key="delete"
                        title="댓글을 삭제하시겠습니까?"
                        okText="삭제"
                        cancelText="취소"
                        onConfirm={() => handleDeleteComment(item.commentNo)}
                      >
                        <Button type="link" danger>삭제</Button>
                      </Popconfirm>,
                    ]
                    : []
                }
              >
                <List.Item.Meta
                  title={`${displayName} (${item.createdAt?.substring(0, 10) || ""})`}
                  description={item.content}
                />
              </List.Item>
            );
          }}
        />

        <Space.Compact style={{ width: "100%", marginTop: 12 }}>
          <TextArea
            rows={2}
            placeholder="댓글을 입력하세요"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button type="primary" onClick={handleAddComment} >
            등록
          </Button>
        </Space.Compact>
      </Card>
    </div>
  );
};

export default BoardDetail;