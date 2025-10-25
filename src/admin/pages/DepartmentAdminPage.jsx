import React, { useMemo, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Spin, Typography, message, Tag, Space, } from 'antd';
import { useDepartments } from "../../hr/hooks/useDepartments";
import { useSearch } from '../../hr/hooks/useSearch';
import { useEmployees } from '../../hr/hooks/useEmployees';
import SearchInput from '../../hr/hrcommon/SearchInput';
import { divideDepartmentsByCode } from '../../hr/util/departmentDivision';
import {
  createDepartment,
  updateDepartment,
  permanentlyDeleteDepartment,
  assignDepartmentManager,
} from '../../api/hr/departmentsAPI';
import axiosInstance from '../../common/axiosInstance';

const { Title } = Typography;

const DepartmentAdminPage = () => {
  const { departments, loading, refetchDepartments } = useDepartments();
  const { searchTerm, setSearchTerm, filteredData } = useSearch(departments, [
    'deptName',
    'deptCode',
    'parentDeptName',
  ]);
  const [modal, contextHolder] = Modal.useModal();
  const { employees, loading: empLoading } = useEmployees();

  const parentDepartmentOptions = useMemo(() => {
    const { divisions = [] } = divideDepartmentsByCode(departments || []);
    return [{ deptId: null, deptName: '상위 부서 없음 (최상위 본부)' }, ...divisions];
  }, [departments]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [form] = Form.useForm();

  // ✅ 부서장 임명 모달 관련 상태
  const [managerModalVisible, setManagerModalVisible] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null); // 선택된 매니저의 empId
  const [managerLoading, setManagerLoading] = useState(false);

  const getManagerName = (managerId) => {
    if (!managerId || empLoading) return "-";
    const manager = employees.find((emp) => emp.empId === managerId);
    return manager ? manager.empName : "-";
  };

  // ✅ 신규 등록
  const showAddModal = () => {
    setEditingDept(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // ✅ 수정 (이름변경 / 비활성화 / 상위부서변경)
  const showEditModal = (department) => {
    setEditingDept(department);
    form.setFieldsValue(department);
    setIsModalVisible(true);
  };

  const handleCancel = () => setIsModalVisible(false);

  // ✅ 저장 로직 (생성/수정 공통)
  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (values.isUsed) {
        values.isUsed = values.isUsed === 'Y' ? 'Y' : 'N';
      }

      // 🔹 자기 자신을 상위부서로 지정 방지
      if (editingDept && values.parentDeptId === editingDept.deptId) {
        message.warning('자기 자신을 상위 부서로 지정할 수 없습니다.');
        return;
      }

      if (editingDept) {
        await updateDepartment(editingDept.deptId, values);
        message.success('부서 정보가 수정되었습니다.');
      } else {
        await createDepartment(values);
        message.success('신규 부서가 등록되었습니다.');
      }

      setIsModalVisible(false);
      await refetchDepartments();
    } catch (error) {
      console.error('폼 제출 실패:', error);
      message.error('부서 정보 저장 중 오류가 발생했습니다.');
    }
  };

  // ✅ 완전삭제 (이중 안전장치)
  const handlePermanentDelete = (deptId) => {
    const hasChildren = departments.some((d) => d.parentDeptId === deptId);
    if (hasChildren) {
      Modal.warning({
        title: '삭제 불가',
        content: (
          <>
            하위 부서(팀)가 존재하여 삭제할 수 없습니다.
            <br />
            먼저 하위 부서를 삭제한 후 다시 시도해주세요.
          </>
        ),
        okText: '확인',
      });
      return;
    }

    modal.confirm({
      title: '정말로 이 부서를 완전히 삭제하시겠습니까?',
      content: '⚠️ 이 작업은 되돌릴 수 없습니다. 모든 관련 데이터가 영구적으로 삭제됩니다.',
      okText: '완전삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        try {
          await permanentlyDeleteDepartment(deptId);
          await refetchDepartments();
          message.success('부서가 완전히 삭제되었습니다.');
        } catch (error) {
          if (error.response?.status === 409) {
            Modal.warning({
              title: '삭제 불가',
              content: (
                <>
                  해당 부서에 연결된 하위 부서 또는 직원이 존재합니다.
                  <br />
                  모든 하위 데이터를 정리한 후 다시 시도해주세요.
                </>
              ),
              okText: '확인',
            });
          } else {
            console.error('부서 삭제 중 오류 발생:', error);
            message.error('부서를 삭제하는 중 문제가 발생했습니다.');
          }
        }
      },
    });
  };

  // ✅ 부서장 관련 로직 ==========================================================
  const fetchEmployeesByDept = async (deptId) => {
    setManagerLoading(true);
    try {
      // 💡 참고: 해당 부서 직원만 불러오는 것보다,
      // 전체 직원(또는 특정 직급 이상)을 불러오는 것이 부서장 임명에는 더 적합할 수 있습니다.
      // 현재는 로직을 유지합니다. (필요시 /api/employees/all 등으로 변경)
      const res = await axiosInstance.get(`/employees/byDepartment/${deptId}`);
      setEmployeeList(res.data || []);
    } catch (err) {
      message.error('직원 목록을 불러오지 못했습니다.');
    } finally {
      setManagerLoading(false);
    }
  };

  // 👈 4. '부서장 임명' 모달 표시 함수 수정
  const showManagerModal = async (department) => {
    setEditingDept(department); // 👈 현재 수정할 부서 정보를 state에 저장
    await fetchEmployeesByDept(department.deptId);
    
    // 👈 (개선) department 객체에 managerId (매니저의 empId)가 있다는 가정 하에,
    //    기존 부서장을 기본값으로 선택합니다. 필드명은 실제 데이터에 맞게 조정하세요.
    setSelectedManager(department.managerId || null); 
    
    setManagerModalVisible(true);
  };

  const handleAssignManager = async () => {
    if (!selectedManager) {
      message.warning('부서장을 선택해주세요.');
      return;
    }
    
    // editingDept가 설정되어 있으므로 deptId를 사용할 수 있습니다.
    if (!editingDept) {
      message.error('부서장 임명 대상 부서 정보가 없습니다.');
      return;
    }

    try {
      await assignDepartmentManager(editingDept.deptId, selectedManager);
      message.success('부서장이 임명되었습니다.');
      setManagerModalVisible(false);
      await refetchDepartments();
      
      // 상태 초기화
      setEditingDept(null);
      setSelectedManager(null);
    } catch (error) {
      console.error('부서장 임명 중 오류:', error);
      message.error('부서장 임명 중 오류가 발생했습니다.');
    }
  };
  // =========================================================================

  // ✅ 테이블 컬럼
  const columns = [
    { title: '부서 코드', dataIndex: 'deptCode', key: 'deptCode' },
    { title: '부서명', dataIndex: 'deptName', key: 'deptName' },
    { title: '상위 부서', dataIndex: 'parentDeptName', key: 'parentDeptName', render: (name) => name || '-' },
    { title: '부서장', dataIndex: 'managerId', key: 'managerId', render: (managerId) => getManagerName(managerId),},
    {
      title: '사용 여부',
      dataIndex: 'isUsed',
      key: 'isUsed',
      render: (isUsed) => (
        <Tag color={isUsed === 'Y' ? 'blue' : 'default'}>
          {isUsed === 'Y' ? '사용' : '비활성'}
        </Tag>
      ),
    },
    {
      title: '작업',
      key: 'action',
      // 👈 2. '작업' 컬럼 렌더링 방식 수정
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => showEditModal(record)}>
            수정
          </Button>
          <Button type="link" onClick={() => showManagerModal(record)}>
            부서장 임명
          </Button>
          <Button type="link" danger onClick={() => handlePermanentDelete(record.deptId)}>
            완전삭제
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) return <Spin tip="부서 목록을 불러오는 중입니다..." />;

  return (
    <Card>
      {contextHolder}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          부서 관리
        </Title>
        <Button type="primary" onClick={showAddModal}>
          신규 부서 추가
        </Button>
      </div>

      <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="부서명 또는 코드로 검색" />
      <Table dataSource={filteredData} columns={columns} rowKey="deptId" />

      {/* ✅ 생성 / 수정 모달 */}
      <Modal
        title={editingDept ? '이름변경 / 비활성화 / 상위부서변경' : '신규 부서 생성'}
        open={isModalVisible}
        onOk={handleFormSubmit}
        onCancel={handleCancel}
        okText="저장"
        cancelText="취소"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="parentDeptId" label="상위 부서">
            <Select placeholder="상위 부서를 선택하세요">
              {parentDepartmentOptions
                .filter((opt) => opt.deptId !== editingDept?.deptId)
                .map((dept) => (
                  <Select.Option key={dept.deptId} value={dept.deptId}>
                    {dept.deptName}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="deptName"
            label="부서명"
            rules={[{ required: true, message: '부서명을 입력해주세요.' }]}
          >
            <Input />
          </Form.Item>

          {editingDept && (
            <Form.Item name="isUsed" label="사용 여부" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="Y">사용</Select.Option>
                <Select.Option value="N">비활성</Select.Option>
              </Select>
            </Form.Item>
          )}

          {/* 👈 3. '수정' 모달 내부에 있던 '부서장 임명' 버튼 삭제 */}
          
        </Form>
      </Modal>

      {/* ✅ 부서장 임명 모달 */}
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
              { title: '사번', dataIndex: 'empNo', key: 'empNo', width: '20%' },
              { title: '이름', dataIndex: 'empName', key: 'empName', width: '25%' },
              { title: '직급', dataIndex: 'positionName', key: 'positionName', width: '25%' },
              {
                title: '상태',
                dataIndex: 'status',
                key: 'status',
                width: '20%',
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
  );
};

export default DepartmentAdminPage;