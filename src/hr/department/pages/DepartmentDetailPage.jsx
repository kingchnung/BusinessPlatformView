import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Row, Col, Spin, Button, message } from "antd";
import axiosInstance from "../../../common/axiosInstance";
import EmployeeCardItem from "../../employee/components/EmployeeCarditem";

/**
 * 📄 [DepartmentDetailPage.jsx]
 * 특정 부서(팀)의 인원 상세 카드 목록을 보여주는 페이지
 */
const DepartmentDetailPage = () => {
  const { deptId } = useParams();
  const navigate = useNavigate();

  const [department, setDepartment] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 부서 기본 정보
        const deptRes = await axiosInstance.get(`/departments/${deptId}`);
        setDepartment(deptRes.data);

        // 부서 내 직원 목록
        const empRes = await axiosInstance.get(`/employees/byDepartment/${deptId}`);

        // ✅ 퇴직자 제외 (status가 RETIRED인 직원 제거)
        const filtered = (empRes.data || []).filter(
        (emp) => (emp.status || "").toUpperCase() !== "RETIRED"
      );
        setEmployees(filtered);
      } catch (err) {
        console.error(err);
        message.error("부서 상세 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [deptId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <Spin tip="부서 상세 불러오는 중..." />
      </div>
    );
  }

  if (!department) {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <p>부서 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <Card
      title={`${department.deptName} 인원 (${employees.length}명)`}
      bordered={false}
      style={{
        margin: 20,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
      extra={
        <Button type="link" onClick={() => navigate(-1)}>
          ← 부서 현황으로 돌아가기
        </Button>
      }
    >
      <Row gutter={[16, 16]}>
        {employees.length > 0 ? (
          employees.map((emp) => (
            <Col xs={24} sm={12} md={8} lg={6} key={emp.empId}>
              <EmployeeCardItem emp={emp} />
            </Col>
          ))
        ) : (
          <p style={{ color: "#999", margin: "20px auto" }}>등록된 직원이 없습니다.</p>
        )}
      </Row>
    </Card>
  );
};

export default DepartmentDetailPage;
