// DummyPage.jsx
import { useEffect } from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

export default function DummyPage({ messageText = "2차 개발 준비중입니다." }) {
  const navigate = useNavigate();

  useEffect(() => {
    alert(messageText);
  }, [messageText]);

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", padding: 16 }}>
      <Button type="default" onClick={() => navigate(-1)}>
        &larr; 뒤로가기
      </Button>
    </div>
  );
}
