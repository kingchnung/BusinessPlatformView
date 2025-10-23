import React, { useEffect, useState } from "react";
import { Card, Avatar, Typography, Tooltip, Button, Spin } from "antd";
import { UserOutlined, EditOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "../../hooks/useEmployees";


const { Text } = Typography;

/**
 * 🎴 MyInfoCard.jsx
 * 중앙정렬·반응형·타일형 "내 정보" 카드
 */
const MyInfoCard = () => {
  const navigate = useNavigate();
  const { employees, loading } = useEmployees();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    if (employees.length && stored?.empId) {
      const found = employees.find((e) => e.empId === stored.empId);
      setUser(found || stored);
    } else {
      setUser(stored);
    }
  }, [employees]);

  if (loading || !user) {
    return (
      <Card
        bordered={false}
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin tip="내 정보 불러오는 중..." />
      </Card>
    );
  }

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        height: "100%",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px 12px",
      }}
    >
      {/* 상단: 프로필 */}
      <div>
        <Avatar
          size={64}
          icon={<UserOutlined />}
          src={user?.profileImageUrl || null}
          style={{ backgroundColor: "#f5f5f5", marginBottom: 12 }}
        />
        <div>
          <Text strong style={{ fontSize: 15, display: "block" }}>
            {user?.empName || "-"}
          </Text>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {user?.positionName || "-"} / {user?.deptName || "-"}
          </Text>
        </div>
      </div>

      {/* 중간: Tooltip으로 세부 정보 */}
      <div style={{ marginTop: 8 }}>
        <Tooltip title={user?.phone || "연락처 없음"}>
          <PhoneOutlined style={{ marginRight: 6, color: "#888" }} />
        </Tooltip>
        <Tooltip title={user?.email || "이메일 없음"}>
          <MailOutlined style={{ color: "#888" }} />
        </Tooltip>
      </div>

      {/* 하단: 수정 버튼 */}
      <div style={{ marginTop: 8 }}>
        <Button
          type="link"
          size="small"
          style={{ padding: 0, color: "#1677ff" }}
          onClick={() => navigate("/hr/employee/cards/edit")}
        >
          MY Page
        </Button>
      </div>
    </Card>
  );
};

export default MyInfoCard;
