import React, { useEffect, useState } from "react";
import { Table, message, Card, Spin, Button, Space, Modal, Input, Row, Col, Select } from "antd";
import { getClientList, removeClient, removeClients } from "../../api/sales/clientApi";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { PlusOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import ClientModal from "../components/ClientModal";

const { confirm } = Modal;
const { Option } = Select;

const ClientListPage = () => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchParams, setSearchParams] = useState({ search: "clientCompany", keyword: "" });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null); // 수정할 데이터를 담을 state

  const navigate = useNavigate();

  const loadClients = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const res = await getClientList(page, size, searchParams.search, searchParams.keyword);
      if (res && res.dtoList) {
        setClients(res.dtoList);
        setPagination({
          current: res.pageRequestDTO.page,
          pageSize: res.pageRequestDTO.size,
          total: res.totalCount,
        });
      }
    } catch (error) {
      message.error("거래처 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadClients(1, pagination.pageSize); 
  }

  useEffect(() => {
    loadClients();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTableChange = (paginationConfig) => {
    loadClients(paginationConfig.current, paginationConfig.pageSize);
  };
  
  const showModal = (client = null) => {
    const token = localStorage.getItem("token");
    if (!token) {
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
        await removeClient(clientNo);
        message.success("삭제되었습니다.");
        loadClients(pagination.current, pagination.pageSize);
      },
    });
  };

  const handleDeleteSelected = () => {
    confirm({
      title: `${selectedRowKeys.length}개의 거래처를 정말로 삭제하시겠습니까?`,
      icon: <ExclamationCircleFilled />,
      okText: "삭제", okType: "danger", cancelText: "취소",
      async onOk() {
        try {
          await removeClients(selectedRowKeys); 
          message.success("선택된 거래처들이 삭제되었습니다.");
          setSelectedRowKeys([]);
          loadClients();
        } catch (error) {
          message.error("삭제 처리 중 오류가 발생했습니다.");
        }
      },
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => {
      setSelectedRowKeys(keys);
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
      title: "관리",
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

  const hasSelected = selectedRowKeys.length > 0;

  return (
    <MainLayout>
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>거래처 관리</h2>

      <Card style={{ marginBottom: 20 }}>
        <Row gutter={16} justify="space-between" align="middle">
          <Col>
            <Space>
              <Select 
                defaultValue="clientCompany" 
                style={{ width: 150 }}
                onChange={(value) => setSearchParams({...searchParams, search: value})}
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
                value={searchParams.keyword}
                onChange={(e) => setSearchParams({...searchParams, keyword: e.target.value})}
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

      <Spin spinning={loading} tip="로딩 중...">
        <Table
          rowSelection={rowSelection}
          rowKey={(record) => record.clientNo}
          dataSource={clients}
          columns={columns}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Spin>

      <ClientModal 
        open={isModalOpen}
        onClose={handleModalClose}
        clientData={editingClient}
        onRefresh={() => loadClients(pagination.current, pagination.pageSize)}
      />
    </MainLayout>
  );
};

export default ClientListPage;