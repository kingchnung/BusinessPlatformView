import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Spin, Typography, message, Tag } from 'antd';
import axiosInstance from '../../common/axiosInstance';
import { useSearch } from '../../hr/hooks/useSearch';
import SearchInput from '../../hr/hrcommon/SearchInput';

const { Title } = Typography;

const PositionAdminPage = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();
  const { searchTerm, setSearchTerm, filteredData } = useSearch(positions, ['positionName', 'description']);

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/positions');
      setPositions(res.data || []);
    } catch (error) {
      console.error('직위 목록 로드 실패:', error);
      message.error('직위 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const showAddModal = () => {
    setEditingPosition(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (position) => {
    setEditingPosition(position);
    form.setFieldsValue(position);
    setIsModalVisible(true);
  };

  const handleCancel = () => setIsModalVisible(false);

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingPosition) {
        await axiosInstance.put(`/positions/${editingPosition.positionId}`, values);
        message.success('직위 정보가 수정되었습니다.');
      } else {
        await axiosInstance.post('/positions', values);
        message.success('신규 직위가 등록되었습니다.');
      }

      setIsModalVisible(false);
      fetchPositions();
    } catch (error) {
      console.error('직위 저장 오류:', error);
      message.error('직위 저장 중 문제가 발생했습니다.');
    }
  };

  const handleDelete = (id) => {
    modal.confirm({
      title: '정말로 이 직위를 삭제하시겠습니까?',
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        try {
          await axiosInstance.delete(`/positions/${id}`);
          message.success('직위가 삭제되었습니다.');
          fetchPositions();
        } catch (error) {
          console.error('삭제 오류:', error);
          message.error('직위 삭제 중 오류가 발생했습니다.');
        }
      },
    });
  };

  const columns = [
    { title: '직위명', dataIndex: 'positionName', key: 'positionName' },
    { title: '설명', dataIndex: 'description', key: 'description' },
    {
      title: '사용여부',
      dataIndex: 'isUsed',
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
          <Button type="link" danger onClick={() => handleDelete(record.positionId)}>삭제</Button>
        </span>
      ),
    },
  ];

  if (loading) return <Spin tip="직위 목록을 불러오는 중입니다..." />;

  return (
    <Card>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4}>직위 관리</Title>
        <Button type="primary" onClick={showAddModal}>신규 직위 추가</Button>
      </div>
      <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="직위명 또는 설명으로 검색" />
      <Table dataSource={filteredData} columns={columns} rowKey="positionId" />

      <Modal
        title={editingPosition ? '직위 수정' : '신규 직위 등록'}
        open={isModalVisible}
        onOk={handleFormSubmit}
        onCancel={handleCancel}
        okText="저장"
        cancelText="취소"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="positionName" label="직위명" rules={[{ required: true, message: '직위명을 입력해주세요.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="설명">
            <Input.TextArea rows={3} placeholder="직위에 대한 설명을 입력하세요." />
          </Form.Item>
          <Form.Item name="isUsed" label="사용여부" rules={[{ required: true }]}>
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

export default PositionAdminPage;
