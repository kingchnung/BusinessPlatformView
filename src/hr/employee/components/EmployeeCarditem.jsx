import React from "react";
import { Card } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const EmployeeCardItem = ({ emp }) => {
  const navigate = useNavigate();

  if (!emp) {
    console.warn("employeeCardItem: emp 데이터 누락");
    return null;
  }

  return (
    <Card
      hoverable
      style={{
        width: 260,
        borderRadius: 12,
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
      onClick={() => navigate(`/hr/employee/detail/${emp.empId}`)}
      /*
      cover={
        <div
          style={{
            height: 160,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#f0f2f5",
          }}
        >
          <UserOutlined style={{ fontSize: 48, color: "#999" }} />
         </div>
      }
         */
    >
      
      <Card.Meta
        title={emp.empName || "이름 없음"}
        description={
          <div style={{ fontSize: 13, color: "#555" }}>
            <p>사번: {emp.empNo}</p>
            <p>부서: {emp.deptName}</p>
            <p>직급: {emp.positionName}</p>
          </div>
        }
      />
    </Card>
  );
};

export default EmployeeCardItem;
