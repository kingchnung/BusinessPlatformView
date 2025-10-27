import React, { useEffect, useState } from "react";
import { Row, Col, Card, Spin, Button,  } from "antd";
import NoticeBoardCard from "./NoticeBoardCard";
import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
import MyInfoCard from "../../hr/employee/components/MyInfoCard";
import ApprovalSummaryCard from "./ApprovalSummaryCard";
import ProjectGanttChart from "../../work/project/component/ProjectGanttChart";
import dayjs from "dayjs";
import axiosInstance from "../../common/axiosInstance";
import SalesMiniLineChart from "../../sales/components/SalesMiniLineChart";


const MainDashboard = () => {

  // const { userInfo } = useSelector((state) => state.auth);

  const [projectData, setProjectData] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentMonth = dayjs();
  const navigate = useNavigate();

  const fetchActiveProjects = async () => {
    try {
      const res = await axiosInstance.get("/projects"); // 진행 중 프로젝트 조회
      console.log("📋 진행 중 프로젝트 목록:", res.data);
      setProjectData(res.data || []);
    } catch (error) {
      console.error("프로젝트 목록 조회 실패:", error);
      setProjectData([]); // 실패 시 빈 배열
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchActiveProjects();
  }, []);


  return (
    <div style={{ height: "100%", padding: "8px" }}>
      {/* 상단 섹션: 매출, 전자결재, 내 정보 */}
      <Row gutter={[16, 16]} >
        {/* 매출현황 */}
        <Col xs={24} md={15} style={{ minWidth: 0 }}>
          <Card
            title="📊 매출 현황"
            bordered={false}
            style={{ borderRadius: "12px", height: "100%" }}
            bodyStyle={{ height: "100%", padding: 12 }}
          >
            <div style={{ width: "100%", minWidth: 0, minHeight: 360 }}>
              <SalesMiniLineChart height={360} showHeader />
            </div>
          </Card>
        </Col>

        {/* 전자결재 요약 */}
        <Col xs={24} md={5}>
          <Card
            title="🧾 전자결재 요약"
            bordered={false}
            style={{ borderRadius: "12px", height: "100%" }}
          >
            <ApprovalSummaryCard />
          </Card>
        </Col>

        {/* 내 정보 */}
        <Col xs={24} md={4}>
          <MyInfoCard />
        </Col>
      </Row>

      {/* 하단 섹션: 프로젝트 진행률 + 공지사항 */}
      <Row gutter={[16, 16]} >
        {/* 프로젝트 진행률 */}
        <Col xs={24} md={14}>
          <Card title="💼 프로젝트 진행 현황" 
          extra={
              <Button type="link" onClick={() => navigate("/work")}>
                프로젝트 더보기 →
              </Button>
            }
          bordered={false} style={{ borderRadius: "12px", height: "100%", overflow: "hidden" }}>
            {loading ? (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Spin />
              </div>
            ) : (
              <ProjectGanttChart data={projectData} month={currentMonth} />
            )}
            
          </Card>
        </Col>

        {/* 공지사항 */}
        <Col xs={24} md={10}>
          <NoticeBoardCard />
        </Col>
      </Row>
    </div>
  );
};

export default MainDashboard;
