import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Table, message, Card, Spin, Button, Space, Modal, Input, Row, Col, Select, Pagination } from "antd";
import {
  fetchClients,
  deleteClient,
  deleteMultipleClients,
  setSearchParam,
  setSelectedKeys,
  clearClientError
} from '../slice/clientSlice';
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { PlusOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import ClientModal from "../components/ClientModal";

const { confirm } = Modal;
const { Option } = Select;

const ClientListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    list: clients, 
    pagination: clientPagination,
    searchParams: clientSearchParams,
    selectedKeys: selectedClientKeys,
    loading: clientLoading,
    error: clientError
  } = useSelector((state) => state.client); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const loadClients = (page = clientPagination.current, size = clientPagination.pageSize) => {
    dispatch(fetchClients({ page, size, search: clientSearchParams.search, keyword: clientSearchParams.keyword }));
  };

  const handleSearchParamChange = (key, value) => {
    dispatch(setSearchParam({ [key]: value }));
  };

  const handleSearch = () => {
    loadClients(1, clientPagination.pageSize); // 항상 1페이지부터 검색
  };

5
  useEffect(() => {
    loadClients();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // dispatch는 의존성 배열에 추가하지 않아도 됨

  useEffect(() => {
    if (clientError) {
      const errorMsg = clientError.message || "거래처 관련 작업 중 오류가 발생했습니다.";
      message.error(errorMsg);
      // dispatch(clearClientError());
    }
  }, [clientError]);
const handlePaginationChange = (page, pageSize) => {
    loadClients(page, pageSize);
  };


  const showModal = (client = null) => {
    const token = localStorage.getItem("token");
    if (!token && !client) {
      message.warning("로그인이 필요한 기능입니다.");
      navigate("/login");
      return;
    }
    setIsModalOpen(true);
    setEditingClient(client);
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const showDeleteConfirm = (clientNo) => {
    confirm({
      title: "정말로 이 거래처를 삭제하시겠습니까?",
      icon: <ExclamationCircleFilled />,
      okText: "삭제", okType: "danger", cancelText: "취소",
      async onOk() {
        try {
          // unwrap()을 사용하면 Thunk 성공/실패 시 추가 로직 실행 가능
          await dispatch(deleteClient(clientNo)).unwrap();
          message.success("삭제되었습니다.");
          loadClients();
        } catch (rejectedValueOrSerializedError) {
          const errorMsg = rejectedValueOrSerializedError?.message || "삭제 처리 중 오류 발생";
          message.error(errorMsg);
        }
      },
    });
  };

  const handleDeleteSelected = () => {
    confirm({
      title: `${selectedClientKeys.length}개의 거래처를 정말로 삭제하시겠습니까?`,
      icon: <ExclamationCircleFilled />,
      okText: "삭제", okType: "danger", cancelText: "취소",
      async onOk() {
        try {
          await dispatch(deleteMultipleClients(selectedClientKeys)).unwrap();
          message.success("선택된 거래처들이 삭제되었습니다.");
          loadClients();
        } catch (rejectedValueOrSerializedError) {
          const errorMsg = rejectedValueOrSerializedError?.message || "선택 삭제 처리 중 오류 발생";
          message.error(errorMsg);
        }
      },
    });
  };

  const rowSelection = {
    selectedRowKeys: selectedClientKeys, 
    onChange: (keys) => {
      dispatch(setSelectedKeys(keys));
    },
  };

  const columns = [
    { title: "사업자번호", dataIndex: "clientId", key: "clientId", align: "center", width: "15%" },
    {
      title: "거래처명",
      dataIndex: "clientCompany",
      key: "clientCompany",
      render: (text, record) => (
        <a onClick={() => showModal(record)}>
          {text}
        </a>
      )
    },
    { title: "대표자", dataIndex: "clientCeo", key: "clientCeo", align: "center", width: "10%" },
    { title: "연락처", dataIndex: "clientContact", key: "clientContact", align: "center", width: "15%" },
    { title: "담당자", dataIndex: "writer", key: "writer", align: "center", width: "10%" },
    {
      title: "선택",
      key: "actions", align: "center", width: "10%",
      render: (_, record) => (
          <Button
            size="small"
            danger
            onClick={() => showDeleteConfirm(record.clientNo)}
          >
            삭제
          </Button>
      ),
    },
  ];

  const hasSelected = selectedClientKeys.length > 0;

  return (
    <MainLayout>
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>거래처 관리</h2>

      <Card style={{ marginBottom: 20 }}>
        <Row gutter={16} justify="space-between" align="middle">
          <Col>
            <Space>
              <Select
                value={clientSearchParams.search} // Redux 상태 사용
                style={{ width: 150 }}
                onChange={(value) => handleSearchParamChange('search', value)} // 핸들러 사용
              >
                <Option value="clientCompany">거래처명</Option>
                <Option value="clientId">사업자번호</Option>
                <Option value="clientCeo">대표자</Option>
                <Option value="clientBusinessType">업종</Option>
                <Option value="userId">담당자 사원번호</Option>
              </Select>
              <Input
                placeholder="검색어를 입력해주세요"
                style={{width: 300}}
                value={clientSearchParams.keyword} 
                onChange={(e) => handleSearchParamChange('keyword', e.target.value)} 
                onPressEnter={handleSearch}
              />
              <Button type="primary" onClick={handleSearch}>검색</Button>
            </Space>
          </Col>

          <Col>
            <Space>
              <Button danger onClick={handleDeleteSelected} disabled={!hasSelected}>
                선택 삭제
              </Button>
              <Button onClick={() => showModal()} icon={<PlusOutlined />}>
                신규 등록
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Spin spinning={clientLoading} tip="로딩 중...">
        <Table
          rowSelection={rowSelection}
          rowKey={(record) => record.clientNo}
          dataSource={clients}
          columns={columns}
          pagination={false} 
        />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <Pagination
                current={clientPagination.current}
                pageSize={clientPagination.pageSize}
                total={clientPagination.total}
                onChange={handlePaginationChange}
                // showSizeChanger // 페이지 당 항목 수 변경 가능하도록
                // pageSizeOptions={['10', '20', '50']} // 페이지 당 항목 수 옵션
            />
        </div>
      </Spin>

      <ClientModal
        open={isModalOpen}
        onClose={handleModalClose}
        clientData={editingClient}
        onRefresh={() => loadClients()}
      />
    </MainLayout>
  );
};

export default ClientListPage;