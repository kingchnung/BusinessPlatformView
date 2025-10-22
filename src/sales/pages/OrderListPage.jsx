import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import {
  Table, message, Card, Spin, Button, Space, Modal,
  Input, Row, Col, Select, Pagination, Tag, DatePicker
} from "antd";
import {
  fetchOrders,
  deleteOrder,
  deleteMultipleOrders,
  clearOrderError,
  setSelectedKeys,
  setSearchParam
} from '../slice/orderSlice';
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { PlusOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import OrderModal from "../components/OrderModal";
import dayjs from 'dayjs';
import { getOrder } from "../../api/sales/orderApi";

const { Option } = Select;
const { RangePicker } = DatePicker;

const OrderListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    list: orders,
    pagination: orderPagination,
    searchParams: orderSearchParams,
    selectedKeys: selectedOrderKeys,
    loading: orderLoading,
    error: orderError
  } = useSelector((state) => state.order);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 🔸 어떤 입력 UI를 보여줄지 결정 (text | date-single | date-range | amount)
  const [filterType, setFilterType] = useState("text");

  // 🔸 금액 범위 로컬 상태 (문자 입력 → 숫자만 유지)
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  // 최신 파라미터로 호출되도록 overrideParams 지원
  const loadOrders = (
    page = 1,
    size = orderPagination?.pageSize || 10,
    overrideParams = null
  ) => {
    const params = overrideParams ?? orderSearchParams;
    dispatch(fetchOrders({ page, size, ...params }));
  };

  const handleSearchParamChange = (key, value) => {
    dispatch(setSearchParam({ [key]: value }));
  };

  // 날짜 변경 (단일)
  const handleSingleDateChange = (date, dateString) => {
    dispatch(setSearchParam({ startDate: dateString || null, endDate: null }));
  };

  // 날짜 변경 (기간)
  const handleDateRangeChange = (dates, dateStrings) => {
    dispatch(setSearchParam({
      startDate: dateStrings?.[0] || null,
      endDate: dateStrings?.[1] || null,
    }));
  };

  // 카테고리 변경 시 관련 값 정리
  const handleFilterTypeChange = (value) => {
    setFilterType(value);
    if (value === "text") {
      setMinAmount(""); setMaxAmount("");
      dispatch(setSearchParam({ startDate: null, endDate: null }));
    } else if (value === "date-single" || value === "date-range") {
      setMinAmount(""); setMaxAmount("");
      dispatch(setSearchParam({ keyword: "" }));
    } else if (value === "amount") {
      dispatch(setSearchParam({ keyword: "", startDate: null, endDate: null }));
    }
  };

  // 검색 실행 (지역 payload를 만들어 동일 객체로 set + fetch)
  const handleSearch = () => {
    const payload = { ...orderSearchParams };

    if (filterType === "text") {
      payload.startDate = null;
      payload.endDate = null;
      payload.minAmount = null;
      payload.maxAmount = null;
    }

    if (filterType === "date-single") {
      payload.minAmount = null;
      payload.maxAmount = null;
    }

    if (filterType === "date-range") {
      payload.minAmount = null;
      payload.maxAmount = null;
    }

    if (filterType === "amount") {
      payload.keyword = "";
      payload.startDate = null;
      payload.endDate = null;
      payload.minAmount = minAmount || null;
      payload.maxAmount = maxAmount || null;
    }

    dispatch(setSearchParam(payload));
    loadOrders(1, orderPagination?.pageSize || 10, payload);
  };

  // 초기화
  const handleReset = () => {
    setFilterType("text");
    setMinAmount("");
    setMaxAmount("");
    const resetPayload = {
      search: "client",
      keyword: "",
      startDate: null,
      endDate: null,
      minAmount: null,
      maxAmount: null,
    };
    dispatch(setSearchParam(resetPayload));
    loadOrders(1, orderPagination?.pageSize || 10, resetPayload);
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (orderError) {
      message.error(orderError.message || "주문 관련 작업 중 오류가 발생했습니다.");
    }
  }, [orderError, dispatch]);

  const handlePaginationChange = (page, pageSize) => {
    loadOrders(page, pageSize);
  };

  // 주문번호 클릭 → 상세 조회 → 모달 오픈
  const showOrderModal = async (order = null) => {
    if (order?.orderId) {
      try {
        const detail = await getOrder(order.orderId);
        setEditingOrder(detail);
      } catch (e) {
        message.error("주문 상세를 불러오지 못했습니다.");
        setEditingOrder(order); // 최소 정보라도 넘겨서 열기
      }
    } else {
      setEditingOrder(null);
    }
    setIsOrderModalOpen(true);
  };

  const handleOrderModalClose = () => {
    setIsOrderModalOpen(false);
    setEditingOrder(null);
  };

  const showDeleteConfirmModal = (orderId = null) => {
    if (orderId) { setDeletingOrderId(orderId); setIsDeletingMultiple(false); }
    else { setDeletingOrderId(null); setIsDeletingMultiple(true); }
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmClose = () => {
    setIsDeleteConfirmOpen(false);
    setDeletingOrderId(null);
    setIsDeletingMultiple(false);
    setIsDeleting(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (isDeletingMultiple) {
        await dispatch(deleteMultipleOrders(selectedOrderKeys)).unwrap();
        message.success("선택된 주문들이 삭제되었습니다.");
      } else if (deletingOrderId) {
        await dispatch(deleteOrder(deletingOrderId)).unwrap();
        message.success("삭제되었습니다.");
      }
      loadOrders();
      handleDeleteConfirmClose();
    } catch (error) {
      message.error(error?.message || "삭제 처리 중 오류 발생");
      setIsDeleting(false);
    }
  };

  const rowSelection = {
    selectedRowKeys: selectedOrderKeys,
    onChange: (keys) => { dispatch(setSelectedKeys(keys)); },
  };

  const columns = [
    {
      title: "주문번호",
      dataIndex: "orderId",
      key: "orderId",
      align: "center",
      width: "5%",
      render: (text, record) => (
        <Button type="link" onClick={() => showOrderModal(record)} style={{ padding: 0 }}>
          {text}
        </Button>
      )
    },
    { title: "주문일자", dataIndex: "orderDate", key: "orderDate" , align: "center", render: (date) => (date ? new Date(date).toLocaleDateString("ko-KR") : "-"),},
    { title: "거래처명", dataIndex: "clientCompany", key: "clientCompany" , align: "center"},
    { title: "프로젝트명", dataIndex: "projectName", key: "projectName", align: "center" },
    { title: "납기예정일", dataIndex: "orderDueDate", key: "orderDueDate", align: "center" },
    {
      title: "주문금액",
      dataIndex: "orderAmount",
      key: "orderAmount",
      align: "center",
      render: (amount) => amount ? `${amount.toLocaleString('ko-KR')} 원` : '-'
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
      title: " ",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Button size="small" danger onClick={() => showDeleteConfirmModal(record.orderId)}>
          삭제
        </Button>
      ),
    },
  ];

  const hasSelected = selectedOrderKeys && selectedOrderKeys.length > 0;

  return (
    <MainLayout>
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>주문 관리</h2>

      <Card style={{ marginBottom: 20 }}>
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col>
            <Space wrap>

              {/* 🔸 검색 카테고리 */}
              <Select
                value={filterType}
                style={{ width: 120 }}
                onChange={handleFilterTypeChange}
              >
                <Option value="text">기본검색</Option>
                <Option value="date-single">주문일자</Option>
                <Option value="date-range">주문기간</Option>
                <Option value="amount">주문금액</Option>
              </Select>

              {/* 🔸 기본검색 (search + keyword) */}
              {filterType === "text" && (
                <>
                  <Select
                    value={orderSearchParams.search}
                    style={{ width: 120 }}
                    onChange={(value) => handleSearchParamChange('search', value)}
                  >
                    <Option value="client">거래처명</Option>
                    <Option value="project">프로젝트명</Option>
                    <Option value="writer">담당자명</Option>
                    <Option value="item">품목명</Option>
                  </Select>

                  <Input
                    placeholder="검색어를 입력해주세요."
                    style={{ width: 240 }}
                    value={orderSearchParams.keyword || ""}
                    onChange={(e) => handleSearchParamChange('keyword', e.target.value)}
                    onPressEnter={handleSearch}
                  />
                </>
              )}

              {/* 🔸 단일 주문일자 */}
              {filterType === "date-single" && (
                <DatePicker
                  placeholder="주문일자 선택"
                  value={orderSearchParams.startDate ? dayjs(orderSearchParams.startDate) : null}
                  onChange={handleSingleDateChange}
                />
              )}

              {/* 🔸 주문 기간 */}
              {filterType === "date-range" && (
                <RangePicker
                  value={
                    orderSearchParams.startDate && orderSearchParams.endDate
                      ? [dayjs(orderSearchParams.startDate), dayjs(orderSearchParams.endDate)]
                      : null
                  }
                  onChange={handleDateRangeChange}
                />
              )}

              {/* 🔸 금액 범위 */}
              {filterType === "amount" && (
                <>
                  <Input
                    placeholder="최소금액"
                    style={{ width: 120, textAlign: 'right' }}
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value.replace(/\D/g, ""))}
                  />
                  <span>~</span>
                  <Input
                    placeholder="최대금액"
                    style={{ width: 120, textAlign: 'right' }}
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value.replace(/\D/g, ""))}
                  />
                </>
              )}

              {/* 🔘 버튼들 */}
              <Space>
                <Button type="primary" onClick={handleSearch}>검색</Button>
                <Button onClick={handleReset}>초기화</Button>
              </Space>
            </Space>
          </Col>

          <Col>
            <Space>
              <Button danger onClick={() => showDeleteConfirmModal()} disabled={!hasSelected}>
                선택 삭제
              </Button>
              <Button onClick={() => showOrderModal()} icon={<PlusOutlined />}>
                신규 주문 등록
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Spin spinning={orderLoading} tip="로딩 중...">
        <Table
          rowSelection={rowSelection}
          rowKey={(record) => record.orderId}
          dataSource={orders}
          columns={columns}
          pagination={false}
        />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          {orders && orders.length > 0 && (
            <Pagination
              current={orderPagination.current}
              pageSize={orderPagination.pageSize}
              total={orderPagination.total}
              onChange={handlePaginationChange}
            />
          )}
        </div>
      </Spin>

      <OrderModal
        open={isOrderModalOpen}
        onClose={handleOrderModalClose}
        orderData={editingOrder}
        onRefresh={() => loadOrders(orderPagination.current, orderPagination.pageSize)}
      />

      <Modal
        title={<><ExclamationCircleFilled style={{ color: '#faad14', marginRight: 8 }} /> 삭제 확인</>}
        open={isDeleteConfirmOpen}
        onCancel={handleDeleteConfirmClose}
        footer={[
          <Button key="cancel" onClick={handleDeleteConfirmClose} disabled={isDeleting}>취소</Button>,
          <Button key="delete" type="primary" danger loading={isDeleting} onClick={handleDelete}>삭제</Button>,
        ]}
      >
        <p>
          {isDeletingMultiple
            ? `${selectedOrderKeys.length}개의 주문을 정말로 삭제하시겠습니까?`
            : `주문번호 '${deletingOrderId}'(을)를 정말로 삭제하시겠습니까?`}
        </p>
        <p style={{ color: 'grey' }}>삭제된 데이터는 복구할 수 없습니다.</p>
      </Modal>
    </MainLayout>
  );
};

export default OrderListPage;
