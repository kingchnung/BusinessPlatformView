import React, { useEffect, useState } from "react";
import { Table, Button, Space, message, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { getBoardList } from "../../../api/groupware/boardApi";

const BoardList = () => {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchBoards = async () => {
        try {
            setLoading(true);
            const data = await getBoardList("GENERAL"); // 기본 NORMAL
            setBoards(Array.isArray(data) ? data : []);
        } catch (err) {
            message.error("게시글 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoards();
    }, []);

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
                    NOTICE: { label: "공지사항", color: "blue" },
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
                <a onClick={() => navigate(`/board/${record.boardNo}`)}>{text}</a>
            ),
        },
        {
            title: "작성자",
            dataIndex: "authorName",
            key: "authorName",
            width: 150,
        },
        {
            title: "작성일",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 150,
            render: (text) => text?.substring(0, 10),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Space style={{ marginBottom: 16 }}>
                <Button type="primary" onClick={() => navigate("/boards/write")}>
                    새 글 작성
                </Button>
            </Space>

            <Table
                rowKey="boardNo"
                columns={columns}
                dataSource={boards}
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default BoardList;
