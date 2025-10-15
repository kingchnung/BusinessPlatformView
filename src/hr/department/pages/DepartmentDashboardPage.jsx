import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spin, message } from "antd";
import axiosInstance from "../../../common/axiosInstance";
import AvgAgeChart from "../../components/charts/AvgAgeChart";
import AvgYearsChart from "../../components/charts/AvgYearsChart";
import AgeDistributionChart from "../../components/charts/AgeDistributionChart";
import GradeDistributionChart from "../../components/charts/GradeDistributionChart";
import { divideDepartmentsByCode } from "../../util/departmentDivision";

const DepartmentDashboardPage = () => {
  const [departments, setDepartments] = useState([]);
  const [ageStats, setAgeStats] = useState([]);
  const [gradeStats, setGradeStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [deptRes, ageRes, gradeRes] = await Promise.all([
          axiosInstance.get("/departments/overview"),
          axiosInstance.get("/employees/statistics/age"),
          axiosInstance.get("/employees/statistics/grade"),
        ]);

        setDepartments(deptRes.data);
        setAgeStats(ageRes.data);
        setGradeStats(gradeRes.data);
      } catch (err) {
        console.error(err);
        message.error("대시보드 데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <Spin tip="대시보드 불러오는 중..." />
      </div>
    );

  // ✅ 팀만 필터링
  const teamsOnly = departments.filter(
    (d) => parseInt(d.deptCode, 10) % 10 !== 0
  );

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 20 }}>📊 부서 대시보드</h2>

      <Row gutter={[16, 24]}>
        <Col xs={24} lg={12}>
          <Card title="팀별 평균 나이">
            <AvgAgeChart data={teamsOnly} />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="팀별 평균 근속연수">
            <AvgYearsChart data={teamsOnly} />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="나이대별 인원 비율">
            <AgeDistributionChart data={ageStats} />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="직급별 인원 비율">
            <GradeDistributionChart data={gradeStats} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DepartmentDashboardPage;
