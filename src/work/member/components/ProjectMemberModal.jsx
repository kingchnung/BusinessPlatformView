import { useEffect, useState } from "react";
import { Modal, Form, Select, Input, Button, Table, message } from "antd";
import axiosInstance from "../../../common/axiosInstance";

const ProjectMemberModal = ({ open, onClose, project, onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [addedMembers, setAddedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [role, setRole] = useState("");

  const deptId = project?.department?.deptId;
  const deptName = project?.department?.deptName;

  // ✅ 해당 부서 직원만 로드
  useEffect(() => {
    if (!deptId) return;
    const fetchEmployees = async () => {
      try {
        const res = await axiosInstance.get(`/employees/byDepartment/${deptId}`);
        setEmployees(res.data || []);
      } catch (err) {
        console.error("직원 조회 실패:", err);
        message.error("직원 정보를 불러오지 못했습니다.");
      }
    };
    fetchEmployees();
  }, [deptId]);

  // ✅ 구성원 추가 (로컬 상태에만 우선 저장)
  const handleAddTempMember = () => {
    if (!selectedEmp || !role.trim()) {
      message.warning("직원과 역할을 모두 입력하세요.");
      return;
    }

    // 중복 추가 방지
    if (addedMembers.some((m) => m.empId === selectedEmp)) {
      message.warning("이미 추가된 직원입니다.");
      return;
    }

    const emp = employees.find((e) => e.empId === selectedEmp);
    setAddedMembers((prev) => [
      ...prev,
      {
        empId: emp.empId,
        empName: emp.empName,
        positionName: emp.positionName,
        deptName: emp.deptName,
        projectRole: role,
      },
    ]);

    // 입력 초기화
    setSelectedEmp(null);
    setRole("");
  };

  // ✅ 구성원 제거
  const handleRemoveTempMember = (empId) => {
    setAddedMembers((prev) => prev.filter((m) => m.empId !== empId));
  };

  // ✅ 서버 저장
  const handleSaveMembers = async () => {
    if (!addedMembers.length) {
      message.warning("추가된 구성원이 없습니다.");
      return;
    }

    try {
      setLoading(true);

      for (const member of addedMembers) {
        await axiosInstance.post("/members", {
          projectId: project.projectId,
          empId: member.empId,
          projectRole: member.projectRole,
        });
      }

      message.success("구성원이 성공적으로 추가되었습니다!");
      setAddedMembers([]);
      onClose();
      onSuccess(); // 상세페이지 새로고침
    } catch (err) {
      console.error("구성원 저장 실패:", err);
      message.error("구성원 저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "이름", dataIndex: "empName", key: "empName" },
    { title: "직급", dataIndex: "positionName", key: "positionName" },
    { title: "부서", dataIndex: "deptName", key: "deptName" },
    { title: "역할", dataIndex: "projectRole", key: "projectRole" },
    {
      title: "삭제",
      key: "remove",
      render: (_, record) => (
        <Button type="link" danger onClick={() => handleRemoveTempMember(record.empId)}>
          삭제
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title={`👥 ${deptName} 구성원 추가`}
      open={open}
      onCancel={onClose}
      width={750}
      footer={null}
      destroyOnClose
    >
      <Form layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item label="직원 선택" style={{ flex: 1 }}>
          <Select
            showSearch
            placeholder="팀원을 선택하세요"
            value={selectedEmp}
            onChange={setSelectedEmp}
            style={{ width: "100%" }}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {employees.map((emp) => (
              <Select.Option key={emp.empId} value={emp.empId}>
                {`${emp.empName} (${emp.positionName})`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="역할" style={{ flex: 1 }}>
          <Input
            placeholder="예: 백엔드 개발"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" onClick={handleAddTempMember}>
            추가
          </Button>
        </Form.Item>
      </Form>

      {/* ✅ 임시 추가 목록 */}
      <Table
        dataSource={addedMembers}
        columns={columns}
        rowKey="empId"
        pagination={false}
        size="small"
      />

      <div style={{ textAlign: "right", marginTop: 16 }}>
        <Button onClick={onClose} style={{ marginRight: 8 }}>
          취소
        </Button>
        <Button
          type="primary"
          loading={loading}
          onClick={handleSaveMembers}
          disabled={!addedMembers.length}
        >
          저장
        </Button>
      </div>
    </Modal>
  );
};

export default ProjectMemberModal;
