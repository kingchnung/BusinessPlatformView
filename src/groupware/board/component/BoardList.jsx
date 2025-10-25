// BoardList.jsx (핵심 부분만)
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Select, Input, Button, Row, Col, Space, Tag, message } from "antd";
import { fetchBoardList } from "../../../api/groupware/boardApi";
import AdminBoardDeleteModal from "../../../admin/pages/AdminBoardDeleteModal"; // ← 경로는 위치에 맞게 조정
import { useSelector } from "react-redux";


const { Search } = Input;
const { Option } = Select;

const BoardList = () => {
  const { boardType } = useParams();       // ✅ '/boards/:boardType' 에서 읽기
  const navigate = useNavigate();

  // ✅ URL → 내부 필터 값으로 정규화
  const normalizedType = useMemo(() => {
    if (!boardType) return "ALL";
    const t = boardType.toUpperCase();
    return ["NOTICE", "GENERAL", "SUGGESTION"].includes(t) ? t : "ALL";
  }, [boardType]);

  const [selectedType, setSelectedType] = useState(normalizedType);
  const [keyword, setKeyword] = useState("");
  const [searchType, setSearchType] = useState("title");
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [adminModalOpen, setAdminModalOpen] = useState(false);  // ← 모달 on/off



  // ✅ 서버에서 목록 로드
  const loadBoards = async (page = 1, size = 10, keywordArg = "", typeArg = "ALL", searchTypeArg = "title") => {
    try {
      setLoading(true);
      const data = await fetchBoardList({
        page: Number(page) || 1,
        size: Number(size) || 10,
        keyword: keywordArg ?? "",
        // 서버는 'type'을 받아 Enum으로 보정(ALL이면 전체 조회)
        type: typeArg,
        searchType: searchTypeArg ?? "title",
      });
      setBoards(data?.dtoList ?? []);
      setPagination({
        current: data?.pageRequestDTO?.page ?? page,
        pageSize: data?.pageRequestDTO?.size ?? size,
        total: data?.totalCount ?? 0,
      });
    } catch (e) {
      console.error(e);
      message.error("게시글 목록 불러오기 실패");
    } finally {
      setLoading(false);
    }
  };

  // ✅ URL이 바뀌면 해당 게시판만 재조회
  useEffect(() => {
    setSelectedType(normalizedType);
    loadBoards(1, pagination.pageSize, keyword, normalizedType, searchType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedType]);

  // ✅ 최초 진입 시 1회 조회
  useEffect(() => {
    loadBoards(1, 10, keyword, selectedType, searchType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // (선택) 페이지 내부에서 드롭다운으로도 전환하고 싶다면:
  const handleTypeChange = (value) => {
    setSelectedType(value);
    loadBoards(1, pagination.pageSize, keyword, value, searchType);
    if (value === "ALL") navigate("/boards");
    else navigate(`/boards/type/${value.toLowerCase()}`);
  };


  // ✅ 관리자 판별: Redux → localStorage 순서로 권한 추출
  const currentUser = useSelector((s) => s?.loginSlice?.user);

  function extractAuthorities(u) {
    if (!u) return [];
    // 1) 배열 형태: ["ROLE_ADMIN"] 또는 [{authority:"ROLE_ADMIN"}]
    if (Array.isArray(u.authorities)) {
      return u.authorities
        .map(a => (typeof a === "string" ? a : a?.authority))
        .filter(Boolean);
    }
    // 2) 콤마 문자열: "ROLE_USER,ROLE_ADMIN"
    if (typeof u.authorities === "string") {
      return u.authorities.split(",").map(s => s.trim()).filter(Boolean);
    }
    // 3) roles 키를 쓰는 경우: ["ADMIN","USER"] 등
    if (Array.isArray(u.roles)) return u.roles.map(String);
    if (typeof u.roles === "string") {
      return u.roles.split(",").map(s => s.trim());
    }
    return [];
  }

  function getIsAdmin() {
    // a) Redux 우선
    let auths = extractAuthorities(currentUser);
    if (auths.length === 0) {
      // b) localStorage fallback
      try {
        const raw = localStorage.getItem("user");
        const u = raw ? JSON.parse(raw) : null;
        auths = extractAuthorities(u);
      } catch { }
    }
    const norm = auths.map(a => a?.toUpperCase());
    const ADMIN_SET = new Set(["ROLE_ADMIN", "ROLE_CEO", "SYS:ADMIN", "ADMIN", "CEO"]);
    return norm.some(a => ADMIN_SET.has(a));
  }

  const isAdmin = getIsAdmin();


  const handleSearch = (value) => {
    setKeyword(value);
    loadBoards(1, pagination.pageSize, value, selectedType, searchType);
  };
  const handleSearchTypeChange = (v) => {
    setSearchType(v);
    loadBoards(1, pagination.pageSize, keyword, selectedType, v);
  };
  const handleTableChange = (page, pageSize) => {
    loadBoards(page, pageSize, keyword, selectedType, searchType);
  };

  const columns = [
    { title: "번호", dataIndex: "boardNo", key: "boardNo", width: 100, align: "center" },
    {
      title: "분류", dataIndex: "boardType", key: "boardType", width: 120,
      render: (type) => {
        const map = { NOTICE: { label: "공지사항", color: "geekblue" }, GENERAL: { label: "일반게시판", color: "green" }, SUGGESTION: { label: "익명건의", color: "volcano" } };
        const t = map[type] || { label: type, color: "default" };
        return <Tag color={t.color}>{t.label}</Tag>;
      }
    },
    {
      title: "제목",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <a
          style={{ cursor: "pointer", color: "#1677ff" }}
          onClick={() => navigate(`/boards/${record.boardNo}`)}
        >
          {text}
        </a>
      ),
    },
    { title: "작성자", dataIndex: "authorName", key: "authorName", width: 150 },
    {
      title: "작성일", dataIndex: "createdAt", key: "createdAt", width: 150,
      render: (text) => (text ? text.substring(0, 10) : "-")
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            {/* (선택) 페이지 내부에서도 전환하려면 유지, 아니면 삭제 가능 */}
            <Select value={selectedType} onChange={handleTypeChange} style={{ width: 120 }}>
              <Option value="ALL">전체 게시판</Option>
              <Option value="NOTICE">공지사항</Option>
              <Option value="GENERAL">일반게시판</Option>
              <Option value="SUGGESTION">익명건의</Option>
            </Select>

            <Select value={searchType} onChange={handleSearchTypeChange} style={{ width: 120 }}>
              <Option value="title">제목</Option>
              <Option value="content">내용</Option>
              <Option value="authorName">작성자</Option>
            </Select>

            <Search placeholder="검색어를 입력하세요" allowClear enterButton="검색"
              onSearch={handleSearch} style={{ width: 220 }} />
          </Space>
        </Col>

        <Col>
          <Space>
            {isAdmin && (
              <Button onClick={() => setAdminModalOpen(true)} style={{ backgroundColor: "red", color: "white" }}>
                게시글 삭제
              </Button>
            )}
            <Button type="primary" onClick={() => navigate("/boards/write")}>
              새 글 작성
            </Button>
          </Space>
        </Col>
      </Row>

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
        rowClassName={(r) => (r.boardType === "NOTICE" ? "notice-row" : "")}
      />
      <AdminBoardDeleteModal
        open={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        isAdmin={isAdmin}
        boardTypeDefault={selectedType === "ALL" ? null : selectedType} // 현재 보던 게시판으로 초기값

        onDeleted={() => {
          // 삭제 완료 후 목록 새로고침
          loadBoards(1, pagination.pageSize, keyword, selectedType, searchType);
        }}
      />
      <style>{`
        .notice-row > td {
          background-color: #f0f5ff !important;
          font-weight: 500 !important;
          transition: background-color 0.2s ease;
        }
      `}</style>
    </div>
  );

};



export default BoardList;