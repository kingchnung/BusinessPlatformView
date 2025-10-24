import React, { useEffect, useState } from "react";
import {
    Table,
    Button,
    Space,
    message,
    Tag,
    Select,
    Input,
    Row,
    Col,
} from "antd";
import { useNavigate } from "react-router-dom";
import { fetchBoardList } from "../../../api/groupware/boardApi"; // ✅ axios API

const { Search } = Input;
const { Option } = Select;

const BoardList = () => {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedType, setSelectedType] = useState("ALL");
    const [keyword, setKeyword] = useState("");
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const navigate = useNavigate();

    /** 최초 렌더링 시 1페이지 로드 */
    useEffect(() => {
        // ✅ page=1, size=10만 명확히 넘기고 나머지 기본값으로 처리
        loadBoards(1, 10, keyword, selectedType);
    }, []);


    /** ✅ 서버에서 게시글 목록 로드 */
    const loadBoards = async (page = 1, size = 10, keyword = "", type = "ALL") => {
        try {
            setLoading(true);

            // ✅ undefined 방어 (문자열 "undefined"로 변환되지 않도록)
            const safePage = Number(page) || 1;
            const safeSize = Number(size) || 10;

            const data = await fetchBoardList({
                page: safePage,
                size: safeSize,
                keyword: keyword ?? "",
                type: type ?? "ALL",
            });

            console.log("📦 서버 응답:", data);

            setBoards(data?.dtoList ?? []);
            setPagination({
                current: data?.pageRequestDTO?.page ?? safePage,
                pageSize: data?.pageRequestDTO?.size ?? safeSize,
                total: data?.totalCount ?? 0,
            });
        } catch (err) {
            console.error("❌ 게시글 목록 불러오기 실패:", err);
            message.error("게시글 목록 불러오기 실패");
        } finally {
            setLoading(false);
        }
    };

    /** ✅ 게시판 유형 변경 */
    const handleTypeChange = (value) => {
        setSelectedType(value);
        loadBoards(1, pagination.pageSize, keyword, value);
    };

    /** ✅ 검색 */
    const handleSearch = (value) => {
        setKeyword(value);
        loadBoards(1, pagination.pageSize, value, selectedType);
    };

    /** ✅ 페이지 변경 (AntD Table pagination 연동) */
    const handleTableChange = (page, pageSize) => {
        loadBoards(page, pageSize, keyword, selectedType);
    };

    /** ✅ 컬럼 정의 */
    const columns = [
        {
            title: "번호",
            dataIndex: "boardNo",
            key: "boardNo",
            align: "center",
            width: 80,
            render: (_, __, index) =>
                (pagination.current - 1) * pagination.pageSize + (index + 1),
        },
        {
            title: "분류",
            dataIndex: "boardType",
            key: "boardType",
            width: 120,
            render: (type) => {
                const typeMap = {
                    NOTICE: { label: "공지사항", color: "geekblue" },
                    GENERAL: { label: "일반게시판", color: "green" },
                    SUGGESTION: { label: "익명건의", color: "volcano" },
                };
                const tagInfo = typeMap[type] || { label: type, color: "default" };
                return <Tag color={tagInfo.color}>{tagInfo.label}</Tag>;
            },
        },
        {
            title: "제목",
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <a onClick={() => navigate(`/boards/${record.boardNo}`)}>{text}</a>
            ),
        },
        {
            title: "작성자",
            dataIndex: "authorName",
            key: "authorName",
            width: 150,
            render: (name, record) =>
                record.boardType === "NOTICE" ? "관리자" : name,
        },
        {
            title: "작성일",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 150,
            render: (text) => text ? text.substring(0, 10) : "-",
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Space>
                        {/* ✅ 게시판 유형 선택 */}
                        <Select
                            value={selectedType}
                            onChange={handleTypeChange}
                            style={{ width: 150 }}
                        >
                            <Option value="ALL">전체 게시판</Option>
                            <Option value="NOTICE">공지사항</Option>
                            <Option value="GENERAL">일반게시판</Option>
                            <Option value="SUGGESTION">익명건의</Option>
                        </Select>

                        {/* ✅ 검색 */}
                        <Search
                            placeholder="제목, 내용, 작성자 검색"
                            allowClear
                            enterButton="검색"
                            onSearch={handleSearch}
                            style={{ width: 300 }}
                        />
                    </Space>
                </Col>

                <Col>
                    <Button type="primary" onClick={() => navigate("/boards/write")}>
                        새 글 작성
                    </Button>
                </Col>
            </Row>

            {/* ✅ 테이블 */}
            <Table
                rowKey="boardNo"
                columns={columns}
                dataSource={boards}
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    onChange: handleTableChange,
                }}
                rowClassName={(record) =>
                    record.boardType === "NOTICE" ? "notice-row" : ""
                }
                style={{ borderRadius: 8 }}
            />

            {/* ✅ 공지사항 행 강조 */}
            <style>
                {`
          .notice-row > td {
            background-color: #f0f5ff !important;
            font-weight: 500 !important;
            transition: background-color 0.2s ease;
          }
        `}
            </style>
        </div>
    );
};

export default BoardList;
