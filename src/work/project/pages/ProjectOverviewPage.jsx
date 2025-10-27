import { useState, useEffect } from "react";
import { Button, Card, Row, Col, Typography, Space, } from "antd";
import dayjs from "dayjs";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { fetchActiveProjects } from "../../../api/work/projectApi";
import ProjectGanttChart from "../component/ProjectGanttChart";
import ProjectStats from "../component/ProjectStats";
import ProjectTableSummary from "../component/ProjectTableSummary";

const { Title } = Typography;

const ProjectOverviewPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs()); // 현재 달

  // ✅ 프로젝트 데이터 불러오기
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchActiveProjects();
      setProjects(data);
    };
    loadData();
  }, []);

  // ✅ 현재 월 기준으로 필터링
  useEffect(() => {
    if (!projects.length) return;

    const startOfMonth = currentMonth.startOf("month");
    const endOfMonth = currentMonth.endOf("month");

    const filtered = projects.filter((p) => {
      const s = dayjs(p.startDate);
      const e = dayjs(p.endDate);
      return s.isBefore(endOfMonth) && e.isAfter(startOfMonth); // 이번달 기간에 겹치는 프로젝트만
    });

    setFilteredProjects(filtered);
  }, [projects, currentMonth]);

  // ✅ 월 변경 핸들러
  const handleMonthChange = (direction) => {
    setCurrentMonth((prev) =>
      direction === "prev" ? prev.subtract(1, "month") : prev.add(1, "month")
    );
  };

  return (
    <div style={{ padding: 24 }}>
      {/* ✅ 상단 통계 섹션 */}  
        <ProjectStats projects={filteredProjects} month={currentMonth} />
      {/* 상단 제목 및 월 변경 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            📊 프로젝트 진행 현황
          </Title>
          <p style={{ color: "#666" }}>
            {currentMonth.format("YYYY년 MM월")} 기준 진행 중 프로젝트
          </p>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<LeftOutlined />}
              onClick={() => handleMonthChange("prev")}
            />
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {currentMonth.format("YYYY.MM")}
            </span>
            <Button
              icon={<RightOutlined />}
              onClick={() => handleMonthChange("next")}
            />
          </Space>
        </Col>
      </Row>

      {/* 프로젝트 Gantt 차트 */}
      <Card bodyStyle={{ padding: 16, minHeight: 480 }}>
        {filteredProjects.length > 0 ? (
          <ProjectGanttChart
            data={filteredProjects}
            month={currentMonth}
          />
        ) : (
          <div style={{ textAlign: "center", color: "#888", marginTop: 100 }}>
            📅 {currentMonth.format("YYYY년 MM월")}에 진행 중인 프로젝트가 없습니다.
          </div>
        )}
      </Card>
       {/* ✅ 하단 프로젝트 요약 테이블 */}
        <ProjectTableSummary projects={filteredProjects} month={currentMonth} />
    </div>

    
  );
};

export default ProjectOverviewPage;
