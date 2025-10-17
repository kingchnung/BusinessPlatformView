import React, { useMemo, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Spin, Typography, message, Tag } from 'antd';

// 훅 및 API 모듈 import
import { useDepartments } from '../../hr/hooks/useDepartments';
import { useSearch } from '../../hr/hooks/useSearch';
import SearchInput from '../../hr/hrcommon/SearchInput';
import { divideDepartmentsByCode } from '../../hr/util/departmentDivision';
import { createDepartment, updateDepartment, deactivateDepartment, permanentlyDeleteDepartment } from '../../api/hr/departmentsAPI';

const { Title } = Typography;

const DepartmentAdminPage = () => {
  // --- 1. 데이터 가져오기 및 검색 설정 ---
  const { departments, loading, refetchDepartments } = useDepartments(); // refetch 기능이 있다고 가정
  const { searchTerm, setSearchTerm, filteredData } = useSearch(departments, ['deptName', 'deptCode']);
  // ✅ 1. 상위 부서로 선택 가능한 '본부' 목록을 useMemo로 미리 계산합니다.
  const parentDepartmentOptions = useMemo(() => {
    const { divisions } = divideDepartmentsByCode(departments);
    // 최상위 본부를 생성할 수 있도록 '상위 부서 없음' 옵션을 맨 앞에 추가합니다.
    return [
      { deptId: null, deptName: '상위 부서 없음 (신규 본부)' },
      ...divisions
    ];
  }, [departments]);

  // --- 2. 모달 상태 관리 ---
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDept, setEditingDept] = useState(null); // 수정 중인 부서 정보
  const [form] = Form.useForm();

  // --- 3. 핸들러 함수 (내부는 앞으로 채워나갈 부분) ---
  const showAddModal = () => {
    setEditingDept(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (department) => {
    setEditingDept(department);
    form.setFieldsValue(department);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingDept) {
        // --- ✏️ 수정 로직 ---
        await updateDepartment(editingDept.deptId, values);
      } else {
        // --- 🏗️ 생성 로직 ---
        await createDepartment(values);
      }
      
      setIsModalVisible(false);
      refetchDepartments(); // 데이터 새로고침
    } catch (error) {
      console.error("폼 제출 실패:", error);
      // API 모듈에서 이미 message.error를 처리하고 있으므로 추가 처리는 필요 없을 수 있습니다.
    }
  };

  const handleDeactivate = (deptId) => {
    // TODO: 비활성화 API 호출 로직
  };

  // --- 4. 테이블 컬럼 정의 ---
  const columns = [
    { title: '부서 코드', dataIndex: 'deptCode', key: 'deptCode' },
    { title: '부서명', dataIndex: 'deptName', key: 'deptName' },
    { title: '상위 부서', dataIndex: 'parentDeptName', key: 'parentDeptName', render: name => name || '-' },
    { title: '사용 여부', dataIndex: 'isUsed', key: 'isUsed',
      render: isUsed => (
        <Tag color={isUsed === 'Y' ? 'blue' : 'grey'}>
          {isUsed === 'Y' ? '사용' : '비활성'}
        </Tag>
      )
     },
    {
      title: '작업',
      key: 'action',
      render: (_, record) => (
        <span>
          <Button type="link" onClick={() => showEditModal(record)}>수정</Button>
          <Button type="link" danger onClick={() => handleDeactivate(record.deptId)}>비활성화</Button>
        </span>
      ),
    },
  ];

  if (loading) return <Spin tip="부서 목록을 불러오는 중입니다..." />;

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>부서 관리</Title>
        <Button type="primary" onClick={showAddModal}>신규 부서 추가</Button>
      </div>
      <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="부서명 또는 코드로 검색" />
      <Table dataSource={filteredData} columns={columns} rowKey="deptId" />

      {/* --- 5. 생성/수정 모달 (뼈대) --- */}
      <Modal
        title={editingDept ? "부서 정보 수정" : "신규 부서 생성"}
        visible={isModalVisible}
        onOk={handleFormSubmit}
        onCancel={handleCancel}
        okText="저장"
        cancelText="취소"
      >
        <Form form={form} layout="vertical">
          {/* ✅ 1. '신규 생성'일 때만 상위 부서 선택이 가능하도록 설정합니다. */}
          {!editingDept && (
            <Form.Item name="parentDeptId" label="상위 부서" rules={[{ required: true, message: '상위 부서를 선택해주세요.' }]}>
              <Select placeholder="상위 부서를 선택하세요">
                {parentDepartmentOptions.map(dept => (
                  <Select.Option key={dept.deptId} value={dept.deptId}>
                    {dept.deptName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item name="deptName" label="부서명" rules={[{ required: true, message: '부서명을 입력해주세요.' }]}>
            <Input />
          </Form.Item>
          
          {/* ✅ 2. '수정'일 때만 사용 여부 변경이 가능하도록 설정합니다. */}
          {editingDept && (
            <Form.Item name="isUsed" label="사용 여부" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="Y">사용</Select.Option>
                <Select.Option value="N">비활성</Select.Option>
              </Select>
            </Form.Item>
          )}
          </Form>
      </Modal>
    </Card>
  );
};

export default DepartmentAdminPage;