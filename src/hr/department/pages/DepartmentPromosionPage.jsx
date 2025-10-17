import React, { useState } from 'react';
import { Spin, Card, Typography, Table, Button, Modal, Form, Select, DatePicker, Input, message } from 'antd';
import dayjs from 'dayjs';

// 훅 및 API 모듈 import
import { useEmployees } from '../../hooks/useEmployees';
import { usePositions } from '../../hooks/usePositions';
import { useGrades } from '../../hooks/useGrades';
import { createAssignment } from '../../../api/hr/assignmentAPI';
import { useSearch } from '../../hooks/useSearch';
import SearchInput from '../../hrcommon/SearchInput';

const { Title } = Typography;
const { Option } = Select;

const DepartmentPromotionPage = () => {
  // 1. 훅을 통해 데이터 가져오기
  const { employees, loading: empsLoading, refetchEmployees } = useEmployees();
  const { positions, loading: posLoading } = usePositions();
  const { grades, loading: graLoading } = useGrades();
  //서치할수 있는 영역설정
  const { searchTerm, setSearchTerm, filteredData } = useSearch(employees, ['empName', 'deptName']);

  // 2. 상태 관리
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [form] = Form.useForm();

  // 3. 모달 열기 핸들러
  const showModal = (employee) => {
    setSelectedEmployee(employee);
    form.setFieldsValue({
      assDate: dayjs(), // 오늘 날짜 기본값
      newPositionCode: employee.positionCode,
      newGradeCode: employee.gradeCode,
      reason: '',
    });
    setIsModalVisible(true);
  };

  // 4. 저장(폼 제출) 핸들러
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      
      const assignmentData = {
        empId: selectedEmployee.empId,
        newDeptId: selectedEmployee.deptId, // 부서는 변경하지 않음
        newPositionCode: values.newPositionCode,
        newGradeCode: values.newGradeCode,
        assDate: values.assDate.format('YYYY-MM-DD'),
        reason: values.reason,
      };

      await createAssignment(assignmentData);
      message.success(`${selectedEmployee.empName} 님의 인사 정보가 성공적으로 변경되었습니다.`);
      setIsModalVisible(false);
      // TODO: 데이터 새로고침 로직 추가 (예: employees 목록 다시 불러오기)
      refetchEmployees();
    } catch (error) {
      console.error('인사 정보 변경 실패:', error);
    }finally{
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => setIsModalVisible(false);

  // 5. 테이블 컬럼 정의
  const columns = [
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

  if (empsLoading || posLoading || graLoading) return <Spin tip="데이터 로딩 중..." />;

  return (
    <Card>
      <Title level={4}>승진 및 인사 정보 변경</Title>

      <SearchInput 
        value={searchTerm} 
        onChange={setSearchTerm} 
        placeholder="직원 또는 부서 이름으로 검색" // placeholder 텍스트만 변경
      />


      <Table dataSource={filteredData} columns={columns} rowKey="empId" />

      {selectedEmployee && (
        <Modal
          title={`${selectedEmployee.empName} - 인사 정보 변경`}
          visible={isModalVisible}
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
  );
};

export default DepartmentPromotionPage;