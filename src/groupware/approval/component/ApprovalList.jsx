import React, { useEffect, useState } from "react";
import { Table, message, Card, Spin, Input, Modal, Button, Space } from "antd";
import { deleteDocument, getApprovalList } from "../../../api/groupware/approvalApi";
import { useNavigate } from "react-router-dom";

const ApprovalList = ({ refreshKey = 0 }) => {
  const [loading, setLoading] = useState(false);
  const [approvals, setApprovals] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    docId: null,
    reason: "",
  });

  const navigate = useNavigate();

  /**
   * ✅ 결재문서 목록 로드
   * 백엔드 응답 구조:
   * {
   *   dtoList: [...],
   *   pageRequestDTO: { page: 1, size: 10 },
   *   totalCount: 23,
   *   prev: false, next: true
   * }
   */
  const loadApprovals = async (page = 1, size = 10) => {
    try {
      setLoading(true);
      const res = await getApprovalList(page, size);

      if (res && res.dtoList) {
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
    loadApprovals(pagination.current, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  /** ✅ 페이지 변경 시 호출 */
  const handleTableChange = (paginationConfig) => {
    loadApprovals(paginationConfig.current, paginationConfig.pageSize);
  };

  /** ✅ 삭제 버튼 클릭 시 모달 오픈 */
  const openDeleteModal = (docId) => {
    setDeleteModal({ open: true, docId, reason: "" });
  };

  /** ✅ 삭제 실행 */
  const handleDelete = async () => {
    if (!deleteModal.reason.trim()) {
      message.warning("삭제 사유를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      await deleteDocument(deleteModal.docId, deleteModal.reason);
      message.success("문서가 삭제되었습니다.");
      setDeleteModal({ open: false, docId: null, reason: "" });
      loadApprovals(pagination.current, pagination.pageSize);
    } catch (err) {
      console.error("❌ 문서 삭제 실패:", err);
      message.error("문서 삭제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
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
        const color =
          status === "IN_PROGRESS"
            ? "orange"
            : status === "APPROVED"
              ? "green"
              : status === "REJECTED"
                ? "red"
                : "gray";
        return <span style={{ color, fontWeight: 600 }}>{status}</span>;
      },
    },
    {
      title: "작성자",
      dataIndex: "username",
      key: "username",
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
    {
      title: "관리",
      key: "actions",
      align: "center",
      render: (_, record) => {
        const deletable =
          record.status === "DRAFT" || record.status === "REJECTED";
        return (
          <Space>
            <Button
              danger
              size="small"
              disabled={!deletable}
              onClick={() => openDeleteModal(record.id)}
            >
              삭제
            </Button>
          </Space>
        );
      },
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
      {/* ✅ 삭제 모달 */}
      <Modal
        title="🗑️ 문서 삭제 확인"
        open={deleteModal.open}
        onCancel={() => setDeleteModal({ open: false, docId: null, reason: "" })}
        footer={null}
      >
        <p>정말로 이 문서를 삭제하시겠습니까?</p>
        <Input.TextArea
          rows={3}
          placeholder="삭제 사유를 입력하세요 (예: 잘못 작성된 문서)"
          value={deleteModal.reason}
          onChange={(e) =>
            setDeleteModal({ ...deleteModal, reason: e.target.value })
          }
        />
        <div style={{ textAlign: "right", marginTop: 16 }}>
          <Button
            onClick={() =>
              setDeleteModal({ open: false, docId: null, reason: "" })
            }
            style={{ marginRight: 8 }}
          >
            취소
          </Button>
          <Button danger type="primary" loading={loading} onClick={handleDelete}>
            삭제
          </Button>
        </div>
      </Modal>
    </Card>
  );
};

export default ApprovalList;
