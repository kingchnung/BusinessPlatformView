import React, { useEffect, useState } from "react";
import { Card, List, message, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { fetchBoardList } from "../../api/groupware/boardApi"; // ✅ 공지 목록 API 재사용

const NoticeBoardCard = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNotices = async () => {
      try {
        setLoading(true);
        // ✅ type: NOTICE 만 가져오고, 페이지는 1, 크기는 3으로 제한
        const res = await fetchBoardList({ type: "NOTICE", page: 1, size: 3 });
        setNotices(res?.dtoList || []); // ← 서버 반환 구조 맞춰줘
      } catch (err) {
        console.error("❌ 공지사항 불러오기 실패:", err);
        message.error("공지사항을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    loadNotices();
  }, []);

  return (
    <Card
      title="📢 공지사항"
      bordered={false}
      style={{
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        height: "100%",
      }}
      extra={<a onClick={() => navigate("/boards/type/notice")}>더보기</a>}
    >
      {loading ? (
        <Spin tip="로딩 중..." />
      ) : (
        <List
          dataSource={notices}
          renderItem={(item) => (
            <List.Item
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/boards/${item.boardNo}`)} // ✅ 클릭 시 상세 이동
            >
              <div style={{ width: "100%" }}>
                <strong>{item.title}</strong>
                <div style={{ color: "#888", fontSize: "12px" }}>
                  {item.createdAt?.substring(0, 10) || ""}
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default NoticeBoardCard;