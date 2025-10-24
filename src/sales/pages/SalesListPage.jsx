import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
  message,
  Card,
  Spin,
  Button,
  Space,
  Modal,
  Input, 
  Row,
  Col,
  Select,
  Pagination,
  Tag,
  DatePicker, 
} from "antd";
import { PlusOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import dayjs from "dayjs";
import MainLayout from "../../layouts/MainLayout";
import {
  fetchSales,
  deleteSales,
  deleteMultipleSales,
  setSelectedKeys,
  setSearchParam, 
  clearSalesError,
} from "../slice/salesSlice"; 
import SalesModal from "../components/SalesModal";
import { getHistory } from '../../api/historyApi';


const { Option } = Select;
const { RangePicker } = DatePicker;

const SalesListPage = () => {
  const dispatch = useDispatch();

  const {
    list: sales,
    pagination,
    loading,
    pagination: salesPagination,
    searchParams: salesSearchParams, 
    selectedKeys: selectedSalesKeys,
    loading: salesLoading,
    error: salesError,
  } = useSelector((state) => state.sales); 

  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [editingSales, setEditingSales] = useState(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingSalesId, setDeletingSalesId] = useState(null);
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [filterType, setFilterType] = useState("text"); // 기본검색, 주문번호, 판매일자, 판매금액 등
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const loadSales = (
    page = salesPagination?.current || 1,
    size = salesPagination?.pageSize || 10,
    overrideParams = null // 검색 핸들러에서 새 파라미터를 강제 주입할 때 사용
  ) => {
    // overrideParams가 있으면 그것을, 없으면 Redux의 현재 searchParams를 사용
    const params = overrideParams ?? salesSearchParams;
    dispatch(fetchSales({ page, size, ...params }));
  };

  useEffect(() => {
    // 🔸 첫 로드 시 Redux의 기본 searchParams와 함께 1페이지 조회
    loadSales(1, salesPagination?.pageSize || 10, salesSearchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (salesError) {
      message.error(salesError.message || "매출 목록 작업 중 오류가 발생했습니다.");
      // dispatch(clearSalesError());
    }
  }, [salesError, dispatch]);

  const handlePaginationChange = (page, pageSize) => {
    loadSales(page, pageSize); 
  };


  const showSalesModal = (row = null) => {
    setEditingSales(row);
    setIsSalesModalOpen(true);
  };
  const handleSalesModalClose = () => {
    setIsSalesModalOpen(false);
    setEditingSales(null);
  };


  const showDeleteConfirmModal = (salesId = null) => {
    if (salesId) {
      setDeletingSalesId(salesId);
      setIsDeletingMultiple(false);
    } else {
      setDeletingSalesId(null);
      setIsDeletingMultiple(true);
    }
    setIsDeleteConfirmOpen(true);
  };
  const handleDeleteConfirmClose = () => {
    setIsDeleteConfirmOpen(false);
    setDeletingSalesId(null);
    setIsDeletingMultiple(false);
    setIsDeleting(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (isDeletingMultiple) {
        await dispatch(deleteMultipleSales(selectedSalesKeys)).unwrap();
        message.success("선택된 매출이 삭제되었습니다.");
      } else if (deletingSalesId) {
        await dispatch(deleteSales(deletingSalesId)).unwrap();
        message.success("삭제되었습니다.");
      }
      loadSales(); // 🔸 현재 페이지/필터 기준으로 새로고침
      handleDeleteConfirmClose();
    } catch (err) {
      message.error(err?.message || "삭제 처리 중 오류가 발생했습니다.");
      setIsDeleting(false);
    }
  };

  // 🔸 검색 관련 핸들러 (OrderListPage에서 복사 및 수정)
  const handleSearchParamChange = (key, value) => {
    dispatch(setSearchParam({ [key]: value }));
  };

  const handleSingleDateChange = (date, dateString) => {
    dispatch(setSearchParam({ startDate: dateString || null, endDate: null }));
  };

  const handleDateRangeChange = (dates, dateStrings) => {
    dispatch(setSearchParam({
      startDate: dateStrings?.[0] || null,
      endDate: dateStrings?.[1] || null,
    }));
  };

  // 🔸 검색 타입 변경 시, 관련 없는 Redux 파라미터들 초기화
  const handleFilterTypeChange = (value) => {
    setFilterType(value);
    
    // 금액(로컬) 초기화
    if (value !== "amount") { setMinAmount(""); setMaxAmount(""); }

    // Redux 파라미터 초기화
    if (value === "text") {
        dispatch(setSearchParam({ startDate: null, endDate: null, minAmount: null, maxAmount: null, orderId: null, invoiceIssued: null }));
    } else if (value === "date-single" || value === "date-range") {
        dispatch(setSearchParam({ keyword: "", minAmount: null, maxAmount: null, orderId: null, invoiceIssued: null }));
    } else if (value === "amount") {
        dispatch(setSearchParam({ keyword: "", startDate: null, endDate: null, orderId: null, invoiceIssued: null }));
    } else if (value === "orderId") {
        dispatch(setSearchParam({ keyword: "", startDate: null, endDate: null, minAmount: null, maxAmount: null, invoiceIssued: null }));
    } else if (value === "invoiceIssued") {
        // '전체'(null)로 기본 세팅
        dispatch(setSearchParam({ keyword: "", startDate: null, endDate: null, minAmount: null, maxAmount: null, orderId: null, invoiceIssued: null }));
    }
  };

  // 🔸 검색 실행
  const handleSearch = () => {
    const payload = { ...salesSearchParams };

    // 🔸 현재 filterType에 해당하지 않는 파라미터들을 null로 초기화
    if (filterType === "text") {
        payload.startDate = null; payload.endDate = null; payload.minAmount = null; payload.maxAmount = null; payload.orderId = null; payload.invoiceIssued = null;
    } else if (filterType === "date-single" || filterType === "date-range") {
        payload.keyword = ""; payload.minAmount = null; payload.maxAmount = null; payload.orderId = null; payload.invoiceIssued = null;
    } else if (filterType === "amount") {
        payload.keyword = ""; payload.startDate = null; payload.endDate = null; payload.orderId = null; payload.invoiceIssued = null;
        // 로컬 state의 금액 값을 payload에 반영
        payload.minAmount = minAmount || null; 
        payload.maxAmount = maxAmount || null;
    } else if (filterType === "orderId") {
        payload.keyword = ""; payload.startDate = null; payload.endDate = null; payload.minAmount = null; payload.maxAmount = null; payload.invoiceIssued = null;
    } else if (filterType === "invoiceIssued") {
        payload.keyword = ""; payload.startDate = null; payload.endDate = null; payload.minAmount = null; payload.maxAmount = null; payload.orderId = null;
    }

    dispatch(setSearchParam(payload)); // 🔸 정리된 파라미터를 Redux에 저장
    loadSales(1, salesPagination?.pageSize || 10, payload); // 🔸 1페이지부터 검색
  };

  // 🔸 초기화
  const handleReset = () => {
    setFilterType("text");
    setMinAmount("");
    setMaxAmount("");
    const resetPayload = {
      search: "client", // 기본 검색 타입
      keyword: "",
      startDate: null,
      endDate: null,
      minAmount: null,
      maxAmount: null,
      orderId: null,       // 🔸 추가
      invoiceIssued: null, // 🔸 추가
    };
    dispatch(setSearchParam(resetPayload));
    loadSales(1, salesPagination?.pageSize || 10, resetPayload);
  };
  // 🔸 ... 여기까지 검색 핸들러

  const rowSelection = {
    selectedRowKeys: selectedSalesKeys,
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
    {
      title: "판매번호",
      dataIndex: "salesId",
      key: "salesId",
      align: "center",
      width: "5%",
      render: (text, record) => (
        <Button type="link" onClick={() => showSalesModal(record)} style={{ padding: 0 }}>
          {text}
        </Button>
      ),
    },
    {
      title: "판매일자",
      dataIndex: "salesDate",
      key: "salesDate_formatted", // 🔸 key 중복 방지를 위해 수정
      align: "center",
      render: (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "-"),
    },
    { title: "거래처명", dataIndex: "clientCompany", key: "clientCompany", align: "center" },
    { title: "프로젝트명", dataIndex: "projectName", key: "projectName", align: "center" },
    {
      title: "출시일",
      dataIndex: "deploymentDate",
      key: "deploymentDate",
      align: "center",
      render: (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "판매금액",
      dataIndex: "salesAmount",
      key: "salesAmount",
      align: "center",
      render: (amount) => 
        (amount != null 
          ? `${Math.trunc(Number(amount)).toLocaleString("ko-KR")} 원` 
          : "-"),
    },
    {
      title: "계산서",
      dataIndex: "invoiceIssued",
      key: "invoiceIssued",
      align: "center",
      render: (issued) => <Tag color={issued ? "green" : "default"}>{issued ? "발행" : "미발행"}</Tag>,
    },
    { title: "담당자", dataIndex: "writer", key: "writer", align: "center" },
    {
      title: " ",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Button size="small" danger onClick={() => showDeleteConfirmModal(record.salesId)}>
          삭제
        </Button>
      ),
    },
  ];

  const hasSelected = selectedSalesKeys && selectedSalesKeys.length > 0;

  return (
    <MainLayout>
      <h2 style={{ fontSize: 24, marginBottom: 20 }}>판매 관리</h2>

      {/* 🔸 검색 UI로 교체 */}
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
                <Option value="orderId">주문번호</Option>
                <Option value="invoiceIssued">계산서</Option>
                <Option value="date-single">판매일자</Option>
                <Option value="date-range">판매기간</Option>
                <Option value="amount">판매금액</Option>
              </Select>

              {/* 🔸 기본검색 (search + keyword) */}
              {filterType === "text" && (
                <>
                  <Select
                    value={salesSearchParams.search}
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
                    value={salesSearchParams.keyword || ""}
                    onChange={(e) => handleSearchParamChange('keyword', e.target.value)}
                    onPressEnter={handleSearch}
                  />
                </>
              )}

              {/* 🔸 주문번호 검색 */}
              {filterType === "orderId" && (
                 <Input
                    placeholder="주문번호(ID)를 입력하세요."
                    style={{ width: 240 }}
                    value={salesSearchParams.orderId || ""}
                    onChange={(e) => handleSearchParamChange('orderId', e.target.value)}
                    onPressEnter={handleSearch}
                  />
              )}

              {/* 🔸 계산서 발행여부 검색 */}
              {filterType === "invoiceIssued" && (
                 <Select
                    value={salesSearchParams.invoiceIssued}
                    style={{ width: 120 }}
                    onChange={(value) => handleSearchParamChange('invoiceIssued', value)}
                  >
                    <Option value={null}>전체</Option>
                    <Option value={true}>발행</Option>
                    <Option value={false}>미발행</Option>
                  </Select>
              )}

              {/* 🔸 단일 판매일자 */}
              {filterType === "date-single" && (
                <DatePicker
                  placeholder="판매일자 선택"
                  value={salesSearchParams.startDate ? dayjs(salesSearchParams.startDate) : null}
                  onChange={handleSingleDateChange}
                />
              )}

              {/* 🔸 판매 기간 */}
              {filterType === "date-range" && (
                <RangePicker
                  value={
                    salesSearchParams.startDate && salesSearchParams.endDate
                      ? [dayjs(salesSearchParams.startDate), dayjs(salesSearchParams.endDate)]
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
              <Button onClick={() => showSalesModal()} icon={<PlusOutlined />}>
                신규 매출 등록
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Spin spinning={salesLoading} tip="로딩 중...">
        <Table
          rowSelection={rowSelection}
          rowKey={(record) => record.salesId}
          dataSource={sales}
          columns={columns}
          pagination={false}
        />
        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          {sales && sales.length > 0 && (
            <Pagination
              current={salesPagination?.current || 1}
              pageSize={salesPagination?.pageSize || 10}
              total={salesPagination?.total || 0}
              onChange={handlePaginationChange}
              showSizeChanger
              pageSizeOptions={["10", "20", "50"]}
            />
          )}
        </div>
      </Spin>

      <SalesModal
        open={isSalesModalOpen}
        onClose={handleSalesModalClose}
        salesData={editingSales}
        // 🔸 모달 닫힐 때 새로고침 (현재 페이지/필터 유지)
        onRefresh={() => loadSales()}
      />

      <Modal
        title={
          <>
            <ExclamationCircleFilled style={{ color: "#faad14", marginRight: 8 }} />
            삭제 확인
          </>
        }
        open={isDeleteConfirmOpen}
        onCancel={handleDeleteConfirmClose}
        footer={[
          <Button key="cancel" onClick={handleDeleteConfirmClose} disabled={isDeleting}>
            취소
          </Button>,
          <Button key="delete" type="primary" danger loading={isDeleting} onClick={handleDelete}>
            삭제
          </Button>,
        ]}
      >
        <p>
          {isDeletingMultiple
            ? `${selectedSalesKeys.length}개의 매출을 정말로 삭제하시겠습니까?`
            : `매출번호 '${deletingSalesId}'(을)를 정말로 삭제하시겠습니까?`}
        </p>
        <p style={{ color: "grey" }}>삭제된 데이터는 복구할 수 없습니다.</p>
      </Modal>
    </MainLayout>
  );
};

export default SalesListPage;