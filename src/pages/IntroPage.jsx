import React from "react";
import { Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

const IntroPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to bottom, #f5f7fa, #c3cfe2)",
      }}
    >
      <Title level={2}>🚀 BizMate ERP</Title>
      <Paragraph>회사 전용 ERP 시스템입니다. 로그인이 필요합니다.</Paragraph>
      <Button type="primary" size="large" onClick={() => navigate("/login")}>
        로그인하러 가기
      </Button>
    </div>
  );
};

export default IntroPage;
