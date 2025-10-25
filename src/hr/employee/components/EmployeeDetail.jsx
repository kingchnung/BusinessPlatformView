import React from "react";
import { useSelector } from "react-redux";
import {
  Descriptions,
  Card,
  Button,
  Space,
  Tag,
  message,
  Typography,
} from "antd";
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

/**
 * ==============================
 * ✅ 직원 상세 컴포넌트
 * - Redux에 저장된 selectedEmployee 표시
 * - UI: antd Descriptions + Card
 * ==============================
 */
const EmployeeDetail = ({ empId }) => {
  const navigate = useNavigate();
  const { selectedEmployee } = useSelector((state) => state.hr);

  if (!selectedEmployee) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <p style={{ color: "#888" }}>직원 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  const {
    empName,
    departmentName,
    rankName,
    positionName,
    email,
    phone,
    hireDate,
    status,
  } = selectedEmployee;

  const handleEdit = () => {
    navigate(`/hr/employee/${empId}`);
  };

  const handleBack = () => {
    navigate("/hr");
  };

  const handleDelete = () => {
    message.info("직원 삭제 기능은 추후 구현 예정입니다.");
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 상단 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            type="default"
            style={{
              borderRadius: 6,
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            목록으로
          </Button>
          <Title
            level={4}
            style={{
              margin: 0,
              color: "#1f1f1f",
              letterSpacing: "-0.2px",
            }}
          >
            직원 상세정보
          </Title>
        </Space>
        <Space>
          <Button
            icon={<EditOutlined />}
            type="primary"
            onClick={handleEdit}
            style={{ borderRadius: 8 }}
          >
            수정
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={handleDelete}
            style={{ borderRadius: 8 }}
          >
            삭제
          </Button>
        </Space>
      </div>

      {/* 직원 상세 정보 */}
      <Card
        bordered
        style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
        bodyStyle={{ padding: 20 }}
      >
        <Descriptions
          bordered
          size="middle"
          column={2}
          labelStyle={{
            backgroundColor: "#fafafa",
            width: "30%",
            fontWeight: 500,
          }}
        >
          <Descriptions.Item label="사번">{empId}</Descriptions.Item>
          <Descriptions.Item label="이름">{empName}</Descriptions.Item>
          <Descriptions.Item label="부서">{departmentName || "-"}</Descriptions.Item>
          <Descriptions.Item label="직급">{rankName || "-"}</Descriptions.Item>
          <Descriptions.Item label="직책">{positionName || "-"}</Descriptions.Item>
          <Descriptions.Item label="이메일">{email || "-"}</Descriptions.Item>
          <Descriptions.Item label="전화번호">{phone || "-"}</Descriptions.Item>
          <Descriptions.Item label="입사일">
            {hireDate ? new Date(hireDate).toLocaleDateString("ko-KR") : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="상태">
            <Tag
              color={
                status === "ACTIVE"
                  ? "green"
                  : status === "LEAVE"
                  ? "orange"
                  : "volcano"
              }
            >
              {status || "UNKNOWN"}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default EmployeeDetail;
