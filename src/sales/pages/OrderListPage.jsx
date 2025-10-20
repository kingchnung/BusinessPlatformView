import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Table, message, Card, Spin, Button, Space, Modal, Input, Row, Col, Select, Pagination, Tag } from "antd";
import { fetchOrders, deleteOrder, clearOrderError } from '../slice/orderSlice';
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { PlusOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import OrderModal from "../components/OrderModal";

const { confirm } = Modal;
// const { Option } = Select; // 검색 기능 추가 시 필요

const OrderListPage = () => {
  const dispatch = useDispatch();

  const {
    list: orders, 
    pagination: orderPagination, 
    loading: orderLoading,
    error: orderError
  } = useSelector((state) => state.order); 


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);


  const loadOrders = (page = orderPagination.current, size = orderPagination.pageSize) => {
    dispatch(fetchOrders({ page, size /*, searchParams */ }));
  };

  // --- 검색 핸들러 (필요시 추가) ---
  // const handleSearchParamChange = (key, value) => { ... };
  // const handleSearch = () => { loadOrders(1, orderPagination.pageSize); };


  useEffect(() => {
    loadOrders();
  }, []);


  useEffect(() => {
    if (orderError) {
      const errorMsg = orderError.message || "주문 관련 작업 중 오류가 발생했습니다.";
      message.error(errorMsg);
      // dispatch(clearOrderError());
    }
  }, [orderError, dispatch]);


  const handlePaginationChange = (page, pageSize) => {
    loadOrders(page, pageSize);
  };


  const showModal = (order = null) => {
    setIsModalOpen(true);
    setEditingOrder(order);
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
  };


  const showDeleteConfirm = (orderId) => {
    confirm({
      title: "정말로 이 주문을 삭제하시겠습니까?",
      icon: <ExclamationCircleFilled />,
      okText: "삭제", okType: "danger", cancelText: "취소",
      async onOk() {
        try {
          await dispatch(deleteOrder(orderId)).unwrap();
          message.success("삭제되었습니다.");
          loadOrders(orderPagination.current, orderPagination.pageSize); 
        } catch (rejectedValueOrSerializedError) {
          const errorMsg = rejectedValueOrSerializedError?.message || "삭제 처리 중 오류 발생";
          message.error(errorMsg);
        }
      },
    });
  };


  const columns = [
    {
      title: "주문번호",
      dataIndex: "orderId",
      key: "orderId",
      align: "center",
      render: (text, record) => <a onClick={() => showModal(record)}>{text}</a>,
    },
    { title: "주문일", dataIndex: "orderDate", key: "orderDate", align: "center" },
    { title: "거래처명", dataIndex: "clientCompany", key: "clientCompany" },
    { title: "프로젝트명", dataIndex: "projectName", key: "projectName" },
    { title: "납기예정일", dataIndex: "orderDueDate", key: "orderDueDate", align: "center" },
    {
      title: "주문금액",
      dataIndex: "orderAmount",
      key: "orderAmount",
      align: "center",
      render: (amount) => amount ? `${amount.toLocaleString('ko-KR')} 원` : '-',
    },
    {
      title: "주문상태",
      dataIndex: "orderStatus",
      key: "orderStatus",
      align: "center",
      render: (status) => {
          let color = 'grey';
          if (status === '진행중') color = 'blue';
          else if (status === '완료') color = 'green';
          else if (status === '취소됨') color = 'red';
          return <Tag color={color}>{status || 'N/A'}</Tag>;
      }
    },
    { title: "담당자", dataIndex: "writer", key: "writer", align: "center" },
    {
      title: "선택",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Button size="small" danger onClick={() => showDeleteConfirm(record.orderId)}>삭제</Button>
      ),
    },
  ];

  return (
    <MainLayout>
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>주문 관리</h2>

      <Card style={{ marginBottom: 20 }}>
        <Row gutter={16} justify="space-between" align="middle">

          <Col>
            <Space>
              <Select defaultValue="All" style={{ width: 150 }}>...</Select>
              <Input placeholder="검색어를 입력해주세요." />
              <Button type="primary">검색</Button>
            </Space>
          </Col>

          <Col>
            <Button onClick={() => showModal()} icon={<PlusOutlined />}>
              신규 주문 등록
            </Button>
          </Col>
        </Row>
      </Card>

      <Spin spinning={orderLoading} tip="로딩 중...">
        <Table
          rowKey={(record) => record.orderId}
          dataSource={orders}
          columns={columns}
          pagination={false} 
        />

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            { orders.length > 0 && 
                <Pagination
                    current={orderPagination.current}
                    pageSize={orderPagination.pageSize}
                    total={orderPagination.total}
                    onChange={handlePaginationChange}
                />
             }
        </div>
      </Spin>

      <OrderModal
        open={isModalOpen}
        onClose={handleModalClose}
        orderData={editingOrder}
        onRefresh={() => loadOrders(orderPagination.current, orderPagination.pageSize)} // 현재 페이지 리로드
      />
    </MainLayout>
  );
};

export default OrderListPage;