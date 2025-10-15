import React, { useEffect, useState } from "react";
import {
    Descriptions,
    Tag,
    List,
    Card,
    message,
    Button,
    Divider,
    Space,
    Typography,
    Empty,
    Modal,
    Input,
} from "antd";
import {
    ArrowLeftOutlined,
    FileOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    LoadingOutlined,
    RedoOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
    approveDocument,
    getApprovalDetail,
    rejectDocument,
} from "../../../api/groupware/approvalApi";

const { Title, Text } = Typography;

const statusColors = {
    DRAFT: "default",
    IN_PROGRESS: "processing",
    APPROVED: "success",
    REJECTED: "error",
    DELETED: "warning",
    RESUBMITTED: "purple",
};

const decisionColors = {
    PENDING: "default",
    APPROVED: "green",
    REJECTED: "red",
};

const ApprovalDetail = ({ docId }) => {
    const navigate = useNavigate();
    const [detail, setDetail] = useState(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const currentUser = JSON.parse(localStorage.getItem("user"));

    /* ===========================================================
       ✅ 문서 상세조회
    =========================================================== */
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await getApprovalDetail(docId);
                setDetail(res);
                console.log("📄 [상세조회 성공]", res);
            } catch (err) {
                console.error("❌ 문서 상세조회 실패:", err);
                message.error("문서 정보를 불러올 수 없습니다.");
            }
        };
        fetchDetail();
    }, [docId]);

    // detail이 로드된 후 로그 출력
    useEffect(() => {
        if (detail && currentUser) {
            console.log("✅ currentUser:", currentUser);
            console.log("✅ detail.userId:", detail.userId);
            console.log("✅ detail.username:", detail.username);
        }
    }, [detail, currentUser]);

    /* ===========================================================
       ✅ 승인 처리
    =========================================================== */
    const handleApprove = async () => {
        try {
            await approveDocument(detail.id);
            message.success("문서가 승인되었습니다 ✅");
            navigate("/approvals");
        } catch (err) {
            console.error(err);
            message.error("승인 처리 중 오류가 발생했습니다.");
        }
    };

    /* ===========================================================
       ✅ 반려 처리
    =========================================================== */
    const handleReject = async () => {
        if (!rejectReason.trim()) {
            message.warning("반려 사유를 입력해주세요.");
            return;
        }
        try {
            await rejectDocument(detail.id, rejectReason);
            message.success("문서가 반려되었습니다 ❌");
            setIsRejectModalOpen(false);
            navigate("/approvals");
        } catch (err) {
            console.error(err);
            message.error("반려 처리 중 오류가 발생했습니다.");
        }
    };

    /* ===========================================================
       ✅ 재상신 조건
    =========================================================== */
    const canResubmit =
        ["REJECTED", "DRAFT"].includes(detail?.status) && // ✅ 반려 or 임시저장
        currentUser?.userId &&
        (currentUser?.username === detail?.username ||
            currentUser?.userId == detail?.userId);

    /* ===========================================================
       ✅ 재상신 클릭 시 이동
    =========================================================== */
    const handleResubmit = () => {
        if (!detail) {
            message.warning("문서 정보를 불러올 수 없습니다.");
            return;
        }
        navigate(`/approvals/${detail.id}/resubmit`, { state: { ...detail } });
    };

    /* ===========================================================
       ✅ null-safe 렌더링 가드
    =========================================================== */
    if (!currentUser) {
        return (
            <div style={{ textAlign: "center", padding: "60px" }}>
                <p>로그인 정보가 없습니다. 다시 로그인해주세요.</p>
            </div>
        );
    }

    if (!detail) {
        return (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
                <LoadingOutlined style={{ fontSize: 28, color: "#1677ff" }} />
                <p style={{ color: "#888", marginTop: 8 }}>문서 정보를 불러오는 중...</p>
            </div>
        );
    }

    /* ===========================================================
       ✅ 렌더링 시작
    =========================================================== */
    return (
        <div style={{ padding: 24 }}>
            {/* ✅ 상단 헤더 */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                }}
            >
                <Space>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate("/approvals")}
                        type="default"
                        style={{
                            borderRadius: 6,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        }}
                    >
                        목록으로
                    </Button>
                    <Title
                        level={4}
                        style={{ margin: 0, color: "#1f1f1f", letterSpacing: "-0.2px" }}
                    >
                        문서 상세보기
                    </Title>
                </Space>
                <Tag color={statusColors[detail.status]} style={{ fontSize: 14 }}>
                    {detail.status}
                </Tag>
            </div>

            {/* ✅ 문서 기본정보 */}
            <Card
                bordered
                style={{ marginBottom: 24, borderRadius: 12 }}
                bodyStyle={{ padding: 20 }}
            >
                <Descriptions
                    bordered
                    size="middle"
                    column={2}
                    labelStyle={{
                        backgroundColor: "#fafafa",
                        width: "30%",
                        fontWeight: 500,
                    }}
                >
                    <Descriptions.Item label="문서 ID">{detail.id || "-"}</Descriptions.Item>
                    <Descriptions.Item label="제목">{detail.title || "-"}</Descriptions.Item>
                    <Descriptions.Item label="부서명">
                        {detail.departmentName || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="작성자">
                        {detail.authorName || detail.username || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label="작성일">
                        {detail.createdAt ? detail.createdAt.substring(0, 10) : "-"}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* ✅ 결재 라인 섹션 */}
            <Card
                title={<strong>결재 진행 현황</strong>}
                bordered
                style={{ marginBottom: 24, borderRadius: 12 }}
                headStyle={{ backgroundColor: "#fafafa" }}
                bodyStyle={{ padding: 16 }}
            >
                {detail.approvalLine?.length > 0 ? (
                    <List
                        dataSource={detail.approvalLine}
                        renderItem={(step) => (
                            <List.Item
                                style={{
                                    borderBottom: "1px solid #f0f0f0",
                                    padding: "10px 4px",
                                }}
                            >
                                <Space direction="vertical" style={{ width: "100%" }}>
                                    <Space>
                                        <Tag color={decisionColors[step.decision]}>
                                            {step.decision || "PENDING"}
                                        </Tag>
                                        <Text strong>
                                            {step.order}. {step.approverName}
                                        </Text>
                                    </Space>
                                    {step.comment && (
                                        <Text type="secondary" style={{ marginLeft: 32 }}>
                                            💬 {step.comment}
                                        </Text>
                                    )}
                                </Space>
                            </List.Item>
                        )}
                    />
                ) : (
                    <Empty
                        description="결재자가 지정되지 않았습니다."
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                )}
            </Card>

            {/* ✅ 첨부파일 섹션 */}
            <Card
                title={<strong>첨부파일</strong>}
                bordered
                style={{ borderRadius: 12 }}
                headStyle={{ backgroundColor: "#fafafa" }}
                bodyStyle={{ padding: 16 }}
            >
                {detail.attachments?.length > 0 ? (
                    <List
                        dataSource={detail.attachments}
                        renderItem={(file) => (
                            <List.Item
                                style={{
                                    borderBottom: "1px solid #f5f5f5",
                                    padding: "10px 6px",
                                }}
                                actions={[
                                    <a
                                        key="preview"
                                        href={`http://localhost:8080/api/upload/preview/${file.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        미리보기
                                    </a>,
                                    <a
                                        key="download"
                                        href={`http://localhost:8080/api/upload/download/${file.id}`}
                                    >
                                        다운로드
                                    </a>,
                                ]}
                            >
                                <FileOutlined style={{ color: "#1677ff", marginRight: 6 }} />
                                <Text>
                                    {file.originalName}{" "}
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        ({(file.fileSize / 1024).toFixed(1)} KB)
                                    </Text>
                                </Text>
                            </List.Item>
                        )}
                    />
                ) : (
                    <Empty
                        description="첨부된 파일이 없습니다."
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                )}
            </Card>

            <Divider />

            {/* ✅ 하단 액션 영역 */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                    marginTop: 16,
                }}
            >
                {canResubmit && (
                    <Button
                        type="primary"
                        icon={<RedoOutlined />}
                        onClick={handleResubmit}
                        style={{ borderRadius: 8 }}
                    >
                        {detail.status === "DRAFT" ? "📝 재작성" : "🔁 재상신"}
                    </Button>
                )}

                {/* ✏️ 재작성 버튼 (임시저장 상태) */}
                {detail?.status === "DRAFT" && currentUser?.userId === detail?.userId && (
                    <Button
                        type="primary"
                        icon={<RedoOutlined />}
                        onClick={() =>
                            navigate(`/approvals/${detail.id}/edit`, { state: detail })
                        }
                        style={{ borderRadius: 8 }}
                    >
                        ✏️ 재작성
                    </Button>
                )}

                {detail.status === "IN_PROGRESS" && (
                    <>
                        <Button
                            icon={<CheckCircleOutlined />}
                            type="primary"
                            onClick={handleApprove}
                            style={{ borderRadius: 8 }}
                        >
                            승인
                        </Button>
                        <Button
                            icon={<CloseCircleOutlined />}
                            danger
                            onClick={() => setIsRejectModalOpen(true)}
                            style={{ borderRadius: 8 }}
                        >
                            반려
                        </Button>
                    </>
                )}

                <Button
                    onClick={() => navigate("/approvals")}
                    icon={<ArrowLeftOutlined />}
                    style={{ borderRadius: 8 }}
                >
                    목록으로 돌아가기
                </Button>

                {/* ✅ 반려 모달 */}
                <Modal
                    title="반려 사유 입력"
                    open={isRejectModalOpen}
                    okText="반려 확정"
                    cancelText="취소"
                    onOk={handleReject}
                    onCancel={() => setIsRejectModalOpen(false)}
                >
                    <Input.TextArea
                        rows={4}
                        placeholder="반려 사유를 입력하세요."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    />
                </Modal>
            </div>
        </div>
    );
};

export default ApprovalDetail;
