import React from "react";
import { Row, Col, Card } from "antd";
import NoticeBoardCard from "./NoticeBoardCard";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MyInfoCard from "../../hr/employee/components/MyInfoCard";
import ApprovalSummaryCard from "./ApprovalSummaryCard";
import SalesMiniLineChart from "../../sales/components/SalesMiniLineChart";


const MainDashboard = () => {

  const { userInfo } = useSelector((state) => state.auth);

  return (
    <div style={{ height: "100%", padding: "8px" }}>
      {/* 상단 섹션: 매출, 전자결재, 내 정보 */}
      <Row gutter={[16, 16]} style={{ height: "55%" }}>
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
      <Row gutter={[16, 16]} style={{ height: "45%" }}>
        {/* 프로젝트 진행률 */}
        <Col xs={24} md={14}>
          <Card
            title="💼 프로젝트 진행 현황"
            bordered={false}
            style={{ borderRadius: "12px", height: "100%" }}
          >
            프로젝트별 진행률 그래프
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
