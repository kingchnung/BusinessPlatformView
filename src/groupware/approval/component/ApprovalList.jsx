import React, { useEffect, useState } from "react";
import { Table, message, Card, Spin, Tag } from "antd";
import { getApprovalList } from "../../../api/groupware/approvalApi";
import { useNavigate } from "react-router-dom";

const ApprovalList = ({ refreshKey = 0, status = "ALL" }) => {
  const [loading, setLoading] = useState(false);
  const [approvals, setApprovals] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const navigate = useNavigate();

  /**
   * ✅ 결재문서 목록 로드
   */
  const loadApprovals = async (page = 1, size = 10) => {
    try {
      setLoading(true);
      const res = await getApprovalList(page, size, status);

      if (res && res.dtoList) {
        // 삭제된 문서는 제외 (관리자만 볼 수 있음)
        const filtered = res.dtoList.filter((doc) => doc.status !== "DELETED");

        setApprovals(filtered);
        setPagination({
          current: res.pageRequestDTO.page,
          pageSize: res.pageRequestDTO.size,
          total: res.totalCount,
        });
        console.log("📄 결재문서 목록 로드 성공:", res.dtoList);
      } else {
        message.warning("결재문서 목록이 비어 있습니다.");
      }
    } catch (error) {
      console.error("❌ 결재문서 목록 조회 실패:", error);
      message.error("결재문서 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /** ✅ 최초 로드 + refreshKey 변경 시 재요청 */
  useEffect(() => {
    loadApprovals(1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, status]);

  /** ✅ 페이지 변경 시 호출 */
  const handleTableChange = (paginationConfig) => {
    loadApprovals(paginationConfig.current, paginationConfig.pageSize);
  };

  /** ✅ 컬럼 정의 */
  const columns = [
    {
      title: "문서 번호",
      dataIndex: "id",
      key: "id",
      width: "15%",
      align: "center",
    },
    {
      title: "제목",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <a
          style={{ cursor: "pointer", color: "#1677ff" }}
          onClick={() => navigate(`/approvals/${record.id}`)}
        >
          {text}
        </a>
      ),
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        const statusLabel = {
          DRAFT: "임시저장",
          IN_PROGRESS: "결재 대기",
          APPROVED: "승인 완료",
          REJECTED: "반려됨",
          DELETED: "삭제됨",
        };
        const color =
          status === "DRAFT"
            ? "gold"
            : status === "IN_PROGRESS"
            ? "blue"
            : status === "APPROVED"
            ? "green"
            : status === "REJECTED"
            ? "volcano"
            : status === "DELETED"
            ? "gray"
            : "default";
        return (
          <Tag
            color={color}
            style={{
              fontWeight: 600,
              opacity: status === "DELETED" ? 0.6 : 1,
            }}
          >
            {statusLabel[status] || status}
          </Tag>
        );
      },
    },
    {
      title: "작성자",
      dataIndex: "authorName",
      key: "authorName",
      align: "center",
    },
    {
      title: "부서",
      dataIndex: "departmentName",
      key: "departmentName",
      align: "center",
    },
    {
      title: "작성일",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("ko-KR") : "-",
    },
  ];

  return (
    <Card
      title="전자결재 문서 목록"
      style={{
        marginTop: 24,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <Spin spinning={loading} tip="로딩 중...">
        <Table
          rowKey={(record) => record.id}
          dataSource={approvals}
          columns={columns}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Spin>
    </Card>
  );
};

export default ApprovalList;
