import React, { useEffect, useState } from "react";
import { Table, Tag, Input, Select, Button, Space } from "antd";
import { fetchApprovalList } from "../../api/approvalApi";

const { Search } = Input;

const ApprovalList = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [status, setStatus] = useState("");
  const [docType, setDocType] = useState("");
  const [keyword, setKeyword] = useState("");

  const fetchList = async () => {
    try {
      setLoading(true);
      const params = {
        status: status || undefined,
        docType: docType || undefined,
        keyword: keyword || undefined,
        page: 0,
        size: 10,
      };
      const res = await fetchApprovalList(params);
      setData(res.content || []); // Spring PageImpl 구조
    } catch (err) {
      console.error("❌ 리스트 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const columns = [
    { title: "문서번호", dataIndex: "id", key: "id" },
    { title: "제목", dataIndex: "title", key: "title" },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      render: (value) => {
        const color =
          value === "APPROVED"
            ? "green"
            : value === "IN_PROGRESS"
            ? "blue"
            : value === "REJECTED"
            ? "volcano"
            : "gray";
        return <Tag color={color}>{value}</Tag>;
      },
    },
    { title: "유형", dataIndex: "docType", key: "docType" },
    { title: "부서", dataIndex: "departmentName", key: "departmentName" },
    {
      title: "작성일",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val) => new Date(val).toLocaleString(),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 16 }}>📑 전자결재 문서 목록</h2>

      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="상태"
          value={status}
          onChange={setStatus}
          style={{ width: 120 }}
          options={[
            { value: "DRAFT", label: "임시저장" },
            { value: "IN_PROGRESS", label: "진행중" },
            { value: "APPROVED", label: "승인완료" },
            { value: "REJECTED", label: "반려" },
          ]}
        />
        <Select
          placeholder="문서유형"
          value={docType}
          onChange={setDocType}
          style={{ width: 140 }}
          options={[
            { value: "REQUEST", label: "품의서" },
            { value: "RESIGN", label: "퇴직서" },
            { value: "REPORT", label: "보고서" },
            { value: "HR_MOVE", label: "인사발령" },
          ]}
        />
        <Search
          placeholder="검색어 입력"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onSearch={fetchList}
          enterButton
          style={{ width: 200 }}
        />
        <Button type="primary" onClick={fetchList}>
          검색
        </Button>
      </Space>

      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default ApprovalList;