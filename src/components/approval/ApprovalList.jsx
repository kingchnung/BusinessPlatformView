import React, { useEffect, useState } from "react";
import { Table, Tag, Card, message, Button, Space } from "antd";
import { getApprovalList, previewFile, downloadFile } from "../../api/approvalApi";
import { EyeOutlined, DownloadOutlined, PaperClipOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const statusColors = {
  DRAFT: "default",
  IN_PROGRESS: "processing",
  APPROVED: "success",
  REJECTED: "error",
  DELETED: "warning",
};

const ApprovalList = ({ refreshKey }) => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  // ✅ 목록 조회
  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const res = await getApprovalList();
        const sorted = [...res].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setData(sorted);
      } catch (err) {
        console.error(err);
        message.error("목록 조회 실패");
      }
    };
    fetchApprovals();
  }, [refreshKey]);

  // ✅ 테이블 컬럼 정의
  const columns = [
    {
      title: "문서 ID",
      dataIndex: "id",
      key: "id",
      width: 160,
      ellipsis: true,
      render: (text, record) => (
        <a
          onClick={() => navigate(`/approval/${record.id}`)}
          style={{ color: "#1677ff", cursor: "pointer" }}
        >
          {record.id}
        </a>
      ),
    },
    {
      title: "제목",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <a
          onClick={() => navigate(`/approval/${record.id}`)}
          style={{ color: "#1677ff", cursor: "pointer" }}
        >
          {text}
        </a>
      ),
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColors[status] || "default"}>{status}</Tag>
      ),
    },
    {
      title: "부서명",
      dataIndex: "departmentName",
      key: "departmentName",
    },
    {
      title: "작성일",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val) => (val ? val.substring(0, 10) : "-"),
    },
  ];

  return (
    <Card
      title="결재 문서 목록"
      variant="borderless"
      style={{ marginTop: 24 }}
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey={("id")}
        pagination={{ pageSize: 5 }}
        onRow={(record) => ({
          onClick: () => navigate(`/approval/${record.id}`),
        })}
      />
    </Card>
  );
};

export default ApprovalList;
