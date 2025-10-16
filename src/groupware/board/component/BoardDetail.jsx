import React, { useEffect, useState } from "react";
import { Card, Button, List, Input, Space, message, Divider } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { getBoardDetail, getComments, addComment, deleteComment } from "../../../api/groupware/boardApi";

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
      message.error("게시글을 불러오지 못했습니다.");
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
    await deleteComment(id);
    message.success("게시글 삭제 완료");
    navigate("/board");
  };

  if (!board) return <div style={{ padding: 24 }}>로딩 중...</div>;

  return (
    <div style={{ padding: 24 }}>
      <Card title={board.title} bordered={false}>
        <p>
          <b>작성자:</b> {board.authorName}
        </p>
        <Divider />
        <div style={{ whiteSpace: "pre-wrap", marginBottom: 24 }}>
          {board.content}
        </div>

        <Space>
          <Button onClick={() => navigate(`/board/${id}/edit`)}>수정</Button>
          <Button danger onClick={handleDelete}>
            삭제
          </Button>
          <Button onClick={() => navigate("/board")}>목록</Button>
        </Space>
      </Card>

      <Card title="댓글" style={{ marginTop: 24 }}>
        <List
          dataSource={comments}
          renderItem={(item) => (
            <List.Item
              actions={[
                <a
                  key="delete"
                  onClick={() =>
                    deleteComment(id, item.commentNo).then(() => loadData())
                  }
                >
                  삭제
                </a>,
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
