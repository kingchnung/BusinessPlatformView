import { useState, useMemo } from "react";
import { Card, Row, Col, Statistic, Switch } from "antd";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import dayjs from "dayjs";

/**
 * 📊 OverviewStats.jsx
 * - 전체 인원 현황
 * - 성비 / 직위 / 직급 / 연차별 차트
 * - 관리자 이상만 ‘퇴직자 포함’ 토글 가능
 * - 최근 30일 이내 입사자 카운트 추가
 */
const OverviewStats = ({ employees = [] }) => {
  const [includeRetired, setIncludeRetired] = useState(false);

  /** ✅ 로그인 정보 확인 (localStorage에 user로 저장된 구조에 맞춤) */
  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
  const userRoles = Array.isArray(userInfo.roles)
    ? userInfo.roles
    : [userInfo.role];
  const isManagerOrAbove = userRoles?.some((r) =>
    ["ROLE_MANAGER", "ROLE_ADMIN", "ROLE_CEO", "sys:admin"].includes(r)
  );

  /** ✅ 표시할 직원 목록 계산 (퇴직자 포함 여부 반영) */
  const displayEmployees = useMemo(() => {
    const base = [...employees]; // 참조 분리
    if (includeRetired) return base;
    return base.filter(
      (emp) => String(emp.status || "").toUpperCase() !== "RETIRED"
    );
  }, [employees, includeRetired]);

  /** ✅ 기본 통계 */
  const totalActive = displayEmployees.length;
  const totalOnBreak = displayEmployees.filter(
    (emp) => String(emp.status || "").toUpperCase() === "BREAK"
  ).length;
  const currentStaff = totalActive - totalOnBreak;

  /** ✅ 신규 입사자 (최근 30일 기준) */
  const today = dayjs();
  const newHires = displayEmployees.filter(
    (emp) =>
      emp.startDate &&
      today.diff(dayjs(emp.startDate), "day") <= 30
  ).length;

  /** ✅ 성비 데이터 */
  const genderData = useMemo(
    () => [
      { name: "남성", value: displayEmployees.filter((e) => e.gender === "M").length },
      { name: "여성", value: displayEmployees.filter((e) => e.gender === "F").length },
    ],
    [displayEmployees]
  );
  const GENDER_COLORS = ["#0088FE", "#FF8042"];

  /** ✅ 직위별 */
  const positionMap = { 1: "CEO", 2: "팀장", 3: "사원" };
  const positionData = useMemo(() => {
    return Object.entries(
      displayEmployees.reduce((acc, emp) => {
        const pos = positionMap[emp.positionCode] || "기타";
        acc[pos] = (acc[pos] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, count]) => ({ name, 인원: count }));
  }, [displayEmployees]);

  /** ✅ 직급별 */
  const gradeMap = { 1: "임원", 2: "부장/차장", 3: "사원/대리" };
  const gradeData = useMemo(() => {
    return Object.entries(
      displayEmployees.reduce((acc, emp) => {
        const grade = gradeMap[emp.gradeCode] || "기타";
        acc[grade] = (acc[grade] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, count]) => ({ name, 인원: count }));
  }, [displayEmployees]);

  /** ✅ 연차별 */
  const careerData = useMemo(() => {
    const now = dayjs();
    const buckets = { "1~2년차": 0, "3~5년차": 0, "6~9년차": 0, "10년 이상": 0 };

    displayEmployees.forEach((emp) => {
      let years = 0;
      if (emp.career_year != null) years = emp.career_year;
      else if (emp.startDate) years = now.diff(dayjs(emp.startDate), "year");

      if (years <= 2) buckets["1~2년차"]++;
      else if (years <= 5) buckets["3~5년차"]++;
      else if (years <= 9) buckets["6~9년차"]++;
      else buckets["10년 이상"]++;
    });

    return Object.entries(buckets).map(([name, count]) => ({ name, 인원: count }));
  }, [displayEmployees]);

  /** ✅ 강제 리렌더링 key */
  const chartKey = includeRetired ? "withRetired" : "activeOnly";

  return (
    <Card
      key={chartKey}
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: includeRetired && isManagerOrAbove ? "tomato" : "inherit",
          }}
        >
          전체 인원 현황
          {isManagerOrAbove && (
            <Switch
              checked={includeRetired}
              onChange={(checked) => setIncludeRetired(checked)}
              checkedChildren="퇴직자 포함"
              unCheckedChildren="퇴직자 제외"
            />
          )}
        </div>
      }
      bordered={false}
      style={{
        margin: "20px",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* --- 1열: 주요 통계 --- */}
      <Row gutter={[16, 24]} style={{ alignContent: "center", marginBottom: "24px" }}>
        <Col xs={12} sm={8} md={6}><Statistic title="전체 인원" value={totalActive} suffix="명" /></Col>
        <Col xs={12} sm={8} md={6}><Statistic title="휴가 인원" value={totalOnBreak} suffix="명" /></Col>
        <Col xs={12} sm={8} md={6}><Statistic title="현재원" value={currentStaff} suffix="명" /></Col>
        <Col xs={12} sm={8} md={6}><Statistic title="신규 입사자 (최근 30일)" value={newHires} suffix="명" /></Col>
      </Row>

      <hr style={{ border: "none", borderTop: "1px solid #f0f0f0", margin: "0 0 24px 0" }} />

      {/* --- 2열: 차트 --- */}
      <Row gutter={[16, 24]}>
        <Col xs={24} md={6}>
          <h3 style={{ textAlign: "center", marginBottom: 16 }}>성비</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Col>

        <Col xs={24} md={6}>
          <h3 style={{ textAlign: "center", marginBottom: 16 }}>직위별</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={positionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="인원" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Col>

        <Col xs={24} md={6}>
          <h3 style={{ textAlign: "center", marginBottom: 16 }}>직급별</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={gradeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="인원" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Col>

        <Col xs={24} md={6}>
          <h3 style={{ textAlign: "center", marginBottom: 16 }}>연차별 분포</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={careerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="인원" fill="#f6b26b" />
            </BarChart>
          </ResponsiveContainer>
        </Col>
      </Row>
    </Card>
  );
};

export default OverviewStats;
