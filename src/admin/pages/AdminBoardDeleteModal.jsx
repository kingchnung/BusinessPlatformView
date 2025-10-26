import React, { useEffect, useMemo, useState } from "react";
import {
    Modal, Form, Select, Input, Space, Button, Table, Tag, message
} from "antd";
import { SearchOutlined, DeleteOutlined } from "@ant-design/icons";
import { fetchBoardList, deleteBoard } from "../../api/groupware/boardApi";
const { Option } = Select;


const AdminBoardDeleteModal = ({ open, onClose, onDeleted }) => {
    const [form] = Form.useForm();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [modal, contextHolder] = Modal.useModal();


    const searchValues = useMemo(() => form.getFieldsValue(), [form]); // 최신 값 참조용

    const load = async (page = 1, size = 10) => {
        try {
            setLoading(true);
            const { boardType = "ALL", searchType = "ALL", keyword = "" } = form.getFieldsValue();

            // ✅ 목록 화면과 동일한 규칙으로 보냄
            // - 백엔드 컨트롤러는 @ModelAttribute PageRequestDTO로 받음
            // - 목록에서는 'type' 파라미터를 사용하니 그대로 맞춤
            const params = {
                page,
                size,
                keyword: (keyword ?? "").trim(),
                type: boardType ?? "ALL",           // ← 목록과 동일 키 사용
                searchType: searchType ?? "ALL",    // ← 목록과 동일 값 사용
            };

            // 필요하면 여기서 searchType 값을 백엔드 기대값으로 맵핑
            // (레포가 'authorName'을 기대하면 아래 한 줄 유지)
            if (params.searchType === "author") params.searchType = "authorName";

            const data = await fetchBoardList(params);

            setList(Array.isArray(data?.dtoList) ? data.dtoList : []);
            setPagination({
                current: Number(data?.pageRequestDTO?.page) || page,
                pageSize: Number(data?.pageRequestDTO?.size) || size,
                total: Number(data?.totalCount) || (Array.isArray(data?.dtoList) ? data.dtoList.length : 0),
            });
            setSelectedRowKeys([]);
        } catch (e) {
            console.error(e);
            message.error(e?.response?.data?.message || e?.message || "검색 실패");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!open) return;
        form.setFieldsValue({ boardType: "ALL", searchType: "ALL", keyword: "" });
        load(1, 10);
    }, [open]);

    const handleSearch = () => load(1, pagination.pageSize);
    const handleTableChange = (page, pageSize) => load(page, pageSize);

    const handleDeleteSelected = async () => {
        if (selectedRowKeys.length === 0) return message.warning("삭제할 게시글을 선택하세요.");
        modal.confirm({
            title: `선택한 ${selectedRowKeys.length}건을 삭제하시겠습니까?`,
            okText: "삭제",
            okType: "danger",
            cancelText: "취소",
            zIndex: 2000, // 부모 모달보다 높게
            onOk: async () => {
                try {
                    setLoading(true);
                    // 병렬 삭제
                    await Promise.all(selectedRowKeys.map((id) => deleteBoard(id)));
                    message.success("삭제 완료");
                    await load(pagination.current, pagination.pageSize);
                    onDeleted?.();  //부모 목록 새로고침 트리거
                    //onClose?.();
                } catch (err) {
                    const msg = err?.message || err?.response?.data?.message || "삭제 중 오류";
                    message.error(msg);
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const columns = [
        {
            title: "번호",
            dataIndex: "boardNo",
            width: 90,
            align: "center",
            render: (no) => no,
        },
        {
            title: "분류",
            dataIndex: "boardType",
            width: 120,
            render: (type) => {
                const map = {
                    NOTICE: { label: "공지사항", color: "geekblue" },
                    GENERAL: { label: "일반게시판", color: "green" },
                    SUGGESTION: { label: "익명건의", color: "volcano" },
                };
                const t = map[type] || { label: type, color: "default" };
                return <Tag color={t.color}>{t.label}</Tag>;
            },
            filters: [
                { text: "전체", value: "ALL" },
                { text: "공지사항", value: "NOTICE" },
                { text: "일반게시판", value: "GENERAL" },
                { text: "익명건의", value: "SUGGESTION" },
            ],
            onFilter: (value, record) => (value === "ALL" ? true : record.boardType === value),
        },
        {
            title: "제목",
            dataIndex: "title",
            ellipsis: true,
        },
        {
            title: "작성자",
            dataIndex: "authorName",
            width: 140,
        },
        {
            title: "작성일",
            dataIndex: "createdAt",
            width: 140,
            render: (t) => (t ? t.substring(0, 10) : "-"),
            sorter: (a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""),
        },
    ];

    return (
        <Modal
            title="게시글 삭제"
            open={open}
            onCancel={onClose}
            width={1000}
            footer={null}
            destroyOnClose
        >
            {contextHolder} {/* ← 확인창을 이 컨텍스트에 렌더링 */}
            {/* 검색 폼 */}
            <Form form={form} layout="inline" onFinish={handleSearch} style={{ marginBottom: 12 }}>
                <Form.Item name="boardType" >
                    <Select style={{ width: 150 }}>
                        <Option value="ALL">전체 게시판</Option>
                        <Option value="NOTICE">공지사항 게시판</Option>
                        <Option value="GENERAL">일반게시판</Option>
                        <Option value="SUGGESTION">익명건의 게시판</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="searchType" initialValue="ALL">
                    <Select style={{ width: 140 }}>
                        <Option value="ALL">전체</Option>
                        <Option value="title">제목</Option>
                        <Option value="content">본문</Option>
                        <Option value="author">작성자</Option> {/* ← 목록과 동일 키 */}
                    </Select>
                </Form.Item>
                <Form.Item name="keyword" >
                    <Input allowClear placeholder="검색어 입력" style={{ width: 200 }} />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button icon={<SearchOutlined />} type="primary" htmlType="submit" loading={loading}>
                            검색
                        </Button>
                        <Button onClick={() => { form.resetFields(); load(1, pagination.pageSize); }}>
                            초기화
                        </Button>
                    </Space>
                </Form.Item>
                <Form.Item style={{ marginLeft: "auto" }}>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleDeleteSelected}
                        disabled={selectedRowKeys.length === 0}
                    >
                        선택 삭제 ({selectedRowKeys.length})
                    </Button>
                </Form.Item>
            </Form>

            {/* 검색 결과 테이블 */}
            <Table
                rowKey="boardNo"
                dataSource={list}
                columns={columns}
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    onChange: (page, size) => handleTableChange(page, size),
                }}
                rowSelection={{
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                    preserveSelectedRowKeys: true,
                }}
                rowClassName={(r) => (r.boardType === "NOTICE" ? "notice-row" : "")}
                size="middle"
            />

            <style>
                {`
          .notice-row > td { background-color: #f0f5ff !important; font-weight: 500; }
        `}
            </style>
        </Modal>
    );
};

export default AdminBoardDeleteModal;