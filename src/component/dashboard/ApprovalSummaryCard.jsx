import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Spin, message, Tooltip } from "antd";
import {
  FileSyncOutlined,
  CheckCircleOutlined,
  StopOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../common/axiosInstance"; // 경로는 실제에 맞게 수정

const ApprovalSummaryCard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axiosInstance.get("/approvals/summary");
        setSummary(res.data);
      } catch (err) {
        console.error("❌ 전자결재 요약 불러오기 실패:", err);
        message.error("전자결재 요약 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleClick = (status) => {
    navigate(`/approvals?status=${status}`);
  };

  if (loading) {
    return (
      <Card title="전자결재 요약" bordered={false}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin tip="로딩 중..." />
        </div>
      </Card>
    );
  }

  const cards = [
    {
      label: "결재 대기",
      key: "IN_PROGRESS",
      value: summary?.IN_PROGRESS || 0,
      icon: <FileSyncOutlined />,
      color: "#1677ff",
      tooltip: "결재 승인 대기 중인 문서",
    },
    {
      label: "승인",
      key: "APPROVED",
      value: summary?.APPROVED || 0,
      icon: <CheckCircleOutlined />,
      color: "#52c41a",
      tooltip: "결재 완료된 문서",
    },
    {
      label: "반려",
      key: "REJECTED",
      value: summary?.REJECTED || 0,
      icon: <StopOutlined />,
      color: "#ff4d4f",
      tooltip: "결재가 반려된 문서",
    },
    {
      label: "임시 저장",
      key: "DRAFT",
      value: summary?.DRAFT || 0,
      icon: <EditOutlined />,
      color: "#8c8c8c",
      tooltip: "임시 저장된 문서",
    },
  ];

  return (
    <Card
      title={<strong>나의 결재 문서 현황</strong>}
      bordered={false}
      bodyStyle={{ padding: "16px 20px" }}
      style={{
        borderRadius: 12,
        boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
      }}
    >
      <Row gutter={[12, 12]} justify="space-between">
        {cards.map((c) => (
          <Col
            key={c.key}
            xs={12}
            sm={12}
            md={6}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <Tooltip title={c.tooltip}>
              <div
                onClick={() => handleClick(c.key)}
                style={{
                  cursor: "pointer",
                  borderRadius: 10,
                  backgroundColor: "#fff",
                  border: "1px solid #f0f0f0",
                  padding: "12px 8px",
                  width: 100,
                  textAlign: "center",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: 22, color: c.color, marginBottom: 6 }}>
                  {c.icon}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#555",
                    fontWeight: 500,
                    marginBottom: 4,
                  }}
                >
                  {c.label}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: c.color,
                    lineHeight: 1,
                  }}
                >
                  {c.value}
                </div>
              </div>
            </Tooltip>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default ApprovalSummaryCard;
