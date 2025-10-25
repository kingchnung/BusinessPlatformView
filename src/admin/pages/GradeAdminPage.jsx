import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Spin, Typography, message, Tag } from 'antd';
import axiosInstance from '../../common/axiosInstance';
import { useSearch } from '../../hr/hooks/useSearch';
import SearchInput from '../../hr/hrcommon/SearchInput';

const { Title } = Typography;

const GradeAdminPage = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();
  const { searchTerm, setSearchTerm, filteredData } = useSearch(grades, ['gradeName', 'gradeOrder']);



  // ✅ 전체 목록 불러오기
  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/grades');
      setGrades(res.data || []);
    } catch (error) {
      console.error('직급 목록 로드 실패:', error);
      message.error('직급 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const showAddModal = () => {
    setEditingGrade(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (grade) => {
    setEditingGrade(grade);
    form.setFieldsValue(grade);
    setIsModalVisible(true);
  };

  const handleCancel = () => setIsModalVisible(false);

  // ✅ 생성 / 수정
  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingGrade) {
        await axiosInstance.put(`/grades/${editingGrade.gradeId}`, values);
        message.success('직급 정보가 수정되었습니다.');
      } else {
        await axiosInstance.post('/grades', values);
        message.success('신규 직급이 등록되었습니다.');
      }

      setIsModalVisible(false);
      fetchGrades();
    } catch (error) {
      console.error('직급 저장 오류:', error);
      message.error('직급 저장 중 문제가 발생했습니다.');
    }
  };

  // ✅ 삭제
  const handleDelete = (id) => {
    modal.confirm({
      title: '정말로 이 직급을 삭제하시겠습니까?',
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        try {
          await axiosInstance.delete(`/grades/${id}`);
          message.success('직급이 삭제되었습니다.');
          fetchGrades();
        } catch (error) {
          console.error('삭제 오류:', error);
          message.error('직급 삭제 중 오류가 발생했습니다.');
        }
      },
    });
  };

  const columns = [
    { title: '직급명', dataIndex: 'gradeName', key: 'gradeName' },
    { title: '정렬순서', dataIndex: 'gradeOrder', key: 'gradeOrder' },
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
          <Button type="link" danger onClick={() => handleDelete(record.gradeId)}>삭제</Button>
        </span>
      ),
    },
  ];

  if (loading) return <Spin tip="직급 목록을 불러오는 중입니다..." />;

  return (
    
    
    <Card>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4}>직급 관리</Title>
        <Button type="primary" onClick={showAddModal}>신규 직급 추가</Button>
      </div>
      <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="직급명 또는 순서로 검색" />
        

      <Table dataSource={filteredData} columns={columns} rowKey="gradeId" />

      <Modal
        title={editingGrade ? '직급 수정' : '신규 직급 등록'}
        open={isModalVisible}
        onOk={handleFormSubmit}
        onCancel={handleCancel}
        okText="저장"
        cancelText="취소"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="gradeName" label="직급명" rules={[{ required: true, message: '직급명을 입력해주세요.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="gradeOrder" label="정렬순서" rules={[{ required: true, message: '정렬순서를 입력해주세요.' }]}>
            <Input type="number" />
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

export default GradeAdminPage;
