// src/pages/hr/DepartmentHeadModal.jsx
import React, { useEffect, useState } from 'react';
import { Modal, Table, Select, Spin, message, Button } from 'antd';
import axiosInstance from '../../../common/axiosInstance';
import { useSearch } from '../../hooks/useSearch';
import SearchInput from "../../hrcommon/SearchInput"

const { Option } = Select;

export default function DepartmentHeadModal({ open, onClose, dept, onSuccess }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(null);

  // useSearch: 모달 내부에서 직원 검색 가능하게 함
  const { searchTerm, setSearchTerm, filteredData } = useSearch(employees, ['empName', 'empNo', 'positionName']);

  useEffect(() => {
    if (!dept || !open) return;
    const fetchDeptEmployees = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/employees/byDepartment/${dept.deptId}`);
        setEmployees(res.data || []);
      } catch (err) {
        console.error(err);
        message.error('해당 부서의 직원 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchDeptEmployees();
    // 초기 선택 해제
    setSelectedEmpId(null);
    setSearchTerm(''); // 모달 열 때 검색 초기화
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dept, open]);

  const handleAssign = async () => {
    if (!selectedEmpId) {
      message.warning('임명할 직원을 선택하세요.');
      return;
    }
    try {
      setLoading(true);
      await axiosInstance.put(`/departments/${dept.deptId}/assign-head`, { empId: selectedEmpId });
      message.success('부서장이 성공적으로 임명되었습니다.');
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || '부서장 임명에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: '사번', dataIndex: 'empNo', key: 'empNo', width: 120 },
    { title: '이름', dataIndex: 'empName', key: 'empName' },
    { title: '직위', dataIndex: 'positionName', key: 'positionName' },
    {
      title: '선택',
      key: 'select',
      width: 120,
      render: (_, record) => (
        <Button
          type={selectedEmpId === record.empId ? 'primary' : 'default'}
          onClick={() => setSelectedEmpId(record.empId)}
        >
          {selectedEmpId === record.empId ? '선택됨' : '선택'}
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title={`부서장 임명: ${dept?.deptName || ''}`}
      open={open}
      onCancel={onClose}
      onOk={handleAssign}
      okText="임명"
      cancelText="취소"
      width={800}
      confirmLoading={loading}
    >
      {loading ? (
        <Spin />
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="이름/사번/직위로 검색" />
          </div>

          <Table
            dataSource={filteredData}
            columns={columns}
            rowKey="empId"
            pagination={{ pageSize: 5 }}
            locale={{ emptyText: '해당 부서에 직원이 없습니다.' }}
          />
        </>
      )}
    </Modal>
  );
}
