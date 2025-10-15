import React, { useEffect, useState } from "react";
import { Table, Input, Button, Space, message } from "antd";
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
        message.error("직원 목록을 불러오지 못했습니다.");
      }
    };
    fetchEmployees();
  }, []);

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

  const columns = [
    { title: "사번", dataIndex: "empNo", key: "empNo" },
    { title: "이름", dataIndex: "empName", key: "empName" },
    { title: "부서", dataIndex: "deptName", key: "dept" },
    { title: "직위", dataIndex: "positionName", key: "position" },
    {
      title: "수정",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() =>
            navigate(`/hr/employee/cards/edit/${record.empId}`)
          }
        >
          수정
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>직원 인사카드 수정</h2>
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
      />
    </div>
  );
};

export default EmployeeSelectPage;
