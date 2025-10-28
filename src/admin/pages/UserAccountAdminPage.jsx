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
      
      const sorted = (res.data || []).sort((a, b) => {
      if (a.accountNonLocked === b.accountNonLocked) return 0;
      return a.accountNonLocked ? 1 : -1; // 잠금(false) 먼저
    });
      setUsers(sorted);
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
  const handleUnlock = async (userId) => {
  try {
      const res = await axiosInstance.post(`/admin/users/${userId}/unlock`);
      message.success(res.data.message);
      fetchUsers();
    } catch (err) {
      message.error("잠금 해제 중 오류가 발생했습니다.");
    }
  };

  const handleToggleActive = async (userId, newActiveStatus) => {
  try {
      const res = await axiosInstance.put(`/users/${userId}/active`, {
      active: newActiveStatus,
      });
      message.success(res.data.message);
      fetchUsers();
    } catch (err) {
      message.error("계정 상태 변경 중 오류가 발생했습니다.");
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
      onFilter: (value, record) => {
        const keyword = value.toLowerCase();
        const username = (record.username || "").toLowerCase();
        const empName = (record.empName || "").toLowerCase();
        const deptName = (record.deptName || "").toLowerCase();

      return (
        username.includes(keyword) ||
        empName.includes(keyword) ||
        deptName.includes(keyword)
      );
    },
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
      dataIndex: "accountNonLocked",
      key: "accountNonLocked",
      render: (val) => (
        <Tag color={!val ? "red" : "blue"}>{!val ? "잠금" : "정상"}</Tag>
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
        <Space>
           <Popconfirm
            title="계정의 잠금을 해제하시겠습니까?"
            onConfirm={() => handleUnlock(record.userId)}
            okText="예"
            cancelText="아니오"
            >
        <Button size="small">잠금 해제</Button>
      </Popconfirm>
        <Popconfirm
          title="비밀번호를 초기화하고 잠금을 해제하시겠습니까?"
          onConfirm={() => handleReset(record.userId)}
          okText="예"
          cancelText="아니오"
        >
          <Button size="small" danger>초기화</Button>
        </Popconfirm>

        {/* 🔹 활성/비활성 토글 버튼 */}
      <Popconfirm
        title={
          record.active
            ? "해당 계정을 비활성화하시겠습니까?"
            : "해당 계정을 활성화하시겠습니까?"
        }
        onConfirm={() => handleToggleActive(record.userId, !record.active)}
        okText="예"
        cancelText="아니오"
      >
        <Button
          size="small"
          type={record.active ? "default" : "primary"}
        >
          {record.active ? "비활성화" : "활성화"}
        </Button>
      </Popconfirm>


        </Space>
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
