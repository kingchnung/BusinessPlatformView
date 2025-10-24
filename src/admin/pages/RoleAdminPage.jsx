import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Spin, Typography, message, Tag } from 'antd';
import axiosInstance from '../../common/axiosInstance';
import { useSearch } from '../../hr/hooks/useSearch';
import SearchInput from '../../hr/hrcommon/SearchInput';

const { Title } = Typography;
const { Option } = Select;

const RoleAdminPage = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();
  const rolesWithFlattenedPerms = roles.map(role => ({
  ...role,
  permissionNames: role.permissions?.map(p => p.permName).join(', ') || ''
    }));
    const { searchTerm, setSearchTerm, filteredData } = useSearch(rolesWithFlattenedPerms, ['roleName', 'description', 'permissionNames']);

  // ✅ 전체 역할 목록 조회
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/roles');
      setRoles(res.data || []);
    } catch (error) {
      console.error('역할 목록 불러오기 실패:', error);
      message.error('역할 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ 전체 권한 목록 조회 (권한 매핑용)
  const fetchPermissions = async () => {
    try {
      const res = await axiosInstance.get('/permissions');
      setPermissions(res.data || []);
    } catch (error) {
      console.error('권한 목록 로드 실패:', error);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  // ✅ 신규 생성 모달
  const showAddModal = () => {
    setEditingRole(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // ✅ 수정 모달
  const showEditModal = (role) => {
    setEditingRole(role);
    form.setFieldsValue({
      roleName: role.roleName,
      description: role.description,
      isUsed: role.isUsed,
      permissionIds: role.permissions?.map(p => p.permId) || [],
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => setIsModalVisible(false);

  // ✅ 생성 / 수정
  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        roleName: values.roleName,
        description: values.description,
        isUsed: values.isUsed,
        permissionIds: values.permissionIds || [],
      };

      if (editingRole) {
        await axiosInstance.put(`/roles/${editingRole.roleId}`, payload);
        message.success('역할 정보가 수정되었습니다.');
      } else {
        await axiosInstance.post('/roles', payload);
        message.success('신규 역할이 등록되었습니다.');
      }

      setIsModalVisible(false);
      fetchRoles();
    } catch (error) {
      console.error('역할 저장 오류:', error);
      message.error('역할 저장 중 문제가 발생했습니다.');
    }
  };

  // ✅ 삭제
  const handleDelete = (id) => {
    modal.confirm({
      title: '정말로 이 역할을 삭제하시겠습니까?',
      content: '삭제 시 해당 역할과 연결된 권한 정보가 모두 해제됩니다.',
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        try {
          await axiosInstance.delete(`/roles/${id}`);
          message.success('역할이 삭제되었습니다.');
          fetchRoles();
        } catch (error) {
          console.error('삭제 오류:', error);
          message.error('역할 삭제 중 문제가 발생했습니다.');
        }
      },
    });
  };

  // ✅ 테이블 컬럼
  const columns = [
    { title: '역할명', dataIndex: 'roleName', key: 'roleName' },
    { title: '설명', dataIndex: 'description', key: 'description' },
    {
      title: '사용 여부',
      dataIndex: 'isUsed',
      render: (isUsed) => (
        <Tag color={isUsed === 'Y' ? 'blue' : 'default'}>
          {isUsed === 'Y' ? '사용' : '비활성'}
        </Tag>
      ),
    },
    {
      title: '권한 목록',
      dataIndex: 'permissions',
      render: (perms) =>
        perms && perms.length > 0
          ? perms.map((p) => <Tag key={p.permId}>{p.permName}</Tag>)
          : '-',
    },
    {
      title: '작업',
      key: 'action',
      render: (_, record) => (
        <span>
          <Button type="link" onClick={() => showEditModal(record)}>수정</Button>
          <Button type="link" danger onClick={() => handleDelete(record.roleId)}>삭제</Button>
        </span>
      ),
    },
  ];

  if (loading) return <Spin tip="역할 목록을 불러오는 중입니다..." />;

  return (
    <Card>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4}>역할 관리</Title>
        <Button type="primary" onClick={showAddModal}>신규 역할 추가</Button>
      </div>
      <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="역할명, 설명, 권한명으로 검색" />

      <Table dataSource={filteredData} columns={columns} rowKey="roleId" />

      {/* ✅ 생성/수정 모달 */}
      <Modal
        title={editingRole ? '역할 수정' : '신규 역할 등록'}
        open={isModalVisible}
        onOk={handleFormSubmit}
        onCancel={handleCancel}
        okText="저장"
        cancelText="취소"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="roleName" label="역할명" rules={[{ required: true, message: '역할명을 입력해주세요.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="설명">
            <Input.TextArea rows={3} placeholder="역할에 대한 설명을 입력하세요." />
          </Form.Item>
          <Form.Item name="isUsed" label="사용 여부" rules={[{ required: true }]}>
            <Select>
              <Option value="Y">사용</Option>
              <Option value="N">비활성</Option>
            </Select>
          </Form.Item>

          {/* ✅ 권한 매핑 멀티 선택 */}
          <Form.Item name="permissionIds" label="권한 목록">
            <Select
              mode="multiple"
              placeholder="역할에 부여할 권한을 선택하세요."
              allowClear
            >
              {permissions.map((perm) => (
                <Option key={perm.permId} value={perm.permId}>
                  {perm.permName} ({perm.permId})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default RoleAdminPage;
