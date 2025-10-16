import React from "react";
import { Card, List } from "antd";

const NoticeBoardCard = () => {
  const notices = [
    { title: "시스템 점검 안내", date: "2025-10-14" },
    { title: "추석 연휴 근무 일정 공지", date: "2025-09-25" },
    { title: "보안 정책 변경 안내", date: "2025-09-10" },
  ];

  return (
    <Card
      title="📢 공지사항"
      bordered={false}
      style={{
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        height: "100%",
      }}
      extra={<a href="/board/notice">더보기</a>}
    >
      <List
        dataSource={notices}
        renderItem={(item) => (
          <List.Item>
            <div style={{ width: "100%" }}>
              <strong>{item.title}</strong>
              <div style={{ color: "#888", fontSize: "12px" }}>{item.date}</div>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default NoticeBoardCard;