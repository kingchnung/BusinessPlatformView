import React from "react";
import { Table, Card, Tag } from "antd";
import { useNavigate } from "react-router-dom";

/**
 * ==============================
 * ✅ 직원 목록 컴포넌트
 * - EmployeeListPage에서 전달받은 data를 테이블로 렌더링
 * ==============================
 */
const EmployeeList = ({ data = [] }) => {
  const navigate = useNavigate();

  /** ✅ 컬럼 정의 */
  const columns = [
    {
      title: "사번",
      dataIndex: "empId",
      key: "empId",
      align: "center",
      width: "10%",
    },
    {
      title: "이름",
      dataIndex: "empName",
      key: "empName",
      align: "center",
      render: (text, record) => (
        <a
          style={{ color: "#1677ff", cursor: "pointer" }}
          onClick={() => navigate(`/hr/${record.empId}`)}
        >
          {text}
        </a>
      ),
    },
    {
      title: "부서",
      dataIndex: "departmentName",
      key: "departmentName",
      align: "center",
    },
    {
      title: "직급",
      dataIndex: "rankName",
      key: "rankName",
      align: "center",
    },
    {
      title: "직책",
      dataIndex: "positionName",
      key: "positionName",
      align: "center",
    },
    {
      title: "이메일",
      dataIndex: "email",
      key: "email",
      align: "center",
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        const color =
          status === "ACTIVE"
            ? "green"
            : status === "LEAVE"
            ? "orange"
            : "volcano";
        return <Tag color={color}>{status || "UNKNOWN"}</Tag>;
      },
    },
    {
      title: "입사일",
      dataIndex: "hireDate",
      key: "hireDate",
      align: "center",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("ko-KR") : "-",
    },
  ];

  return (
    <Card
      title="직원 목록"
      style={{
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <Table
        rowKey={(record) => record.empId}
        dataSource={data}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default EmployeeList;
