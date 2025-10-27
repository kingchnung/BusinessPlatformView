import React, { useState, useMemo } from 'react';
import { Spin, Card, Typography, Table, Button, Modal, Form, Select, DatePicker, Input, message, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import axiosInstance from '../../../common/axiosInstance'; // 🚨 부서장 임명 모달용 import

// 훅 및 API 모듈 import
import { useEmployees } from '../../hooks/useEmployees';
import { usePositions } from '../../hooks/usePositions';
import { useGrades } from '../../hooks/useGrades';
import { useDepartments } from '../../hooks/useDepartments'; // 🚨 [신규] 부서 훅
import { createAssignment } from '../../../api/hr/assignmentAPI';
import { assignDepartmentManager } from '../../../api/hr/departmentsAPI'; // 🚨 [신규] 부서장 임명 API
import { useSearch } from '../../hooks/useSearch';
import SearchInput from '../../hrcommon/SearchInput';

const { Title } = Typography;
const { Option } = Select;

// ⭐️ 이 페이지는 이제 '인사 발령' (승진/부서장임명) 페이지가 됩니다.
const PersonnelManagementPage = () => { // 💡 이름 변경 제안: DepartmentPromotionPage -> PersonnelManagementPage
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal(); // 🚨 [신규] 삭제 확인용 모달

  // 1. 훅을 통해 데이터 가져오기
  // 1-1. 승진 관련 데이터
  const { employees, loading: empsLoading, refetchEmployees } = useEmployees();
  const { positions, loading: posLoading } = usePositions();
  const { grades, loading: graLoading } = useGrades();
  
  // 1-2. 부서장 임명 관련 데이터
  const { departments, loading: deptLoading, refetchDepartments } = useDepartments(); // 🚨 [신규]
  
  // 2. 상태 관리
  // 2-1. 승진 관련 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // 2-2. 부서장 임명 관련 상태 (DepartmentAdminPage에서 이동)
  const [managerModalVisible, setManagerModalVisible] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [managerLoading, setManagerLoading] = useState(false);
  const [editingDept, setEditingDept] = useState(null); // 부서장 임명 대상 부서

  // 3. 검색 훅 (⭐️ 중요: 직원용, 부서용 2개로 분리)
  // 3-1. 직원 검색
  const { 
    searchTerm: empSearchTerm, 
    setSearchTerm: setEmpSearchTerm, 
    filteredData: filteredEmployees 
  } = useSearch(employees, ['empName', 'deptName']);

  // 3-2. 부서 검색
  const { 
    searchTerm: deptSearchTerm, 
    setSearchTerm: setDeptSearchTerm, 
    filteredData: filteredDepartments 
  } = useSearch(departments, ['deptName', 'deptCode', 'parentDeptName']);


  // 4. 핸들러: 승진 및 정보 변경
  const showModal = (employee) => {
    setSelectedEmployee(employee);
    form.setFieldsValue({
      assDate: dayjs(),
      newPositionCode: employee.positionCode,
      newGradeCode: employee.gradeCode,
      reason: '',
    });
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      
      const assignmentData = {
        empId: selectedEmployee.empId,
        newDeptId: selectedEmployee.deptId,
        newPositionCode: values.newPositionCode,
        newGradeCode: values.newGradeCode,
        assDate: values.assDate.format('YYYY-MM-DD'),
        reason: values.reason,
      };

      await createAssignment(assignmentData);
      message.success(`${selectedEmployee.empName} 님의 인사 정보가 성공적으로 변경되었습니다.`);
      setIsModalVisible(false);
      refetchEmployees(); // 직원 목록 새로고침
    } catch (error) {
      console.error('인사 정보 변경 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => setIsModalVisible(false);

  // 5. 핸들러: 부서장 임명 (DepartmentAdminPage에서 이동)
  
  // 5-1. 부서장 이름 가져오기 (useEmployees 훅이 이미 있으므로 완벽 호환)
  const getManagerName = (managerId) => {
    if (!managerId || empsLoading) return "-";
    const manager = employees.find((emp) => emp.empId === managerId);
    return manager ? manager.empName : "-";
  };

  // 5-2. 부서장 임명 모달용 직원 목록 조회
  const fetchEmployeesByDept = async (deptId) => {
    setManagerLoading(true);
    try {
      // 💡 참고: 이 로직은 해당 부서 직원만 불러옵니다.
      // 만약 다른 부서 직원을 부서장으로 임명할 수 있어야 한다면,
      // `useEmployees`의 `employees`를 필터링하거나 전체 직원을 보여주는 것이 나을 수 있습니다.
      // 여기서는 원본 로직을 유지합니다.
      const res = await axiosInstance.get(`/employees/byDepartment/${deptId}`);
      setEmployeeList(res.data || []);
    } catch (err) {
      message.error('직원 목록을 불러오지 못했습니다.');
    } finally {
      setManagerLoading(false);
    }
  };

  // 5-3. 부서장 임명 모달 열기
  const showManagerModal = async (department) => {
    setEditingDept(department);
    await fetchEmployeesByDept(department.deptId);
    setSelectedManager(department.managerId || null);
    setManagerModalVisible(true);
  };

  // 5-4. 부서장 임명 처리
  const handleAssignManager = async () => {
    if (!selectedManager) {
      message.warning('부서장을 선택해주세요.');
      return;
    }
    if (!editingDept) {
      message.error('부서장 임명 대상 부서 정보가 없습니다.');
      return;
    }

    try {
      await assignDepartmentManager(editingDept.deptId, selectedManager);
      message.success('부서장이 임명되었습니다.');
      setManagerModalVisible(false);
      await refetchDepartments(); // ⭐️ 부서 목록 새로고침
      
      setEditingDept(null);
      setSelectedManager(null);
    } catch (error) {
      console.error('부서장 임명 중 오류:', error);
      message.error('부서장 임명 중 오류가 발생했습니다.');
    }
  };


  // 6. 테이블 컬럼 정의
  // 6-1. 직원 테이블 (승진용)
  const employeeColumns = [
    { title: '사원번호', dataIndex: 'empId', key: 'empId' },
    { title: '이름', dataIndex: 'empName', key: 'empName' },
    { title: '부서', dataIndex: 'deptName', key: 'deptName' },
    { title: '현재 직위', dataIndex: 'positionName', key: 'positionName' },
    { title: '현재 직급', dataIndex: 'gradeName', key: 'gradeName' },
    {
      title: '작업', key: 'action',
      render: (_, record) => <Button onClick={() => showModal(record)}>변경</Button>,
    },
  ];
  
  // 6-2. 부서 테이블 (부서장 임명용)
  const departmentColumns = [
    { title: '부서 코드', dataIndex: 'deptCode', key: 'deptCode' },
    { title: '부서명', dataIndex: 'deptName', key: 'deptName' },
    { title: '상위 부서', dataIndex: 'parentDeptName', key: 'parentDeptName', render: (name) => name || '-' },
    { title: '현 부서장', dataIndex: 'managerId', key: 'managerId', render: (managerId) => getManagerName(managerId)},
    {
      title: '사용 여부', dataIndex: 'isUsed', key: 'isUsed',
      render: (isUsed) => (
        <Tag color={isUsed === 'Y' ? 'blue' : 'default'}>
          {isUsed === 'Y' ? '사용' : '비활성'}
        </Tag>
      ),
    },
    {
      title: '작업', key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => showManagerModal(record)}>
          부서장 임명
        </Button>
      ),
    },
  ];


  // 7. 로딩 처리 (모든 훅 로딩 완료시까지)
  if (empsLoading || posLoading || graLoading || deptLoading) return <Spin tip="데이터 로딩 중..." />;

  // 8. 렌더링
  return (
    // 💡 2개의 Card를 반환하기 위해 Fragment 사용
    <> 
      {contextHolder} {/* 🚨 삭제 확인 모달용 (지금은 안 쓰지만 AdminPage에서 가져옴) */}
      
      {/* =================================================================== */}
      {/* 1. 승진 및 인사 정보 변경 섹션                                     */}
      {/* =================================================================== */}
      <Card>
        <Title level={4}>승진 및 인사 정보 변경</Title>

        <SearchInput 
          value={empSearchTerm} // ⭐️ 직원 검색어
          onChange={setEmpSearchTerm} // ⭐️ 직원 검색어 설정
          placeholder="직원 또는 부서 이름으로 검색"
        />

        <Table dataSource={filteredEmployees} columns={employeeColumns} rowKey="empId" />

        {selectedEmployee && (
          <Modal
            title={`${selectedEmployee.empName} - 인사 정보 변경`}
            open={isModalVisible} // ⭐️ 'visible' 대신 'open' 사용 (AntD v5+)
            onOk={handleOk}
            onCancel={handleCancel}
            okButtonProps={{loading:isSubmitting}}
            okText="저장"
            cancelText="취소"
          >
            <Form form={form} layout="vertical">
              <Form.Item name="assDate" label="발령일자" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="newPositionCode" label="새 직위" rules={[{ required: true }]}>
                <Select placeholder="새 직위를 선택하세요">
                  {positions.map(pos => <Option key={pos.positionCode} value={pos.positionCode}>{pos.positionName}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item name="newGradeCode" label="새 직급" rules={[{ required: true }]}>
                <Select placeholder="새 직급을 선택하세요">
                  {grades.map(gra => <Option key={gra.gradeCode} value={gra.gradeCode}>{gra.gradeName}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item name="reason" label="변경 사유" rules={[{ required: true }]}>
                <Input.TextArea rows={3} />
              </Form.Item>
            </Form>
          </Modal>
        )}
      </Card>

      {/* =================================================================== */}
      {/* 2. 부서장 임명 섹션 (신규)                                          */}
      {/* =================================================================== */}
      <Card style={{ marginTop: 24 }}>
        <Title level={4}>부서장 임명</Title>

        <SearchInput 
          value={deptSearchTerm} // ⭐️ 부서 검색어
          onChange={setDeptSearchTerm} // ⭐️ 부서 검색어 설정
          placeholder="부서명 또는 코드로 검색"
        />

        <Table dataSource={filteredDepartments} columns={departmentColumns} rowKey="deptId" />

        {/* 부서장 임명 모달 (DepartmentAdminPage에서 이동) */}
        <Modal
          title={`부서장 임명 - ${editingDept?.deptName || ''}`}
          open={managerModalVisible}
          onOk={handleAssignManager}
          onCancel={() => setManagerModalVisible(false)}
          okText="임명"
          cancelText="취소"
          width={600}
        >
          {managerLoading ? (
            <Spin tip="직원 목록을 불러오는 중..." />
          ) : (
            <Table
              dataSource={employeeList}
              rowKey="empId"
              rowSelection={{
                type: 'radio',
                selectedRowKeys: selectedManager ? [selectedManager] : [],
                onChange: (selectedKeys) => setSelectedManager(selectedKeys[0]),
              }}
              columns={[
                { title: '사번', dataIndex: 'empNo', key: 'empNo', width: '20%' }, // 💡 'empNo'가 맞는지 확인 필요 (없다면 empId)
                { title: '이름', dataIndex: 'empName', key: 'empName', width: '25%' },
                { title: '직급', dataIndex: 'positionName', key: 'positionName', width: '25%' }, // 💡 'positionName'이 맞는지 확인 필요
                {
                  title: '상태', dataIndex: 'status', key: 'status', width: '20%',
                  render: (status) => (
                    <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
                      {status === 'ACTIVE' ? '재직' : '퇴직'}
                    </Tag>
                  ),
                },
              ]}
              pagination={{ pageSize: 5 }}
            />
          )}
        </Modal>
      </Card>
    </>
  );
};

export default PersonnelManagementPage; // 💡 이름 변경 제안