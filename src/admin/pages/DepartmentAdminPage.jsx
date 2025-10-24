import React, { useMemo, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Spin, Typography, message, Tag } from 'antd';
import { useDepartments } from '../../hr/hooks/useDepartments';
import { useSearch } from '../../hr/hooks/useSearch';
import SearchInput from '../../hr/hrcommon/SearchInput';
import { divideDepartmentsByCode } from '../../hr/util/departmentDivision';
import { createDepartment, updateDepartment, permanentlyDeleteDepartment } from '../../api/hr/departmentsAPI';

const { Title } = Typography;

const DepartmentAdminPage = () => {
  const { departments, loading, refetchDepartments } = useDepartments();
  const { searchTerm, setSearchTerm, filteredData } = useSearch(departments, ['deptName', 'deptCode', 'parentDeptName']);
  const [modal, contextHolder] = Modal.useModal();

  const parentDepartmentOptions = useMemo(() => {
    const { divisions = [] } = divideDepartmentsByCode(departments || []);
    return [{ deptId: null, deptName: '상위 부서 없음 (최상위 본부)' }, ...divisions];
  }, [departments]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [form] = Form.useForm();

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
      console.error("폼 제출 실패:", error);
      message.error("부서 정보 저장 중 오류가 발생했습니다.");
    }
  };

  // ✅ 완전삭제 (이중 안전장치)
  const handlePermanentDelete = (deptId) => {
    const hasChildren = departments.some(d => d.parentDeptId === deptId);
    if (hasChildren) {
      Modal.warning({
        title: '삭제 불가',
        content: (
          <>
            하위 부서(팀)가 존재하여 삭제할 수 없습니다.<br />
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
                  해당 부서에 연결된 하위 부서 또는 직원이 존재합니다.<br />
                  모든 하위 데이터를 정리한 후 다시 시도해주세요.
                </>
              ),
              okText: '확인',
            });
          } else {
            console.error("부서 삭제 중 오류 발생:", error);
            message.error("부서를 삭제하는 중 문제가 발생했습니다.");
          }
        }
      },
    });
  };

  // ✅ 테이블 컬럼
  const columns = [
    { title: '부서 코드', dataIndex: 'deptCode', key: 'deptCode' },
    { title: '부서명', dataIndex: 'deptName', key: 'deptName' },
    { title: '상위 부서', dataIndex: 'parentDeptName', key: 'parentDeptName', render: name => name || '-' },
    {
      title: '사용 여부',
      dataIndex: 'isUsed',
      key: 'isUsed',
      render: isUsed => (
        <Tag color={isUsed === 'Y' ? 'blue' : 'default'}>
          {isUsed === 'Y' ? '사용' : '비활성'}
        </Tag>
      )
    },
    {
      title: '작업',
      key: 'action',
      render: (_, record) => (
        <span>
          <Button type="link" onClick={() => showEditModal(record)}>수정 / 비활성화</Button>
          <Button type="link" danger onClick={() => handlePermanentDelete(record.deptId)}>완전삭제</Button>
        </span>
      ),
    },
  ];

  if (loading) return <Spin tip="부서 목록을 불러오는 중입니다..." />;

  return (
    <Card>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>부서 관리</Title>
        <Button type="primary" onClick={showAddModal}>신규 부서 추가</Button>
      </div>

      <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="부서명 또는 코드로 검색" />
      <Table dataSource={filteredData} columns={columns} rowKey="deptId" />

      {/* ✅ 생성 / 수정 모달 */}
      <Modal
        title={editingDept ? "이름변경 / 비활성화 / 상위부서변경" : "신규 부서 생성"}
        open={isModalVisible}
        onOk={handleFormSubmit}
        onCancel={handleCancel}
        okText="저장"
        cancelText="취소"
      >
        <Form form={form} layout="vertical">
          {/* 🔹 신규/수정 모두에서 상위부서 변경 가능 */}
          <Form.Item name="parentDeptId" label="상위 부서">
            <Select placeholder="상위 부서를 선택하세요">
              {parentDepartmentOptions
                .filter(opt => opt.deptId !== editingDept?.deptId) // 자기 자신은 제외
                .map(dept => (
                  <Select.Option key={dept.deptId} value={dept.deptId}>
                    {dept.deptName}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item name="deptName" label="부서명" rules={[{ required: true, message: '부서명을 입력해주세요.' }]}>
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
        </Form>
      </Modal>
    </Card>
  );
};

export default DepartmentAdminPage;
