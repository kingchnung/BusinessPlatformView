import React, { useEffect, useState } from "react";
import { Card, Input, Row, Col, Spin, Table, Tag, Tabs, Button, Popconfirm, message, Radio } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getEmployees } from "../slice/hrSlice";
import { getHistoryByEmployee } from "../../../api/hr/assignmentAPI";
import OverviewStats from "../../department/components/OverviewStatsMini";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { deleteEmployee } from "../../../api/hr/employeeApi";

/**
 * 🧑‍💼 EmployeeAdminPage.jsx
 * 관리자 전용 직원 조회 화면 (탭 기반 확장형)
 */
const EmployeeAdminPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { employees, loading: empLoading } = useSelector((state) => state.hr);

  const [searchText, setSearchText] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [historyMap, setHistoryMap] = useState({});
  const [activeTab, setActiveTab] = useState("active"); // 탭 상태 관리
  const [filtered, setFiltered] = useState([]);
  const [filterMode, setFilterMode] = useState("all"); // all | dept | grade
  

  // ✅ 삭제 기준 연도 (현재는 즉시 삭제 가능, 실제 운영시 3년 등으로 조정 가능)
  const DELETE_THRESHOLD_YEARS = 0; // ← 이 값을 3으로 바꾸면 “퇴직 후 3년”만 삭제 가능

  /** 1️⃣ 직원 데이터 로드 */
  useEffect(() => {
    dispatch(getEmployees());
  }, [dispatch]);

  /** 2️⃣ 직원 필터링 로직 (탭 + 검색 반응형) */
  useEffect(() => {
  if (!employees.length) return;

  const today = dayjs();
  let list = [...employees];

  // 탭별 필터 조건
  switch (activeTab) {
    case "active":
      list = list.filter((e) => e.status !== "RETIRED");
      break;
    case "recent":
      list = list.filter(
        (e) =>
          e.startDate &&
          today.diff(dayjs(e.startDate), "month") <= 3 &&
          e.status === "ACTIVE"
      );
      break;
    case "retired":
      list = list.filter((e) => e.status === "RETIRED");
      break;
    case "archivable":
      list = list.filter(
        (e) =>
          e.status === "RETIRED" &&
          e.leaveDate &&
          today.diff(dayjs(e.leaveDate), "year") >= DELETE_THRESHOLD_YEARS
      );
      break;
    default:
      break;
  }

  // 🔹 라디오 기준 검색 필터
  if (searchText) {
    const term = searchText.toLowerCase();

    switch (filterMode) {
      case "dept": // 부서별 검색
        list = list.filter((e) =>
          e.deptName?.toLowerCase().includes(term)
        );
        break;
      case "grade": // 직급별 검색
        list = list.filter((e) =>
          e.gradeName?.toLowerCase().includes(term)
        );
        break;
      default: // 이름 검색
        list = list.filter((e) =>
          e.empName?.toLowerCase().includes(term)
        );
    }
  }

  setFiltered(list);
}, [employees, activeTab, searchText, filterMode]);


  /** 3️⃣ 직원별 이동내역 불러오기 */
  const fetchHistory = async (empId) => {
    if (historyMap[empId]) return; // 캐시
    try {
      setLoadingId(empId);
      const data = await getHistoryByEmployee(empId);
      setHistoryMap((prev) => ({ ...prev, [empId]: data || [] }));
    } finally {
      setLoadingId(null);
    }
  };

  /** 4️⃣ 직원 삭제 (시연용 프론트 처리) */
  const handleDelete = async (empId) => {
    const confirmed = window.confirm(`사번 ${empId} 직원을 삭제(숨김)하시겠습니까?`);
  if (!confirmed) return;

  const success = await deleteEmployee(empId);
  if (success) {
    message.success("직원이 논리적으로 삭제되었습니다.");
    setFiltered(prev => prev.filter(e => e.empId !== empId)); // 즉시 화면에서 제거
  }
  };

  /** 5️⃣ 테이블 컬럼 정의 */
  const columns = [
    { title: "사번", dataIndex: "empNo", key: "empNo", width: 100 },
    {
      title: "이름",
      dataIndex: "empName",
      key: "empName",
      render: (text, record) => (
        <a onClick={() => navigate(`/hr/employee/detail/${record.empId}`)}>{text}</a>
      ),
      width: 120,
    },
    { title: "부서", dataIndex: "deptName", key: "deptName", width: 150 },
    { title: "직위", dataIndex: "positionName", key: "positionName", width: 120 },
    { title: "직급", dataIndex: "gradeName", key: "gradeName", width: 120 },
    {
      title: "입사일",
      dataIndex: "startDate",
      key: "startDate",
      render: (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "-"),
      width: 120,
    },
    {
      title: "퇴직일",
      dataIndex: "leaveDate",
      key: "leaveDate",
      render: (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "-"),
      width: 120,
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = { ACTIVE: "green", BREAK: "orange", RETIRED: "red" };
        const textMap = { ACTIVE: "재직", BREAK: "휴직", RETIRED: "퇴직" };
        return <Tag color={colorMap[status]}>{textMap[status] || status}</Tag>;
      },
      width: 100,
    },
    ...(activeTab === "archivable"
      ? [
          {
            title: "관리",
            key: "actions",
            render: (_, record) => (
              <Popconfirm
                title="정말 삭제하시겠습니까?"
                okText="삭제"
                cancelText="취소"
                onConfirm={() => handleDelete(record.empId)}
              >
                <Button danger size="small">
                  삭제
                </Button>
              </Popconfirm>
            ),
          },
        ]
      : []),
  ];

  /** 6️⃣ 확장행: 부서이동내역 */
  const expandedRowRender = (record) => {
    const history = historyMap[record.empId];

    if (loadingId === record.empId)
      return <Spin tip="이동 이력 불러오는 중..." />;

    if (!history)
      return (
        <a onClick={() => fetchHistory(record.empId)} style={{ marginLeft: 24 }}>
          🔍 이동 이력 불러오기
        </a>
      );

    if (history.length === 0)
      return <p style={{ color: "#999", marginLeft: 24 }}>이동 이력 없음</p>;

    const sorted = history.sort((a, b) => new Date(b.assDate) - new Date(a.assDate));

    return (
      <ul style={{ margin: 0, paddingLeft: 24 }}>
        {sorted.map((item, i) => (
          <li key={i}>
            {dayjs(item.assDate).format("YYYY-MM-DD")} :{" "}
            <b>{item.previousDepartmentName}</b> →{" "}
            <b>{item.newDepartmentName}</b> (
            {item.previousPositionName} → {item.newPositionName})
          </li>
        ))}
      </ul>
    );
  };

  /** 7️⃣ 탭 정의 */
  const tabs = [
    { key: "active", label: "근무 중" },
    { key: "recent", label: "최근 입사자" },
    { key: "retired", label: "퇴직자" },
    { key: "archivable", label: "삭제 가능 대상" },
  ];

  return (
    <Spin spinning={empLoading} tip="직원 데이터 불러오는 중...">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <OverviewStats employees={employees} />
        </Col>

        <Col span={24}>
          <Card
            title="직원 조회 (관리자용)"
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <Tabs
              items={tabs}
              activeKey={activeTab}
              onChange={setActiveTab}
              type="card"
              size="large"
              style={{ marginBottom: 16 }}
            />
            <Row gutter={[8, 8]} align="middle" style={{ marginBottom: 16 }}>
  <Col>
    <Input.Search
      placeholder={
      filterMode === "dept"
      ? "부서명으로 검색"
      : filterMode === "grade"
      ? "직급으로 검색"
      : "이름으로 검색"
      }
      allowClear
      style={{ width: 250 }}
      onChange={(e) => setSearchText(e.target.value)}
    />
  </Col>

  <Col>
    <Radio.Group
      value={filterMode}
      onChange={(e) => setFilterMode(e.target.value)}
      buttonStyle="solid"
    >
      <Radio.Button value="all">전체</Radio.Button>
      <Radio.Button value="dept">부서별</Radio.Button>
      <Radio.Button value="grade">직급별</Radio.Button>
    </Radio.Group>
  </Col>
</Row>

            <Table
              rowKey="empId"
              columns={columns}
              dataSource={filtered}
              pagination={{ pageSize: 10 }}
              expandable={{ expandedRowRender }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </Col>
      </Row>
    </Spin>
  );
};

export default EmployeeAdminPage;
