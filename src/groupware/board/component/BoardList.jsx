import React, { useEffect, useState } from "react";
import { Table, Button, Space, message, Tag, Select, Input, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { getBoardList } from "../../../api/groupware/boardApi";

const { Search } = Input;

const BoardList = () => {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedType, setSelectedType] = useState("ALL");
    const [keyword, setKeyword] = useState("");
    const navigate = useNavigate();

    // ✅ 데이터 로드
    const fetchBoards = async (type = "ALL", keyword = "") => {
        try {
            setLoading(true);
            const allData = (await getBoardList(type)) || [];
            let filtered = [...allData];

            // 타입 필터
            if (type !== "ALL") {
                filtered = filtered.filter((b) => b.boardType === type);
            }

            // 검색 필터
            if (keyword.trim()) {
                const lower = keyword.toLowerCase();
                filtered = filtered.filter(
                    (b) =>
                        b.title?.toLowerCase().includes(lower) ||
                        b.content?.toLowerCase().includes(lower) ||
                        b.authorName?.toLowerCase().includes(lower)
                );
            }

            // 공지사항 우선 정렬
            filtered.sort((a, b) => {
                if (a.boardType === "NOTICE" && b.boardType !== "NOTICE") return -1;
                if (a.boardType !== "NOTICE" && b.boardType === "NOTICE") return 1;
                return b.boardNo - a.boardNo;
            });

            setBoards(filtered);
        } catch (err) {
            console.error("❌ 게시글 목록 불러오기 실패:", err);
            message.error("게시글 목록 불러오기 실패");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoards();
    }, []);

    const handleTypeChange = (value) => {
        setSelectedType(value);
        fetchBoards(value, keyword);
    };

    const handleSearch = (value) => {
        setKeyword(value);
        fetchBoards(selectedType, value);
    };

    // ✅ 컬럼 정의
    const columns = [
        {
            title: "번호",
            dataIndex: "boardNo",
            key: "boardNo",
            align: "center",
            width: 80,
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
            render: (text) => text?.substring(0, 10),
        },
    ];

    // ✅ 행 스타일 지정 (공지사항 강조)
    const rowClassName = (record) => {
        if (record.boardType === "NOTICE") {
            return "notice-row"; // 스타일 클래스
        }
        return "";
    };

    return (
        <div style={{ padding: 24 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Space>
                        <Select
                            value={selectedType}
                            onChange={handleTypeChange}
                            style={{ width: 150 }}
                        >
                            <Select.Option value="ALL">전체 게시판</Select.Option>
                            <Select.Option value="NOTICE">공지사항</Select.Option>
                            <Select.Option value="GENERAL">일반게시판</Select.Option>
                            <Select.Option value="SUGGESTION">익명건의</Select.Option>
                        </Select>

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

            <Table
                rowKey="boardNo"
                columns={columns}
                dataSource={boards}
                loading={loading}
                pagination={{ pageSize: 10 }}
                rowClassName={(record) =>
                    record.boardType === "NOTICE" ? "notice-row" : ""
                }
                style={{ borderRadius: 8 }}
            />
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
