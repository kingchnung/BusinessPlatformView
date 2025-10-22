import { Card, Row, Col, Statistic } from "antd";

/**
 * 📊 OverviewStats - 인사카드 상단용 요약 통계
 * @param {object[]} employees - 전체 직원 목록
 */
const OverviewStats = ({ employees = [] }) => {
  // ✅ 활동중인 직원만 (퇴직자 제외)
  const activeEmployees = employees.filter(
    (emp) => String(emp.status || "").toUpperCase() !== "RETIRED"
  );

  const totalActive = activeEmployees.length; // 전체 인원
  const totalOnBreak = activeEmployees.filter(
    (emp) => String(emp.status || "").toUpperCase() === "BREAK"
  ).length; // 휴직 인원
  const currentStaff = totalActive - totalOnBreak; // 현재 근무중
  const newHires = 0; // 신규입사자 (추후 계산 로직 추가 가능)

  return (
    <Card
      title="인사 현황 요약"
      bordered={false}
      style={{
        marginBottom: 16,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <Row gutter={[16, 16]} justify="space-around">
        <Col xs={12} sm={6} md={6}>
          <Statistic title="전체 인원" value={totalActive} suffix="명" />
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Statistic title="휴직 인원" value={totalOnBreak} suffix="명" />
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Statistic title="현재원" value={currentStaff} suffix="명" />
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Statistic title="신규 입사자" value={newHires} suffix="명" />
        </Col>
      </Row>
    </Card>
  );
};

export default OverviewStats;
