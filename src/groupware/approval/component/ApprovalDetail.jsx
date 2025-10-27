import React, { useEffect, useState } from "react";
import { Descriptions, Tag, List, Card, message, Button, Divider, Space, Typography, Empty, Modal, Input, } from "antd";
import { ArrowLeftOutlined, FileOutlined, CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, RedoOutlined, DownloadOutlined, EyeOutlined, } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { approveDocument, downloadFile, downloadPdf, getApprovalDetail, previewFileAxios, previewPdf, rejectDocument, } from "../../../api/groupware/approvalApi";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import axiosInstance from "../../../common/axiosInstance";


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
    const { user: currentUser } = useSelector((state) => state.auth);
    const [isCurrentUserTheApprover, setIsCurrentUserTheApprover] = useState(false);

    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [numPages, setNumPages] = useState(0);

    /* ===========================================================
        ✅ 문서 상세조회 및 현재 결재자 확인
    =========================================================== */
    useEffect(() => {
        if (!docId || !currentUser) return;

        const fetchDetail = async () => {
            try {
                const res = await getApprovalDetail(docId);
                setDetail(res);
                console.log("📄 [상세조회 성공]", res);

                const { status, approvalLine, currentApproverIndex } = res;
                const userEmpNo = currentUser.empNo || currentUser.email?.split("@")[0] || "";

                // 🔹 안전 가드 추가
                if (
                    res.status === "IN_PROGRESS" &&
                    Array.isArray(res.approvalLine) &&
                    res.approvalLine.length > 0 &&
                    typeof res.currentApproverIndex === "number" &&
                    res.currentApproverIndex < res.approvalLine.length
                ) {
                    const currentStep = res.approvalLine[res.currentApproverIndex];

                    const equalsIgnoreCaseTrim = (a, b) => {
                        if (!a || !b) return false;
                        return a.toString().trim().toLowerCase() === b.toString().trim().toLowerCase();
                    };

                    const isApprover =
                        currentStep &&
                        (
                            equalsIgnoreCaseTrim(currentStep.approverId, currentUser.username) ||
                            equalsIgnoreCaseTrim(currentStep.approverId, currentUser.empNo) ||
                            equalsIgnoreCaseTrim(currentStep.approverName, currentUser.empName)
                        );

                    setIsCurrentUserTheApprover(isApprover);

                    if (isApprover) {
                        message.success(`현재 결재자: ${currentUser.empName}`, 1.5);
                    } else {
                        console.log("🚫 현재 결재자가 아닙니다.");
                        console.log("🔍 비교값 →", {
                            approverId: currentStep.approverId,
                            approverName: currentStep.approverName,
                            username: currentUser.username,
                            empNo: currentUser.empNo,
                            empName: currentUser.empName,
                            email: currentUser.email,
                            currentApproverIndex: res.currentApproverIndex,
                        });
                    }
                } else {
                    console.warn("⚠️ 결재선 정보가 비어 있거나 currentApproverIndex가 유효하지 않습니다.");
                    setIsCurrentUserTheApprover(false);
                }
            } catch (err) {
                console.error("❌ 문서 상세조회 실패:", err);
                message.error("문서 정보를 불러올 수 없습니다.");
            }
        };

        fetchDetail();
    }, [docId, currentUser]);

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
        if (!detail || !detail.id) {
            message.error("문서 정보가 없습니다.");
            return;
        }

        try {
            await approveDocument(detail.docId || detail.id, detail.approvalLine || []);
            message.success("문서가 승인되었습니다 ✅");
            navigate("/approvals");
        } catch (err) {
            console.error("❌ 승인 처리 중 오류:", err);
            if (err.response && err.response.status === 403) {
                message.error(err.response.data.message || "승인할 권한이 없습니다.");
            } else {
                message.error("승인 처리 중 오류가 발생했습니다.");
            }
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
            await rejectDocument(detail.id, rejectReason, detail.approvalLine || []);
            message.success("문서가 반려되었습니다 ❌");
            setIsRejectModalOpen(false);
            navigate("/approvals");
        } catch (err) {
            console.error("❌ 반려 처리 중 오류:", err);
            if (err.response && err.response.status === 403) {
                message.error(err.response.data.message || "반려할 권한이 없습니다.");
            } else {
                message.error("반려 처리 중 오류가 발생했습니다.");
            }
        }
    };

    /* ===========================================================
       ✅ 재상신 조건
    =========================================================== */
    const canRewriteOrResubmit =
        ["REJECTED", "DRAFT"].includes(detail?.status) && // ✅ 반려 or 임시저장
        currentUser?.userId &&
        (currentUser?.username === detail?.username ||
            currentUser?.userId == detail?.userId);

    /* ===========================================================
        ✅ 3. 재작성/재상신 버튼 클릭 핸들러 (로직 통합)
    =========================================================== */
    const handleRewriteOrResubmit = () => {
        if (!detail) return;

        // DRAFT 상태일 때는 '수정(edit)' 페이지로, REJECTED 상태일 때는 '재상신(resubmit)' 페이지로 이동
        if (detail.status === "DRAFT") {
            navigate(`/approvals/${detail.id}/edit`, { state: detail });
        } else if (detail.status === "REJECTED") {
            navigate(`/approvals/${detail.id}/resubmit`, { state: detail });
        }
    };

    /* ===========================================================
     ✅ 미리보기 핸들러
  =========================================================== */
    const handlePreview = async (file) => {
        try {
            const res = await axiosInstance.get(`/approvals/attachments/preview/${file.id}`, {
                responseType: "blob",
            });
            const blob = new Blob([res.data], { type: res.headers["content-type"] });
            const url = URL.createObjectURL(blob);
            setPreviewFile({ ...file, blobUrl: url }); // ✅ blobUrl 저장
            setPreviewVisible(true);
        } catch (err) {
            console.error("미리보기 실패:", err);
            message.error("파일 미리보기를 불러올 수 없습니다.");
        }
    };

    const handleDownload = (file) => {
        window.open(`/api/upload/download/${file.id}`, "_blank");
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
                <Tag color={statusColors[detail.status]} style={{ fontSize: 14 }}>
                    {detail.status}
                </Tag>

                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => previewPdf(detail.docId || detail.id)}
                        size="middle"
                        style={{
                            borderRadius: 6,
                            fontWeight: 500,
                        }}
                    >
                        PDF 미리보기
                    </Button>
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={() => downloadPdf(detail.docId || detail.id)}
                        size="middle"
                        style={{
                            borderRadius: 6,
                            fontWeight: 500,
                        }}
                    >
                        PDF 다운로드
                    </Button>
                </Space>
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
                                    padding: "10px 8px",
                                }}
                            >
                                <Space direction="vertical" style={{ width: "100%" }}>
                                    <Space align="center">
                                        <Tag color={decisionColors[step.decision]}>
                                            {step.decision || "PENDING"}
                                        </Tag>
                                        <Text strong>
                                            {step.order}. {step.approverName}
                                        </Text>
                                        {step.decision === "APPROVED" && <CheckCircleOutlined style={{ color: "green" }} />}
                                        {step.decision === "REJECTED" && <CloseCircleOutlined style={{ color: "red" }} />}
                                    </Space>
                                    {step.comment && (
                                        <Text type="secondary" style={{ marginLeft: 32 }}>
                                            💬 {step.comment}
                                        </Text>
                                    )}

                                    {step.decidedAt && (
                                        <Text type="secondary" style={{ fontSize: "12px", marginLeft: 28 }}>
                                            ⏰ {dayjs(step.decidedAt).format("YYYY-MM-DD HH:mm")}
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
                                        onClick={() => previewFileAxios(file.id)}
                                    >
                                        미리보기
                                    </a>,
                                    <a
                                        key="download"
                                        onClick={() => downloadFile(file.id)}
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
                {/* --- 재작성/재상신 버튼 (하나의 블록으로 통합) --- */}
                {canRewriteOrResubmit && (
                    <Button
                        type="primary"
                        icon={<RedoOutlined />}
                        onClick={handleRewriteOrResubmit}
                        style={{ borderRadius: 8 }}
                    >
                        {detail.status === "DRAFT" ? "📝 재작성" : "🔁 재상신"}
                    </Button>
                )}

                {detail.status === "IN_PROGRESS" && (
                    <>
                        <Button
                            icon={<CheckCircleOutlined />}
                            type="primary"
                            onClick={handleApprove}
                            disabled={!isCurrentUserTheApprover} // ✅ 비활성화 로직 적용
                            style={{ borderRadius: 8 }}
                        >
                            승인
                        </Button>
                        <Button
                            icon={<CloseCircleOutlined />}
                            danger
                            onClick={() => setIsRejectModalOpen(true)}
                            disabled={!isCurrentUserTheApprover} // ✅ 비활성화 로직 적용
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

                {/* ✅ 미리보기 모달 */}
                <Modal
                    open={previewVisible}
                    onCancel={() => setPreviewVisible(false)}
                    footer={null}
                    width="50%"
                    style={{ top: 20 }}
                    bodyStyle={{
                        padding: "0 24px 24px 24px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    {previewFile ? (
                        <>
                            <h3 style={{
                                textAlign: "center",
                                margin: "16px 0",
                                fontWeight: 600,
                                fontSize: "16px",
                                color: "#222",
                            }}>{previewFile.originalName}</h3>

                            {previewFile.contentType?.startsWith("image/") ? (
                                <img
                                    src={`http://localhost:8080/api/attachments/preview/${previewFile.id}?_t=${Date.now()}`}
                                    alt={previewFile.originalName}
                                    style={{
                                        width: "100%",
                                        maxHeight: "80vh",
                                        objectFit: "contain",
                                        borderRadius: 8,
                                    }}
                                />
                            ) : previewFile.contentType === "application/pdf" ? (
                                <div
                                    style={{
                                        width: "100%",
                                        maxHeight: "75vh",
                                        overflowY: "auto", // 🔥 내부만 스크롤 가능
                                        display: "flex",
                                        justifyContent: "center",
                                        padding: "8px 0",
                                    }}
                                >
                                    <Document
                                        file={previewFile?.blobUrl}
                                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                        loading={<p>PDF 불러오는 중...</p>}
                                        error={<p>⚠️ PDF를 불러올 수 없습니다.</p>}
                                    >
                                        {/* ✅ 모든 페이지 반복 렌더링 */}
                                        {Array.from(new Array(numPages), (el, index) => (
                                            <Page
                                                key={`page_${index + 1}`}
                                                pageNumber={index + 1}
                                                width={800} // 너비 조정
                                                renderTextLayer={false}
                                                renderAnnotationLayer={true}
                                            />
                                        ))}
                                    </Document>
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: "50px 0", color: "#999" }}>
                                    <p>⚠️ 미리보기를 지원하지 않는 파일 형식입니다.</p>
                                    <Button type="primary" onClick={() => handleDownload(previewFile)}>
                                        다운로드
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p>파일 정보를 불러오는 중...</p>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default ApprovalDetail;
