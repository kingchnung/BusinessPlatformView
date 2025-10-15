import { Card, Row, Col, Statistic } from "antd";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const OverviewStats = ({ departments }) => {
  const totalEmployees = departments.reduce((sum, d) => sum + d.employeeCount, 0);
  const avgAge =
    departments.reduce((sum, d) => sum + d.avgAge * d.employeeCount, 0) /
    (totalEmployees || 1);
  const avgYears =
    departments.reduce((sum, d) => sum + d.avgYears * d.employeeCount, 0) /
    (totalEmployees || 1);

  /** 📊 팀만 추출 (부는 제외: deptCode % 10 === 0 인 경우 제외) */
  const teamsOnly = departments.filter((d) => {
    const code = parseInt(d.deptCode, 10);
    return !isNaN(code) && code % 10 !== 0;
  });

  // 그래프용 데이터 (팀 기준)
  const ageData = teamsOnly.map((d) => ({
    name: d.deptName,
    age: d.avgAge,
  }));

  const yearsData = teamsOnly.map((d) => ({
    name: d.deptName,
    years: d.avgYears,
  }));

  return (
    <Card
      title="전체 부서 인원 통계"
      bordered={false}
      style={{
        marginBottom: 20,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8}>
          <Statistic title="전체 인원" value={totalEmployees} suffix="명" />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic title="평균 나이" value={avgAge.toFixed(1)} suffix="세" />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="평균 근속연수"
            value={avgYears.toFixed(1)}
            suffix="년"
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <h4>📊 부서별 평균 나이</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="age" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Col>

        <Col xs={24} sm={12}>
          <h4>📈 부서별 평균 근속연수</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={yearsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="years" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </Col>
      </Row>
    </Card>
  );
};

export default OverviewStats;
