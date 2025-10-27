// src/pages/promotion/PromotionRankModal.jsx
import { useState, useEffect } from "react";
import { Modal, Select, message, Table, Button } from "antd";
import axiosInstance from "../../../common/axiosInstance";

export default function PromotionRankModal({ open, onClose }) {
  const [employees, setEmployees] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [selectedRank, setSelectedRank] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // ✅ 직원 목록 로드
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axiosInstance.get("/employees");
        setEmployees(res.data);
      } catch (err) {
        console.error(err);
        message.error("직원 목록을 불러오지 못했습니다.");
      }
    };
    fetchEmployees();
  }, []);

  // ✅ 직급 목록 로드
  useEffect(() => {
    const fetchRanks = async () => {
      try {
        const res = await axiosInstance.get("/grades");
        setRanks(res.data);
      } catch (err) {
        console.error(err);
        message.error("직급 목록을 불러오지 못했습니다.");
      }
    };
    fetchRanks();
  }, []);

  // ✅ 승진 처리
  const handlePromote = async () => {
    if (!selectedEmployee || !selectedRank)
      return message.warning("직원과 새로운 직급을 모두 선택하세요.");

    try {
      const res = await axiosInstance.put(`/employees/${selectedEmployee.empId}/promote`, {
        rankId: selectedRank,
      });
      message.success(res.data.message || "승진이 완료되었습니다.");
      onClose();
    } catch (err) {
      console.error(err);
      message.error("승진 처리에 실패했습니다.");
    }
  };

  const columns = [
    { title: "이름", dataIndex: "empName", key: "empName" },
    { title: "현재 직급", dataIndex: "gradeName", key: "gradeName" },
    {
      title: "선택",
      render: (_, emp) => (
        <Button
          type={selectedEmployee?.empId === emp.empId ? "primary" : "default"}
          onClick={() => setSelectedEmployee(emp)}
        >
          선택
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title="승진급 관리"
      open={open}
      onCancel={onClose}
      onOk={handlePromote}
      okText="승진 처리"
      cancelText="닫기"
      width={800}
    >
      <Table
        dataSource={employees}
        columns={columns}
        rowKey="empId"
        pagination={{ pageSize: 5 }}
      />

      <div style={{ marginTop: 20 }}>
        <label style={{ display: "block", marginBottom: 8 }}>새로운 직급 선택</label>
        <Select
          style={{ width: "100%" }}
          placeholder="직급을 선택하세요"
          onChange={(value) => setSelectedRank(value)}
          value={selectedRank}
        >
          {ranks.map((r) => (
            <Select.Option key={r.gradeId} value={r.gradeId}>
              {r.gradeName}
            </Select.Option>
          ))}
        </Select>
      </div>
    </Modal>
  );
}
