import React from "react";
import { Row, Col, Card } from "antd";
import NoticeBoardCard from "./NoticeBoardCard";

const MainDashboard = () => {
  return (
    <div style={{ height: "100%", padding: "8px" }}>
      <Row gutter={[16, 16]} style={{ height: "100%" }}>
        {/* (0,0) 매출 그래프 */}
        <Col xs={24} md={17} style={{ height: "50%" }}>
          <Card
            title="📊 매출 현황"
            bordered={false}
            style={{ borderRadius: "12px", height: "100%" }}
          >
            그래프 컴포넌트 자리
          </Card>
        </Col>

        {/* (1,0) 공지사항 */}
        <Col xs={24} md={7} style={{ height: "50%" }}>
          <NoticeBoardCard />
        </Col>

        {/* (0,1) 프로젝트 현황 */}
        <Col xs={24} md={17} style={{ height: "50%" }}>
          <Card
            title="💼 프로젝트 진행 현황"
            bordered={false}
            style={{ borderRadius: "12px", height: "100%" }}
          >
            프로젝트 현황 컴포넌트 자리
          </Card>
        </Col>

        {/* (1,1) 직원정보 */}
        <Col xs={24} md={7} style={{ height: "50%" }}>
          <Card
            title="👤 내 정보"
            bordered={false}
            style={{ borderRadius: "12px", height: "100%" }}
          >
            직원 정보 요약 (이름, 부서, 직급 등)
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MainDashboard;