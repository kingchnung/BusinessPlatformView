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
import { getHistory } from '../../api/historyApi';

const { confirm } = Modal;
const { Option } = Select;

const ClientListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    list: clients, 
    pagination, 
    loading,
    pagination: clientPagination,
    searchParams: clientSearchParams,
    selectedKeys: selectedClientKeys,
    loading: clientLoading,
    error: clientError
  } = useSelector((state) => state.client); 

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingClientId, setDeletingClientId] = useState(null); // 단일 삭제 대상 ID
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false); // 선택 삭제 여부
  const [isDeleting, setIsDeleting] = useState(false); // 삭제 API 로딩 상태

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
  }, [clientError, dispatch]);

const handlePaginationChange = (page, pageSize) => {
    loadClients(page, pageSize);
  };


  const showClientModal = (client = null) => {
    const token = localStorage.getItem("token");
    if (!token && !client) {
      message.warning("로그인이 필요한 기능입니다.");
      navigate("/login");
      return;
    }
    setIsClientModalOpen(true); 
    setEditingClient(client);
  };
  const handleClientModalClose = () => {
    setIsClientModalOpen(false);
    setEditingClient(null);
  };

 // --- 👇 삭제 확인 모달 열기 함수 ---
  const showDeleteConfirmModal = (clientId = null) => {
    console.log("Opening delete confirm modal. clientId:", clientId); // 로그 추가
    if (clientId) {
      // 단일 삭제
      setDeletingClientId(clientId);
      setIsDeletingMultiple(false);
    } else {
      // 선택 삭제
      setDeletingClientId(null);
      setIsDeletingMultiple(true);
    }
    setIsDeleteConfirmOpen(true); // 확인 모달 열기
  };

  // --- 👇 삭제 확인 모달 닫기 함수 ---
  const handleDeleteConfirmClose = () => {
    setIsDeleteConfirmOpen(false);
    setDeletingClientId(null);
    setIsDeletingMultiple(false);
    setIsDeleting(false); // 로딩 상태 초기화
  };

  // --- 👇 삭제 실행 함수 (확인 모달의 OK 버튼 클릭 시) ---
  const handleDelete = async () => {
    setIsDeleting(true); // 삭제 로딩 시작
    try {
      if (isDeletingMultiple) {
        // 선택 삭제
        console.log("Attempting dispatch(deleteMultipleClients)... Keys:", selectedClientKeys);
        await dispatch(deleteMultipleClients(selectedClientKeys)).unwrap();
        message.success("선택된 거래처들이 삭제되었습니다.");
      } else if (deletingClientId) {
        // 단일 삭제
        console.log("Attempting dispatch(deleteClient)... ID:", deletingClientId);
        await dispatch(deleteClient(deletingClientId)).unwrap();
        message.success("삭제되었습니다.");
      }
      loadClients(); // 성공 시 목록 새로고침 (선택 해제는 slice에서)
      handleDeleteConfirmClose(); // 확인 모달 닫기

    } catch (rejectedValueOrSerializedError) {
      console.error("Delete failed:", rejectedValueOrSerializedError);
      const errorMsg = rejectedValueOrSerializedError?.message || "삭제 처리 중 오류 발생";
      message.error(errorMsg);
      setIsDeleting(false); // 에러 시 로딩 상태 해제
      // 확인 모달은 에러 시 자동으로 닫지 않음
    }
  };

  const rowSelection = {
    selectedRowKeys: selectedClientKeys, 
    onChange: (keys) => {
      dispatch(setSelectedKeys(keys));
    },
  };

  const columns = [
    {
      title: "No",
      key: "rowNumber",
      align: "center",
      width: "60px", 
      render: (text, record, index) => {
        return (pagination.current - 1) * pagination.pageSize + index + 1;
      },
    },
    { title: "사업자번호", dataIndex: "clientId", key: "clientId", align: "center", width: "20%" },
    {
      title: "거래처명",
      dataIndex: "clientCompany",
      key: "clientCompany",
      align: "center",
      render: (text, record) => (
        <a onClick={() => showClientModal(record)}>
          {text}
        </a>
      )
    },
    { title: "대표자", dataIndex: "clientCeo", key: "clientCeo", align: "center", width: "15%" },
    { title: "연락처", dataIndex: "clientContact", key: "clientContact", align: "center", width: "20%" },
    { title: "담당자", dataIndex: "writer", key: "writer", align: "center", width: "10%" },
    {
      title: " ",
      key: "actions", align: "center", width: "10%",
      render: (_, record) => (
          <Button
            size="small"
            danger
            onClick={() => showDeleteConfirmModal(record.clientNo)}
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
              <Button danger onClick={() => showDeleteConfirmModal()} disabled={!hasSelected}>
                선택 삭제
              </Button>
              <Button onClick={() => showClientModal()} icon={<PlusOutlined />}>
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
                showSizeChanger // 페이지 당 항목 수 변경 가능하도록
                pageSizeOptions={['10', '20', '50']} // 페이지 당 항목 수 옵션
            />
        </div>
      </Spin>

      <ClientModal
        open={isClientModalOpen}
        onClose={handleClientModalClose}
        clientData={editingClient}
        onRefresh={() => loadClients(clientPagination.current, clientPagination.pageSize)} 
      />

      {/* --- 👇 삭제 확인 모달 추가 --- */}
      <Modal
        title={
          <>
            <ExclamationCircleFilled style={{ color: '#faad14', marginRight: 8 }} />
            삭제 확인
          </>
        }
        open={isDeleteConfirmOpen} // state 연결
        onCancel={handleDeleteConfirmClose} // 취소 핸들러
        footer={[
          <Button key="cancel" onClick={handleDeleteConfirmClose} disabled={isDeleting}>
            취소
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            loading={isDeleting} // 삭제 중 로딩
            onClick={handleDelete} // 삭제 실행 핸들러
          >
            삭제
          </Button>,
        ]}
      >
        <p>
          {isDeletingMultiple
            ? `${selectedClientKeys.length}개의 거래처를 정말로 삭제하시겠습니까?`
            : `거래처 '${editingClient?.clientCompany || deletingClientId}'(을)를 정말로 삭제하시겠습니까?`}
          {/* 단일 삭제 시 거래처 이름 표시 시도 (editingClient 활용 - 선택 사항) */}
        </p>
        <p style={{ color: 'grey' }}>삭제된 데이터는 복구할 수 없습니다.</p>
      </Modal>
      {/* --- 삭제 확인 모달 끝 --- */}


    </MainLayout>
  );
};

export default ClientListPage;