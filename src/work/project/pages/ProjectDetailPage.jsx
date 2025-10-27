import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProjectDetail } from "../../../api/work/projectApi";
import {
  Card,
  Descriptions,
  Divider,
  Table,
  Tag,
  Spin,
  Button,
  message,
} from "antd";
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import ProjectMemberModal from "../../member/components/ProjectMemberModal";

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");

  // ▼ ProjectDetailPage 컴포넌트 내부 (userInfo 선언 아래쪽 아무데나)
  const roles = Array.isArray(userInfo?.roles)
    ? userInfo.roles
    : (userInfo?.role ? [userInfo.role] : []);

  const isAdmin = roles.includes("ROLE_ADMIN") || roles.includes("ROLE_CEO");
  const isManager = roles.includes("ROLE_MANAGER");

  // userId 타입이 문자열일 수 있으니 숫자로 비교 안전하게
  const currentUserId = Number(userInfo?.userId);
  const authorUserId = Number(project?.author?.userId);
  const isAuthor = !!authorUserId && currentUserId === authorUserId;

  // 최종: ADMIN/CEO 는 무조건, MANAGER 는 본인 작성건만
  const canEdit = isAdmin || (isManager && isAuthor);

  // ✅ 프로젝트 상세 조회 (외부에서도 호출 가능하게 useCallback)
  const fetchProject = useCallback(async () => {
    try {
      const data = await fetchProjectDetail(projectId);
      setProject(data);
    } catch (err) {
      console.error("프로젝트 조회 실패:", err);
      message.error("프로젝트 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  if (loading) return <Spin size="large" style={{ display: "block", marginTop: "30vh" }} />;

  // ✅ 구성원 테이블 컬럼 정의
  const columns = [
    { title: "이름", dataIndex: "empName", key: "empName" },
    { title: "직급", dataIndex: "positionName", key: "positionName" },
    { title: "부서", dataIndex: "deptName", key: "deptName" },
    { title: "역할", dataIndex: "projectRole", key: "projectRole" },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      render: (s) => (
        <Tag color={s === "ACTIVE" ? "green" : "gray"}>{s || "참여중"}</Tag>
      ),
    },
  ];

  // ✅ 현재 로그인 사용자가 이 프로젝트 부서의 팀장/PM인지 판단
  const canAddMember =
    userInfo?.deptCode === project?.department?.deptCode &&
    (
      (Array.isArray(userInfo?.roles) &&
        (userInfo.roles.includes("ROLE_MANAGER") ||
          userInfo.roles.includes("ROLE_ADMIN") ||
          userInfo.roles.includes("ROLE_CEO")))
      ||
      (typeof userInfo?.role === "string" &&
        ["ROLE_MANAGER", "ROLE_ADMIN", "ROLE_CEO"].includes(userInfo.role))
    );

  // ✅ 구성원 추가 버튼 클릭 시
  const handleOpenAddMemberModal = () => {
    if (!canAddMember) {
      message.warning("해당 부서의 팀장 또는 PM만 구성원을 추가할 수 있습니다.");
      return;
    }
    setModalOpen(true);
  };

  return (
    <div style={{ padding: 24 }}>
      {/* ✅ 목록으로 돌아가기 버튼 */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{
          marginBottom: 16,
          background: "#1677ff",
          color: "white",
          borderRadius: 8,
        }}
      >
        목록으로
      </Button>
      {canEdit && (
        <Button
          type="primary"
          style={{ marginLeft: 8 }}
          onClick={() => navigate(`/work/project/edit/${project.projectId}`)}
        >
          수정
        </Button>
      )}

      {/* ✅ 프로젝트 상세 카드 */}
      <Card
        title={`📁 ${project.projectName}`}
        style={{
          marginBottom: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="부서">
            {project.department?.deptName}
          </Descriptions.Item>
          <Descriptions.Item label="작성자">
            {project.author?.empName || project.author?.username || "-"}
          </Descriptions.Item>

          <Descriptions.Item label="담당자(PM)">
            {project.pmName || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="기간">
            {`${dayjs(project.startDate).format("YYYY.MM.DD")} ~ ${dayjs(
              project.endDate
            ).format("YYYY.MM.DD")}`}
          </Descriptions.Item>
          <Descriptions.Item label="상태">
            {(() => {
              const statusMap = {
                PLANNING: "기획중",
                IN_PROGRESS: "진행중",
                COMPLETED: "완료",
                CANCELED: "종료",
              };

              const colorMap = {
                PLANNING: "orange",
                IN_PROGRESS: "green",
                COMPLETED: "blue",
                CANCELED: "gray",
              };

              const statusKey = project.status?.toUpperCase() || "PLANNING";
              const label = statusMap[statusKey] || "미정";
              const color = colorMap[statusKey] || "default";

              return <Tag color={color}>{label}</Tag>;
            })()}
          </Descriptions.Item>
          <Descriptions.Item label="목표" span={2}>
            {project.projectGoal || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="개요" span={2}>
            {project.projectOverview || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="예상 효과" span={2}>
            {project.expectedEffect || "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* ✅ 참여 구성원 */}
      <Divider orientation="left">👥 참여 구성원</Divider>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <h3 style={{ margin: 0 }}>참여 구성원 목록</h3>

        {canAddMember && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenAddMemberModal}
          >
            구성원 추가
          </Button>
        )}
      </div>

      <Table
        dataSource={project.participants || []}
        columns={columns}
        rowKey="projectMemberId"
        pagination={false}
      />

      {/* ✅ 구성원 추가 모달 */}
      <ProjectMemberModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        project={project}
        onSuccess={fetchProject} // 추가 후 리스트 새로고침
      />
    </div>
  );
};

export default ProjectDetailPage;
