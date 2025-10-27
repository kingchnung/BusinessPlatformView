// ProjectStats.jsx
import { Card, Row, Col, Statistic } from "antd";
import dayjs from "dayjs";

const ProjectStats = ({ projects = [], month }) => {
  // -----------------------
  // 유틸: 상태 정규화
  // -----------------------
  const norm = (s) => (s ? String(s).trim().toUpperCase() : "");

  // -----------------------
  // 집계 대상(이번 달과 겹치는 프로젝트만 쓰고 싶으면 아래 주석 해제)
  // -----------------------
  // const start = month.startOf("month");
  // const end = month.endOf("month");
  // const data = projects.filter(
  //   (p) => dayjs(p.startDate).isBefore(end) && dayjs(p.endDate).isAfter(start)
  // );
  const data = projects;

  const totalCount = data.length;
  const today = dayjs();

  // -----------------------
  // 상태별 카운트
  // -----------------------
  const inProgress = data.filter((p) => norm(p.status) === "IN_PROGRESS").length;
  const upcoming = data.filter(
    (p) => norm(p.status) === "PLANNING" && dayjs(p.startDate).isAfter(today)
  ).length;
  const endingSoon = data.filter(
    (p) =>
      norm(p.status) === "IN_PROGRESS" &&
      dayjs(p.endDate).diff(today, "day") <= 7 &&
      dayjs(p.endDate).isAfter(today)
  ).length;
  const completed = data.filter((p) => norm(p.status) === "COMPLETED").length;
  const canceled = data.filter((p) => norm(p.status) === "CANCELED").length;

  // -----------------------
  // 평균 진행률 (progressRate 없으면 상태로 추정)
  // -----------------------
  const fallbackProgress = (p) => {
    if (Number.isFinite(p?.progressRate)) return p.progressRate;
    const s = norm(p?.status);
    if (s === "COMPLETED") return 100;
    if (s === "PLANNING") return 0;
    if (s === "CANCELED") return 0;
    if (s === "IN_PROGRESS") return 50; // 기본값(원하면 조정)
    return 0;
  };

  const avgProgress =
    totalCount > 0
      ? Math.round(
          data.reduce((acc, cur) => acc + fallbackProgress(cur), 0) / totalCount
        )
      : 0;

  // -----------------------
  // 렌더
  // -----------------------
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
          <Statistic title="📦 전체건" value={`${totalCount}건`} valueStyle={{ color: "#333" }} />
        </Col>

        <Col xs={12} sm={8} md={4}>
          <Statistic title="🚀 진행건" value={`${inProgress}건`} valueStyle={{ color: "#52c41a" }} />
        </Col>

        <Col xs={12} sm={8} md={4}>
          <Statistic title="🕓 진행예정" value={`${upcoming}건`} valueStyle={{ color: "#faad14" }} />
        </Col>

        <Col xs={12} sm={8} md={4}>
          <Statistic title="⚠️ 종료임박" value={`${endingSoon}건`} valueStyle={{ color: "#ff4d4f" }} />
        </Col>

        <Col xs={12} sm={8} md={4}>
          <Statistic title="✅ 완료" value={`${completed}건`} valueStyle={{ color: "#1677ff" }} />
        </Col>

        <Col xs={12} sm={8} md={4}>
          <Statistic title="🛑 종료" value={`${canceled}건`} valueStyle={{ color: "#8c8c8c" }} />
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