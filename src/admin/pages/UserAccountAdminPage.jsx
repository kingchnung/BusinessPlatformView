import React, { useEffect, useState } from "react";
import { Table, Button, Input, Space, message, Tag, Popconfirm } from "antd";
import axiosInstance from "../../common/axiosInstance";

const UserAccountAdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // ✅ 사용자 목록 조회
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/users");
      setUsers(res.data);
    } catch (err) {
      message.error("사용자 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 계정 초기화 (비밀번호+락 해제)
  const handleReset = async (userId) => {
    try {
      const res = await axiosInstance.put(`/users/${userId}/reset-lock`);
      message.success(res.data.message || "비밀번호와 계정이 초기화되었습니다.");
      fetchUsers();
    } catch (err) {
      message.error("초기화 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ 테이블 컬럼 정의
  const columns = [
    {
      title: "아이디",
      dataIndex: "username",
      key: "username",
      filteredValue: [search],
      onFilter: (value, record) =>
        record.username.toLowerCase().includes(value.toLowerCase()) ||
        record.empName.toLowerCase().includes(value.toLowerCase()) ||
        (record.deptName && record.deptName.toLowerCase().includes(value.toLowerCase())),
    },
    {
      title: "이름",
      dataIndex: "empName",
      key: "empName",
    },
    {
      title: "부서명",
      dataIndex: "deptName",
      key: "deptName",
    },
    {
      title: "활성",
      dataIndex: "active",
      key: "active",
      render: (val) => (
        <Tag color={val ? "green" : "volcano"}>{val ? "활성" : "비활성"}</Tag>
      ),
    },
    {
      title: "락 여부",
      dataIndex: "locked",
      key: "locked",
      render: (val) => (
        <Tag color={val ? "red" : "blue"}>{val ? "잠금" : "정상"}</Tag>
      ),
    },
    {
      title: "로그인 실패",
      dataIndex: "failedCount",
      key: "failedCount",
      render: (val) => (val ? `${val}회` : "-"),
    },
    {
      title: "마지막 로그인",
      dataIndex: "lastLogin",
      key: "lastLogin",
      render: (val) => (val ? val.replace("T", " ") : "-"),
    },
    {
      title: "관리",
      key: "actions",
      render: (_, record) => (
        <Popconfirm
          title="비밀번호를 초기화하고 잠금을 해제하시겠습니까?"
          onConfirm={() => handleReset(record.userId)}
          okText="예"
          cancelText="아니오"
        >
          <Button size="small" danger>
            초기화
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>🔐 계정 관리</h2>

      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="아이디, 이름, 부서명 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: 300 }}
        />
        <Button type="primary" onClick={fetchUsers}>
          새로고침
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="userId"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default UserAccountAdminPage;
