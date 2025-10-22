import { Card, Row, Col, Statistic } from "antd";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";

/**
 * 📊 OverviewStats.jsx
 * 전체 인원의 핵심 현황을 간결하게 보여주는 컴포넌트
 * @param {object[]} employees - 전체 직원 목록
 */
const OverviewStats = ({ employees = [] }) => {

  // --- 1. 1열 통계 데이터 계산 ---

  // 'RETIRED' 상태가 아닌 직원만 필터링하여 '활동중인 직원'으로 정의
  const activeEmployees = employees.filter(
    (emp) => String(emp.status || "").toUpperCase() !== "RETIRED"
  );
  
  const totalActive = activeEmployees.length; // 전체 인원 (활동중)
  const totalOnBreak = activeEmployees.filter(
    (emp) => String(emp.status || "").toUpperCase() === "BREAK"
  ).length; // 휴가 인원
  
  // 'RETIRED' 상태인 직원 수 계산
  const totalRetired = employees.filter(
    (emp) => String(emp.status || "").toUpperCase() === "RETIRED"
  ).length; // 퇴직 인원

  const currentStaff = totalActive - totalOnBreak; // 현재원
  const newHires = 0; // 신규 입사자 (요청대로 0으로 고정)

  // --- 2. 2열 차트 데이터 가공 ---

  // 성비 데이터
  const genderData = [
    { name: "남성", value: activeEmployees.filter(e => e.gender === 'M').length },
    { name: "여성", value: activeEmployees.filter(e => e.gender === 'F').length },
  ];
  const GENDER_COLORS = ['#0088FE', '#FF8042'];

  // 직위별 데이터
  const positionMap = { 1: 'CEO', 2: '팀장', 3: '사원' };
  const positionData = Object.entries(
    activeEmployees.reduce((acc, emp) => {
      const pos = positionMap[emp.positionCode] || '기타';
      acc[pos] = (acc[pos] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, 인원: count }));
  
  // 직급별 데이터
  const gradeMap = { 1: '임원', 2: '부장/차장', 3: '사원/대리' };
  const gradeData = Object.entries(
    activeEmployees.reduce((acc, emp) => {
      const grade = gradeMap[emp.gradeCode] || '기타';
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, 인원: count }));


  return (
    <Card
      title="전체 인원 현황"
      bordered={false}
      style={{ margin: "20px", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
    >
      {/* --- 1열: 주요 통계 --- */}
      <Row gutter={[16, 24]} style={{ alignContent:"center", marginBottom: '24px' }}>
        <Col xs={12} sm={8} md={4}><Statistic title="전체 인원" value={totalActive} suffix="명" /></Col>
        <Col xs={12} sm={8} md={5}><Statistic title="휴가 인원" value={totalOnBreak} suffix="명" /></Col>
        <Col xs={12} sm={8} md={5}><Statistic title="퇴직 인원" value={totalRetired} suffix="명" /></Col>
        <Col xs={12} sm={8} md={5}><Statistic title="현재원" value={currentStaff} suffix="명" /></Col>
        <Col xs={12} sm={8} md={5}><Statistic title="신규 입사자" value={newHires} suffix="명" /></Col>
      </Row>

      <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '0 0 24px 0' }} />

      {/* --- 2열: 차트 --- */}
      <Row gutter={[16, 24]}>
        <Col xs={24} md={8}>
          <h3 style={{ textAlign: 'center', marginBottom: 16 }}>성비</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Col>
        <Col xs={24} md={8}>
          <h3 style={{ textAlign: 'center', marginBottom: 16 }}>직위별</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={positionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="인원" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Col>
        <Col xs={24} md={8}>
          <h3 style={{ textAlign: 'center', marginBottom: 16 }}>직급별</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={gradeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="인원" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Col>
      </Row>
    </Card>
  );
};

export default OverviewStats;