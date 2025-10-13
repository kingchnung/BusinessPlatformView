import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Descriptions, Avatar, Button, message, Spin, Modal } from "antd";
import { UserOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";
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

  // 🔹 삭제
  const handleDelete = async () => {
    Modal.confirm({
      title: "삭제 확인",
      content: "정말로 이 직원을 삭제하시겠습니까?",
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      async onOk() {
        try {
          await axiosInstance.delete(`/employees/${empId}`);
          message.success("직원이 삭제되었습니다.");
          navigate("/hr/employee/cards");
        } catch (error) {
          message.error("삭제 중 오류가 발생했습니다.");
        }
      },
    });
  };

  if (loading || !employee) {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <Spin size="large" tip="직원 정보를 불러오는 중..." />
      </div>
    );
  }

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
            <Button
              type="primary"
              icon={<EditOutlined />}
              style={{ marginRight: 8 }}
              onClick={() => message.info("수정 페이지 준비 중입니다.")}
            >
              수정
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              삭제
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
        <Descriptions.Item label="이메일">
          {employee.email || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="전화번호">
          {employee.phone || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="입사일">
          {employee.hireDate || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="상태">
          {employee.status === "active" ? "재직" : "퇴직"}
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
