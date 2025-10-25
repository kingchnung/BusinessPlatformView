import { Table, Typography, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "../../../hr/hooks/useEmployees"; // ✅ 직원 데이터 훅
import dayjs from "dayjs";
import { getManagerNameByDeptId } from "../../../hr/util/getmanagerName";
import { useDepartments } from "../../../hr/hooks/useDepartments";

const { Text } = Typography;

const ProjectTableSummary = ({ projects = [], month }) => {
  const navigate = useNavigate();
  const { employees, loading: empLoading } = useEmployees(); // ✅ 직원 전체 목록 불러오기
  const { departments, loading: deptLoading} = useDepartments();


  const loading = empLoading || deptLoading;
  
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
      title: "팀장",
      key: "leader",
      render: (_, record) => {
        const deptId = record.department?.deptId;
        const leaderName = getManagerNameByDeptId(deptId, departments, employees); // ✅ deptId로 변경
        return leaderName && leaderName !== "미등록" ? (
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
