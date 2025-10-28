import React, { useMemo } from "react";
import { Table, Typography, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "../../../hr/hooks/useEmployees";
import { useDepartments } from "../../../hr/hooks/useDepartments";
import dayjs from "dayjs";

const { Text } = Typography;

const ProjectTableSummary = ({ projects = [], month }) => {
  const navigate = useNavigate();
  const { employees, loading: empLoading } = useEmployees();
  const { departments, loading: deptLoading } = useDepartments();

  const loading = empLoading || deptLoading;

  // ✅ 부서/직원 맵 생성
  const { deptMap, empMap } = useMemo(() => {
    const dMap = new Map((departments || []).map((d) => [d.deptId, d]));
    const eMap = new Map((employees || []).map((e) => [e.empId, e]));
    return { deptMap: dMap, empMap: eMap };
  }, [departments, employees]);

  // ✅ 팀장/PM 이름 계산 로직
  const resolveLeaderName = (record) => {
    // 1️⃣ 백엔드가 준 pmName이 있으면 그대로 사용
    if (record?.pmName) return record.pmName;

    // 2️⃣ pmId가 있으면 해당 직원 이름 표시
    if (record?.pmId && empMap.has(record.pmId)) {
      return empMap.get(record.pmId)?.empName || null;
    }

    // 3️⃣ 부서 managerId로 fallback
    const deptId = record?.department?.deptId;
    const managerId = deptMap.get(deptId)?.managerId;
    if (managerId && empMap.has(managerId)) {
      return empMap.get(managerId)?.empName || null;
    }

    return null;
  };

  const columns = [
    {
      title: "프로젝트명",
      dataIndex: "projectName",
      key: "projectName",
      render: (text, record) => (
        <Text
          strong
          style={{ cursor: "pointer", color: "#1677ff" }}
          onClick={() => navigate(`/work/project/detail/${record.projectId}`)}
        >
          {text}
        </Text>
      ),
    },
    {
      title: "배당팀",
      dataIndex: ["department", "deptName"],
      key: "department",
      render: (text) => text || <Tag color="default">미지정</Tag>,
    },
    {
      title: "PM",
      key: "leader",
      render: (_, record) => {
        if (loading) return <Tag>로딩중</Tag>;
        const leaderName = resolveLeaderName(record);
        return leaderName ? (
          <Text>{leaderName}</Text>
        ) : (
          <Tag color="default">미등록</Tag>
        );
      },
    },
    {
      title: "기한",
      key: "endDate",
      render: (_, record) => {
        const start = dayjs(record.startDate).format("YY.MM.DD");
        const end = dayjs(record.endDate).format("YY.MM.DD");
        return `${start} ~ ${end}`;
      },
    },
  ];

  const startOfMonth = month.startOf("month");
  const endOfMonth = month.endOf("month");

  const monthlyProjects = projects.filter((p) => {
    const s = dayjs(p.startDate);
    const e = dayjs(p.endDate);
    return s.isBefore(endOfMonth) && e.isAfter(startOfMonth);
  });

  return (
    <div style={{ marginTop: 24 }}>
      <Text strong style={{ fontSize: 16 }}>
        📋 {month.format("YYYY년 MM월")} 프로젝트 요약
      </Text>

      <Table
        loading={loading}
        dataSource={monthlyProjects}
        columns={columns}
        pagination={{ pageSize: 6 }}
        rowKey="projectId"
        style={{ marginTop: 12 }}
        locale={{ emptyText: "이 달에 진행 중인 프로젝트가 없습니다." }}
      />
    </div>
  );
};

export default ProjectTableSummary;