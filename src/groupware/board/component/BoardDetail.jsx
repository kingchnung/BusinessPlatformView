import React, { useEffect, useState } from "react";
import { Card, Button, List, Input, Space, message, Divider, Popconfirm } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { getBoardDetail, getComments, addComment, deleteComment, deleteBoard } from "../../../api/groupware/boardApi";

const { TextArea } = Input;

const BoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const loadData = async () => {
    try {
      const detail = await getBoardDetail(id);
      setBoard(detail);
      const commentList = await getComments(id);
      setComments(commentList || []);
    } catch (e) {
      message.error("게시글을 불러오지 못했습니다.", e);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return message.warning("댓글을 입력하세요.");
    await addComment(id, newComment);
    message.success("댓글 등록 완료");
    setNewComment("");
    loadData();
  };

  const handleDelete = async () => {
    try {
      await deleteBoard(id);
      message.success("게시글 삭제 완료");
      navigate("/boards");
    } catch (err) {
      console.error("게시글 삭제 실패:", err);
      message.error("게시글 삭제 중 오류가 발생했습니다.");
    }
  };

  if (!board) return <div style={{ padding: 24 }}>로딩 중...</div>;

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={board.title}
        bordered={false}
        extra={
          <Space>
            <Button onClick={() => navigate(`/boards/${id}/edit`)}>수정</Button>
            <Popconfirm
              title="이 게시글을 삭제하시겠습니까?"
              okText="삭제"
              cancelText="취소"
              onConfirm={handleDelete}
            >
              <Button danger>삭제</Button>
            </Popconfirm>
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
          renderItem={(item) => (
            <List.Item
              actions={[
                <Popconfirm
                  key="delete"
                  title="댓글을 삭제하시겠습니까?"
                  okText="삭제"
                  cancelText="취소"
                  onConfirm={() =>
                    deleteComment(id, item.commentNo).then(() => loadData())
                  }
                >
                  <a>삭제</a>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={`${item.authorName} (${item.createdAt?.substring(0, 10)})`}
                description={item.content}
              />
            </List.Item>
          )}
        />

        <Space.Compact style={{ width: "100%", marginTop: 12 }}>
          <TextArea
            rows={2}
            placeholder="댓글을 입력하세요"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button type="primary" onClick={handleAddComment}>
            등록
          </Button>
        </Space.Compact>
      </Card>
    </div>
  );
};

export default BoardDetail;
