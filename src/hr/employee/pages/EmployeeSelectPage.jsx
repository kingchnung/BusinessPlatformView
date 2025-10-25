import React, { useEffect, useState } from "react";
import { Table, Input, Button, Space, message, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../common/axiosInstance";

const EmployeeSelectPage = () => {
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axiosInstance.get("/employees");
        setEmployees(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error("직원 목록 불러오기 오류:", err);
        message.error("직원 목록을 불러오지 못했습니다.");
      }
    };
    fetchEmployees();
  }, []);

  // ✅ 검색 필터
  const handleSearch = (value) => {
    setSearch(value);
    const result = employees.filter(
      (emp) =>
        emp.empName.includes(value) ||
        emp.empNo.includes(value) ||
        emp.email?.includes(value)
    );
    setFiltered(result);
  };

  // ✅ 상태값 색상 매핑
  const renderStatusTag = (status) => {
    switch (status) {
      case "ACTIVE":
        return <Tag color="green">재직중</Tag>;
      case "LEAVE":
        return <Tag color="gold">휴직</Tag>;
      case "RESIGNED":
        return <Tag color="volcano">퇴직</Tag>;
      case "TERMINATED":
        return <Tag color="red">해고</Tag>;
      default:
        return <Tag color="default">{status || "미지정"}</Tag>;
    }
  };

  // ✅ 테이블 컬럼 정의
  const columns = [
    { title: "사번", dataIndex: "empNo", key: "empNo", width: 120 },
    { title: "이름", dataIndex: "empName", key: "empName", width: 120 },
    { title: "부서", dataIndex: "deptName", key: "deptName", width: 150 },
    { title: "직위", dataIndex: "positionName", key: "positionName", width: 150 },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => renderStatusTag(status),
      width: 120,
    },
    {
      title: "수정",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/hr/employee/cards/edit/${record.empId}`)}
        >
          수정
        </Button>
      ),
      width: 100,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>직원 인사카드 수정</h2>

      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="이름 / 사번 / 이메일 검색"
          allowClear
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="empId"
        pagination={{ pageSize: 8 }}
        bordered
      />
    </div>
  );
};

export default EmployeeSelectPage;
