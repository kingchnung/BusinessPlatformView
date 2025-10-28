import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Typography, message, Select } from "antd";
import axiosInstance from "../../../common/axiosInstance";
import ProjectCreateModal from "../component/ProjectCreateModal";
import dayjs from "dayjs";
import { useEmployees } from "../../../hr/hooks/useEmployees";
import { updateProjectStatus } from "../../../api/work/projectApi";
import { useNavigate } from "react-router-dom"; // ✅ 1. useNavigate 훅 임포트

const { Text, Link } = Typography; // ✅ 2. Typography에서 Link 컴포넌트 추가

const ProjectListPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false); 

  const { employees } = useEmployees();
  const navigate = useNavigate(); // ✅ 3. navigate 함수 초기화

  const getPmName = (pmId) => {
    if (!pmId || !employees.length) return "-";
    const pm = employees.find((e) => e.empId === pmId);
    return pm ? pm.empName : "-";
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/projects/admin");
      setProjects(res.data || []);
    } catch (err) {
      console.error("프로젝트 목록 로드 실패:", err);
      message.error("프로젝트 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await updateProjectStatus(projectId, newStatus);
      message.success("프로젝트 상태가 변경되었습니다.");
      fetchProjects(); 
    } catch (err) {
      console.error(err);
      message.error("상태 변경 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const columns = [
    {
      title: "프로젝트명",
      dataIndex: "projectName",
      key: "projectName",
      // ✅ 4. render 함수 수정 (Link 컴포넌트와 navigate 사용)
      render: (text, record) => (
        <Link
          strong
          onClick={() => navigate(`/work/project/edit/${record.projectId}`)}
        >
          {text}
        </Link>
      ),
    },
    {
      title: "생성일",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "담당 부서",
      dataIndex: ["department", "deptName"],
      key: "deptName",
      render: (text) => text || <Tag color="default">미지정</Tag>,
    },
    {
      title: "PM (부서장)",
      dataIndex: "pmId",
      key: "pmId",
      render: (pmId) => getPmName(pmId),
    },
    {
      title: "기간",
      key: "period",
      render: (_, r) =>
        `${dayjs(r.startDate).format("YY.MM.DD")} ~ ${dayjs(
          r.endDate
        ).format("YY.MM.DD")}`,
    },
    {
      title: "예산",
      dataIndex: "totalBudget",
      key: "totalBudget",
      render: (v) => (v ? v.toLocaleString() + " ₩" : "-"),
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 130 }}
          onChange={(v) => handleStatusChange(record.projectId, v)}
          options={[
            { value: "PLANNING", label: "기획중" },
            { value: "IN_PROGRESS", label: "진행중" },
            { value: "COMPLETED", label: "완료" },
            { value: "CANCELED", label: "종료" },
          ]}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Text strong style={{ fontSize: 18 }}>
          📋 프로젝트 전체 목록
        </Text>
        <Button type="primary" onClick={() => setOpen(true)}>
          + 프로젝트 생성
        </Button>
      </div>

      <Table
        rowKey="projectId"
        dataSource={projects}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <ProjectCreateModal
        open={open}
        onClose={() => {
          setOpen(false);
          fetchProjects();
        }}
      />
    </div>
  );
};

export default ProjectListPage;