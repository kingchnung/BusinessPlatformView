import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Descriptions, Avatar, Button, message, Spin } from "antd";
import {
  UserOutlined,
  EditOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axiosInstance from "../../../common/axiosInstance";

const EmployeeDetailPage = () => {
  const { empId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 데이터 로드
  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/employees/${empId}/detail`);
        setEmployee(res.data);
        console.log("📋 직원 상세:", res.data);
      } catch (error) {
        message.error("직원 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [empId]);

  if (loading || !employee) {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <Spin size="large" tip="직원 정보를 불러오는 중..." />
      </div>
    );
  }

  // // 🔹 상태 변환
  // const getStatusLabel = (status) => {
  //   switch (status) {
  //     case "ACTIVE":
  //       return "재직";
  //     case "ON_LEAVE":
  //       return "휴직";
  //     case "INACTIVE":
  //       return "퇴직";
  //     default:
  //       return "-";
  //   }
  // };

  return (
    <Card
      style={{
        margin: 20,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        background: "#fff",
      }}
      bodyStyle={{ padding: 32 }}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            목록으로
          </Button>
          <div>
            {/* ✅ 관리자 이상만 노출되는 수정 버튼 (삭제 제거됨) */}
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/hr/employee/edit/${empId}`)}
            >
              수정
            </Button>
          </div>
        </div>
      }
    >
      {/* 🔹 상단 프로필 영역 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginBottom: 32,
        }}
      >
        <Avatar
          size={120}
          icon={<UserOutlined />}
          src={employee.profileUrl || null}
          style={{ backgroundColor: "#f0f2f5" }}
        />
        <div>
          <h2 style={{ marginBottom: 4 }}>{employee.empName}</h2>
          <p style={{ color: "#888", marginBottom: 4 }}>
            사번: {employee.empNo}
          </p>
          <p style={{ color: "#888" }}>
            {employee.deptName} / {employee.positionName}
          </p>
        </div>
      </div>

      {/* 🔹 상세 정보 영역 */}
      <Descriptions
        bordered
        column={2}
        labelStyle={{ fontWeight: "bold", width: 180 }}
      >
        {/* ✅ 성별 / 나이 추가 */}
        <Descriptions.Item label="성별">
          {employee.gender === "F"
            ? "여성"
            : employee.gender === "M"
            ? "남성"
            : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="나이">
          {employee.birthDate
            ? dayjs().diff(dayjs(employee.birthDate), "year") + "세"
            : "-"}
        </Descriptions.Item>

        <Descriptions.Item label="이메일">
          {employee.email || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="전화번호">
          {employee.phone || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="입사일">
          {employee.startDate
            ? dayjs(employee.startDate).format("YYYY-MM-DD")
            : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="상태">
           {employee.status || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="주소" span={2}>
          {employee.address || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="비고" span={2}>
          {employee.remark || "-"}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default EmployeeDetailPage;
