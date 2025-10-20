import React, { useEffect, useState } from "react";
import { Table, Card, message, Space, Button, Tag, Input, Select, Row, Col } from "antd";
import { forceApprove, forceReject, getAdminApprovalList, getApprovalList } from "../../api/groupware/approvalApi";
import { useNavigate } from "react-router-dom";
import { SearchOutlined, CheckOutlined, StopOutlined, ReloadOutlined } from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

/**
 * ✅ 관리자용 전자결재 관리 페이지
 * - 전체 문서 조회 가능
 * - 강제 승인/반려 (시연용)
 */
const ApprovalAdminPage = () => {
    const [loading, setLoading] = useState(false);
    const [approvals, setApprovals] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const navigate = useNavigate();

    /** ✅ 문서 목록 로드 */
    const loadApprovals = async (page = 1, size = 10, keyword = searchText) => {
        try {
            setLoading(true);
            const res = await getApprovalList(page, size, keyword);
            if (res && res.dtoList) {
                setApprovals(res.dtoList);
                setPagination({
                    current: res.pageRequestDTO.page,
                    pageSize: res.pageRequestDTO.size,
                    total: res.totalCount,
                });
            }
        } catch (err) {
            console.error("❌ 관리자 문서조회 실패:", err);
            message.error("문서를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    /** 초기 로드 */
    useEffect(() => {
        loadApprovals(1, 10);
    }, []);

    /** ✅ 강제 승인 */
    const handleForceApprove = async (docId) => {
        try {
            await forceApprove(docId, "관리자 강제 승인 처리");
            message.success(`문서(${docId}) 강제 승인 완료`);
            loadApprovals(pagination.current, pagination.pageSize);
        } catch (err) {
            console.error("강제 승인 실패:", err);
            message.error("강제 승인 중 오류 발생");
        }
    };

    /** ✅ 강제 반려 */
    const handleForceReject = async (docId) => {
        try {
            const reason = prompt("반려 사유를 입력하세요."); // ✅ 간단한 입력 예시
            if (!reason) return;
            await forceReject(docId, reason);
            message.warning(`문서(${docId}) 강제 반려 완료`);
            loadApprovals(pagination.current, pagination.pageSize);
        } catch (err) {
            console.error("강제 반려 실패:", err);
            message.error("강제 반려 중 오류 발생");
        }
    };

    const columns = [
        { title: "문서번호", dataIndex: "id", key: "id", align: "center" },
        {
            title: "제목",
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <a
                    onClick={() => navigate(`/approvals/${record.id}`)}
                    style={{ color: "#1677ff" }}
                >
                    {text}
                </a>
            ),
        },
        { title: "부서", dataIndex: "departmentName", align: "center" },
        { title: "작성자", dataIndex: "username", align: "center" },
        {
            title: "상태",
            dataIndex: "status",
            align: "center",
            render: (status) => {
                const color =
                    status === "IN_PROGRESS"
                        ? "blue"
                        : status === "APPROVED"
                            ? "green"
                            : status === "REJECTED"
                                ? "volcano"
                                : "gray";
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: "작업",
            key: "actions",
            align: "center",
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => handleForceApprove(record.id)}
                    >
                        강제승인
                    </Button>
                    <Button
                        size="small"
                        danger
                        icon={<StopOutlined />}
                        onClick={() => handleForceReject(record.id)}
                    >
                        강제반려
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title="📑 전자결재 관리"
            extra={
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => loadApprovals(1, pagination.pageSize)}
                >
                    새로고침
                </Button>
            }
            style={{
                margin: 20,
                borderRadius: 12,
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
        >
            <Row gutter={12} style={{ marginBottom: 16 }}>
                <Col flex="200px">
                    <Select
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value)}
                        style={{ width: "100%" }}
                    >
                        <Option value="ALL">전체</Option>
                        <Option value="DRAFT">임시저장</Option>
                        <Option value="IN_PROGRESS">진행중</Option>
                        <Option value="APPROVED">승인됨</Option>
                        <Option value="REJECTED">반려됨</Option>
                    </Select>
                </Col>
                <Col flex="auto">
                    <Search
                        placeholder="문서 제목 또는 작성자 검색"
                        allowClear
                        enterButton={<SearchOutlined />}
                        onSearch={(value) => {
                            setSearchText(value);
                            loadApprovals(1, pagination.pageSize, value); // ✅ 검색어 전달
                        }}
                        style={{ width: 300 }}
                    />
                </Col>
            </Row>

            <Table
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={approvals}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    onChange: (page, size) => loadApprovals(page, size),
                    showTotal: (total) => `총 ${total}건`,
                }}
            />
        </Card>
    );
};

export default ApprovalAdminPage;
