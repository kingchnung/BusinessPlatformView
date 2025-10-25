import { Card, Row, Col, Statistic } from "antd";
import dayjs from "dayjs";

/**
 * ✅ ProjectStats
 * - 현재 월 기준 프로젝트 통계
 * - 항목: 전체건 / 진행건 / 진행예정 / 종료임박 / 진행률평균 / 기한
 */
const ProjectStats = ({ projects = [], month }) => {
  const totalCount = projects.length;
  const today = dayjs();

  // ✅ 상태 기반 필터
  const inProgress = projects.filter((p) => p.status === "IN_PROGRESS").length;
  const upcoming = projects.filter((p) => p.status === "PLANNING" && dayjs(p.startDate).isAfter(today)).length;
  const endingSoon = projects.filter(
    (p) =>
      p.status === "IN_PROGRESS" &&
      dayjs(p.endDate).diff(today, "day") <= 7 &&
      dayjs(p.endDate).isAfter(today)
  ).length;
  const completed = projects.filter((p) => p.status === "COMPLETED").length;
  const canceled = projects.filter((p) => p.status === "CANCELED").length;
  
  const avgProgress =
    totalCount > 0
      ? Math.round(
          projects.reduce((acc, cur) => acc + (cur.progressRate || 0), 0) /
            totalCount
        )
      : 0;

  return (
    <Card
      style={{
        marginBottom: 16,
        borderRadius: 12,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
      bodyStyle={{ padding: "16px 24px" }}
    >
      <Row gutter={[16, 16]} justify="space-between" align="middle">
        <Col xs={12} sm={8} md={4}>
          <Statistic
            title="📅 기준월"
            value={`${month.format("MM")}월`}
            valueStyle={{ color: "#1890ff", fontSize: 18 }}
          />
        </Col>

        <Col xs={12} sm={8} md={4}>
          <Statistic
            title="📦 전체건"
            value={`${totalCount}건`}
            valueStyle={{ color: "#333" }}
          />
        </Col>

        <Col xs={12} sm={8} md={4}>
          <Statistic
            title="🚀 진행건"
            value={`${inProgress}건`}
            valueStyle={{ color: "#52c41a" }}
          />
        </Col>

        <Col xs={12} sm={8} md={4}>
          <Statistic
            title="🕓 진행예정"
            value={`${upcoming}건`}
            valueStyle={{ color: "#faad14" }}
          />
        </Col>

        <Col xs={12} sm={8} md={4}>
          <Statistic
            title="⚠️ 종료임박"
            value={`${endingSoon}건`}
            valueStyle={{ color: "#ff4d4f" }}
          />
        </Col>

        <Col xs={12} sm={8} md={4}>
          <Statistic
            title="📈 평균 진행률"
            value={`${avgProgress}%`}
            valueStyle={{ color: "#722ed1" }}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default ProjectStats;
