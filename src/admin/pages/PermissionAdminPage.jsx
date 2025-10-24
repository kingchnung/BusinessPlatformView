import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Spin, Typography, message, Tag } from 'antd';
import axiosInstance from '../../common/axiosInstance';
import { useSearch } from '../../hr/hooks/useSearch';
import SearchInput from '../../hr/hrcommon/SearchInput';

const { Title } = Typography;

const PermissionAdminPage = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();
  const { searchTerm, setSearchTerm, filteredData } = useSearch(permissions, ['permName', 'permId', 'description']);
  

  // ✅ 전체 권한 목록 조회
  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/permissions');
      setPermissions(res.data || []);
    } catch (error) {
      console.error('권한 목록 불러오기 실패:', error);
      message.error('권한 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // ✅ 신규 등록 모달 열기
  const showAddModal = () => {
    setEditingPermission(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // ✅ 수정 모달 열기
  const showEditModal = (permission) => {
    setEditingPermission(permission);
    form.setFieldsValue(permission);
    setIsModalVisible(true);
  };

  const handleCancel = () => setIsModalVisible(false);

  // ✅ 생성 / 수정 처리
  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingPermission) {
        await axiosInstance.put(`/permissions/${editingPermission.permissionId}`, values);
        message.success('권한 정보가 수정되었습니다.');
      } else {
        await axiosInstance.post('/permissions', values);
        message.success('신규 권한이 등록되었습니다.');
      }

      setIsModalVisible(false);
      fetchPermissions();
    } catch (error) {
      console.error('권한 저장 오류:', error);
      message.error('권한 저장 중 문제가 발생했습니다.');
    }
  };

  // ✅ 삭제 처리
  const handleDeactivate = (id) => {
  modal.confirm({
    title: '이 권한을 비활성화하시겠습니까?',
    content: '비활성화된 권한은 시스템에서 더 이상 사용되지 않지만 복구할 수 있습니다.',
    okText: '비활성화',
    okType: 'danger',
    cancelText: '취소',
    onOk: async () => {
      try {
        await axiosInstance.put(`/permissions/${id}`, { isUsed: 'N' });
        message.success('권한이 비활성화되었습니다.');
        fetchPermissions();
      } catch (error) {
        console.error('비활성화 중 오류:', error);
        message.error('권한 비활성화 중 문제가 발생했습니다.');
      }
    },
  });
};

  // ✅ 테이블 컬럼 정의
  const columns = [
    { title: '권한명', dataIndex: 'permName', key: 'permName' },
    { title: '권한 코드', dataIndex: 'permId', key: 'permId' },
    { title: '설명', dataIndex: 'description', key: 'description' },
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
      render: (_, record) => (
        <span>
          <Button type="link" onClick={() => showEditModal(record)}>수정</Button>
          <Button type="link" danger onClick={() => handleDeactivate(record.permissionId)}>삭제</Button>
        </span>
      ),
    },
  ];

  if (loading) return <Spin tip="권한 목록을 불러오는 중입니다..." />;

  return (
    <Card>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4}>권한 관리</Title>
        <Button type="primary" onClick={showAddModal}>신규 권한 추가</Button>
      </div>
      <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="권한명, 코드, 설명으로 검색" />

      <Table dataSource={filteredData} columns={columns} rowKey="permissionId" />

      {/* ✅ 생성/수정 모달 */}
      <Modal
        title={editingPermission ? '권한 수정' : '신규 권한 등록'}
        open={isModalVisible}
        onOk={handleFormSubmit}
        onCancel={handleCancel}
        okText="저장"
        cancelText="취소"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="permName" label="권한명" rules={[{ required: true, message: '권한명을 입력해주세요.' }]}>
            <Input placeholder="예: emp:read, data:write:all" />
          </Form.Item>
          <Form.Item name="description" label="설명">
            <Input.TextArea rows={3} placeholder="권한에 대한 설명을 입력하세요." />
          </Form.Item>
          <Form.Item name="isUsed" label="사용 여부" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Y">사용</Select.Option>
              <Select.Option value="N">비활성</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PermissionAdminPage;
