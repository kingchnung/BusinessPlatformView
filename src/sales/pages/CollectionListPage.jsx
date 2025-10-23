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
  DatePicker,
  InputNumber,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  ExclamationCircleFilled,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import MainLayout from "../../layouts/MainLayout";
import {
  fetchCollections,
  deleteCollection,
  deleteMultipleCollections,
  setSelectedKeys,
  setSearchParam,
  clearCollectionError,

} from "../slice/collectionSlice";
import { fetchReceivablesSummary } from "../slice/salesStatusSlice";
import CollectionModal from "../components/CollectionModal";
import ClientLedgerModal from "../components/ClientLedgerModal";

const { Option } = Select;
const { RangePicker } = DatePicker;


const receivablesColumns = (onClientClick) => [
  {
    title: "사업자번호",
    dataIndex: "clientId",
    key: "clientId",
    align: "center",
    width: "20%",
    render: (text, record) => (
      <Button type="link" onClick={() => onClientClick(record)}>
        {text}
      </Button>
    ),
  },
  { title: "거래처", dataIndex: "clientCompany", key: "clientCompany", align: "center" },
  {
    title: "매출액",
    dataIndex: "totalSalesAmount",
    key: "totalSalesAmount",
    align: "center",
    render: (v) => (v ? Number(v).toLocaleString("ko-KR") : "0"),
  },
  {
    title: "수금액",
    dataIndex: "totalCollectionAmount",
    key: "totalCollectionAmount",
    align: "center",
    render: (v) => (v ? Number(v).toLocaleString("ko-KR") : "0"),
  },
  {
    title: "미수금",
    dataIndex: "outstandingBalance",
    key: "outstandingBalance",
    align: "center",
    render: (v) => (v ? Number(v).toLocaleString("ko-KR") : "0"),
  },
];


const collectionListColumns = (showCollectionModal, showDeleteConfirmModal) => [
  {
    title: "수금번호",
    dataIndex: "collectionId",
    key: "collectionId",
    align: "center",
    width: "15%",
    render: (text, record) => (
      <Button
        type="link"
        onClick={() => showCollectionModal(record.collectionId)}
        style={{ padding: 0 }}
      >
        {text}
      </Button>
    ),
  },
  {
    title: "수금일자",
    dataIndex: "collectionDate",
    key: "collectionDate",
    align: "center",
    width: "12%",
    render: (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "-"),
  },
  {
    title: "거래처명",
    dataIndex: "clientCompany",
    key: "clientCompany",
    align: "center",
  },
  {
    title: "수금액",
    dataIndex: "collectionMoney",
    key: "collectionMoney",
    align: "center",
    width: "15%",
    render: (amount) =>
      amount != null ? `${Number(amount).toLocaleString("ko-KR")} 원` : "0 원",
  },
  {
    title: "담당자",
    dataIndex: "writer",
    key: "writer",
    align: "center",
    width: "10%",
  },
  {
    title: " ",
    key: "actions",
    align: "center",
    width: "10%",
    render: (_, record) => (
      <Button
        size="small"
        danger
        onClick={() => showDeleteConfirmModal(record.collectionId)}
      >
        삭제
      </Button>
    ),
  },
];

// --- 컴포넌트 시작 ---
const CollectionListPage = () => {
  const dispatch = useDispatch();

  // 🔽 1. 현재 탭 상태 변경 (기본 'list')
  const [activeTab, setActiveTab] = useState("list"); 
  
  // 🔽 2. "거래처별 요약" 탭 전용 검색 state
  const [summarySearchType, setSummarySearchType] = useState("c"); // 'c': 거래처명, 'id': 사업자번호
  const [summaryKeyword, setSummaryKeyword] = useState("");

  const receivables = useSelector((s) => s.salesStatus.receivables);
  const {
    list: collections,
    pagination: collectionPagination,
    searchParams: collectionSearchParams,
    selectedKeys: selectedCollectionKeys,
    loading: collectionLoading,
    error: collectionError,
  } = useSelector((state) => state.collection);

  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [editingCollectionId, setEditingCollectionId] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingCollectionId, setDeletingCollectionId] = useState(null);
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterType, setFilterType] = useState("text");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const loadCollections = (
    page = collectionPagination?.current || 1,
    size = collectionPagination?.pageSize || 10,
    overrideParams = null
  ) => {
    const params = overrideParams ?? collectionSearchParams;
    dispatch(fetchCollections({ page, size, ...params }));
  };

  useEffect(() => {
    loadCollections(1, collectionPagination?.pageSize || 10, collectionSearchParams);
    dispatch(fetchReceivablesSummary());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (collectionError) {
      message.error(collectionError.message || "수금 목록 작업 중 오류가 발생했습니다.");
    }
  }, [collectionError, dispatch]);

  const handlePaginationChange = (page, pageSize) => {
    loadCollections(page, pageSize);
  };
  const showCollectionModal = (collectionId = null) => {
    setEditingCollectionId(collectionId);
    setIsCollectionModalOpen(true);
  };
  const handleCollectionModalClose = () => {
    setIsCollectionModalOpen(false);
    setEditingCollectionId(null);
  };
  const handleOpenLedgerModal = (clientRecord) => {
    setSelectedClient(clientRecord);
    setIsLedgerModalOpen(true);
  };
  const handleCloseLedgerModal = () => {
    setIsLedgerModalOpen(false);
    setSelectedClient(null);
  };
  const showDeleteConfirmModal = (collectionId = null) => {
    if (collectionId) {
      setDeletingCollectionId(collectionId);
      setIsDeletingMultiple(false);
    } else {
      setDeletingCollectionId(null);
      setIsDeletingMultiple(true);
    }
    setIsDeleteConfirmOpen(true);
  };
  const handleDeleteConfirmClose = () => {
    setIsDeleteConfirmOpen(false);
    setDeletingCollectionId(null);
    setIsDeletingMultiple(false);
    setIsDeleting(false);
  };
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (isDeletingMultiple) {
        await dispatch(deleteMultipleCollections(selectedCollectionKeys)).unwrap();
        message.success("선택된 수금이 삭제되었습니다.");
      } else if (deletingCollectionId) {
        await dispatch(deleteCollection(deletingCollectionId)).unwrap();
        message.success("삭제되었습니다.");
      }
      loadCollections();
      handleDeleteConfirmClose();
    } catch (err) {
      message.error(err?.message || "삭제 처리 중 오류가 발생했습니다.");
      setIsDeleting(false);
    }
  };
  const handleSearchParamChange = (key, value) => {
    dispatch(setSearchParam({ [key]: value }));
  };
  const handleSingleDateChange = (date, dateString) => {
    dispatch(setSearchParam({ startDate: dateString || null, endDate: null }));
  };
  const handleDateRangeChange = (dates, dateStrings) => {
    dispatch(
      setSearchParam({
        startDate: dateStrings?.[0] || null,
        endDate: dateStrings?.[1] || null,
      })
    );
  };
  const handleFilterTypeChange = (value) => {
    setFilterType(value);
    if (value !== "amount") {
      setMinAmount("");
      setMaxAmount("");
    }
    if (value === "text") {
      dispatch(setSearchParam({ startDate: null, endDate: null, minAmount: null, maxAmount: null }));
    } else if (value === "date-single" || value === "date-range") {
      dispatch(setSearchParam({ keyword: "", minAmount: null, maxAmount: null }));
    } else if (value === "amount") {
      dispatch(setSearchParam({ keyword: "", startDate: null, endDate: null }));
    }
  };
  const handleSearch = () => {
    const payload = { ...collectionSearchParams };
    if (filterType === "text") {
      payload.startDate = null; payload.endDate = null; payload.minAmount = null; payload.maxAmount = null;
    } else if (filterType === "date-single" || filterType === "date-range") {
      payload.keyword = ""; payload.minAmount = null; payload.maxAmount = null;
    } else if (filterType === "amount") {
      payload.keyword = ""; payload.startDate = null; payload.endDate = null;
      payload.minAmount = minAmount || null;
      payload.maxAmount = maxAmount || null;
    }
    dispatch(setSearchParam(payload));
    loadCollections(1, collectionPagination?.pageSize || 10, payload);
  };
  const handleReset = () => {
    setFilterType("text");
    setMinAmount("");
    setMaxAmount("");
    const resetPayload = {
      search: "c", keyword: "", startDate: null, endDate: null, minAmount: null, maxAmount: null,
    };
    dispatch(setSearchParam(resetPayload));
    loadCollections(1, collectionPagination?.pageSize || 10, resetPayload);
  };


  // 🔽 3. "전체 수금 목록" 탭의 검색창 UI
  const renderCollectionListSearch = () => (
    <Card style={{ marginBottom: 20 }}>
      <Row gutter={[16, 16]} justify="space-between" align="middle">
        <Col>
          <Space wrap>
            <Select
              value={filterType}
              style={{ width: 120 }}
              onChange={handleFilterTypeChange}
            >
              <Option value="text">기본검색</Option>
              <Option value="date-single">수금일자</Option>
              <Option value="date-range">수금기간</Option>
              <Option value="amount">수금금액</Option>
            </Select>
            {filterType === "text" && (
              <>
                <Select
                  value={collectionSearchParams.search}
                  style={{ width: 120 }}
                  onChange={(value) => handleSearchParamChange("search", value)}
                >
                  <Option value="c">거래처명</Option>
                  <Option value="w">작성자</Option>
                  <Option value="n">비고</Option>
                </Select>
                <Input
                  placeholder="검색어를 입력해주세요."
                  style={{ width: 240 }}
                  value={collectionSearchParams.keyword || ""}
                  onChange={(e) => handleSearchParamChange("keyword", e.target.value)}
                  onPressEnter={handleSearch}
                />
              </>
            )}
            {filterType === "date-single" && (
              <DatePicker
                placeholder="수금일자 선택"
                value={
                  collectionSearchParams.startDate
                    ? dayjs(collectionSearchParams.startDate)
                    : null
                }
                onChange={handleSingleDateChange}
              />
            )}
            {filterType === "date-range" && (
              <RangePicker
                value={
                  collectionSearchParams.startDate &&
                  collectionSearchParams.endDate
                    ? [
                        dayjs(collectionSearchParams.startDate),
                        dayjs(collectionSearchParams.endDate),
                      ]
                    : null
                }
                onChange={handleDateRangeChange}
              />
            )}
            {filterType === "amount" && (
              <>
                <InputNumber
                  placeholder="최소금액"
                  style={{ width: 120, textAlign: "right" }}
                  value={minAmount}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  onChange={(value) => setMinAmount(value)}
                />
                <span>~</span>
                <InputNumber
                  placeholder="최대금액"
                  style={{ width: 120, textAlign: "right" }}
                  value={maxAmount}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  onChange={(value) => setMaxAmount(value)}
                />
              </>
            )}
            <Space>
              <Button type="primary" onClick={handleSearch}>
                검색
              </Button>
              <Button onClick={handleReset}>초기화</Button>
            </Space>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button
              danger
              onClick={() => showDeleteConfirmModal()}
              disabled={!(selectedCollectionKeys && selectedCollectionKeys.length > 0)}
            >
              선택 삭제
            </Button>
            <Button
              onClick={() => showCollectionModal()}
              icon={<PlusOutlined />}
            >
              신규 수금 등록
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  // 🔽 4. "거래처별 요약" 탭의 검색창 UI (선택형으로 변경)
  const renderSummarySearch = () => (
    <Card style={{ marginBottom: 20 }}>
      <Row justify="space-between">
        <Col>
          <Space>
            <Select
              value={summarySearchType}
              style={{ width: 120 }}
              onChange={setSummarySearchType}
            >
              <Option value="c">거래처명</Option>
              <Option value="id">사업자번호</Option>
            </Select>
            <Input
              placeholder="검색어를 입력해주세요."
              style={{ width: 240 }}
              value={summaryKeyword}
              onChange={(e) => setSummaryKeyword(e.target.value)}
            />
            <Space>
              <Button type="primary" onClick={handleSearch}>
                검색
              </Button>
              <Button onClick={handleReset}>초기화</Button>
            </Space>
          </Space>
        </Col>
        <Col /> 
      </Row>
    </Card>
  );
  
  // 🔽 5. 요약 탭 데이터 클라이언트 측 필터링 (로직 수정)
  const filteredReceivables = (receivables?.list || []).filter(item => {
    if (!summaryKeyword) return true; // 검색어 없으면 모두 표시
    const keyword = summaryKeyword.toLowerCase();
    
    if (summarySearchType === 'c') { // 거래처명
      return item.clientCompany.toLowerCase().includes(keyword);
    } else if (summarySearchType === 'id') { // 사업자번호
      return item.clientId.toLowerCase().includes(keyword);
    }
    return true;
  });

  // 🔽 6. 탭 아이템 정의
  const tabItems = [
    {
      key: "list",
      label: "전체 수금 목록",
      children: (
        <>
          {renderCollectionListSearch()}
          <Spin spinning={collectionLoading} tip="로딩 중...">
            <Table
              rowSelection={{
                selectedRowKeys: selectedCollectionKeys,
                onChange: (keys) => {
                  dispatch(setSelectedKeys(keys));
                },
              }}
              rowKey={(record) => record.collectionId}
              dataSource={collections}
              columns={collectionListColumns(showCollectionModal, showDeleteConfirmModal)}
              pagination={false}
            />
            <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
              {collections && collections.length > 0 && (
                <Pagination
                  current={collectionPagination?.current || 1}
                  pageSize={collectionPagination?.pageSize || 10}
                  total={collectionPagination?.total || 0}
                  onChange={handlePaginationChange}
                  showSizeChanger
                  pageSizeOptions={["10", "20", "50"]}
                />
              )}
            </div>
          </Spin>
        </>
      ),
    },
    {
      key: "summary",
      label: "거래처별 요약",
      children: (
        <>
          {renderSummarySearch()}
          <Spin spinning={receivables.loading} tip="로딩 중...">
            <Table
              rowKey={(r) => r.clientId}
              dataSource={filteredReceivables} // 👈 필터링된 데이터 사용
              columns={receivablesColumns(handleOpenLedgerModal)}
              pagination={false}
            />
          </Spin>
        </>
      ),
    },
  ];

  // --- 렌더링 ---
  return (
    <MainLayout>
      <h2 style={{ fontSize: 24, marginBottom: 20 }}>수금 관리</h2>

      {/* 🔽 7. Tabs (activeKey를 state로 제어) */}
      <Tabs
        activeKey={activeTab} // 👈 'list'가 기본값
        items={tabItems}
        onChange={(key) => {
          setActiveTab(key); // 👈 탭 변경 시 state 업데이트
          if (key === "summary") {
            dispatch(fetchReceivablesSummary());
          }
        }}
      />

      {/* 🔽 8. 모든 모달을 Tabs 밖으로 이동 */}
      <CollectionModal
        open={isCollectionModalOpen}
        onClose={handleCollectionModalClose}
        collectionId={editingCollectionId}
        onRefresh={() => {
          handleCollectionModalClose();
          loadCollections();
          dispatch(fetchReceivablesSummary()); // 요약 탭도 갱신
        }}
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
          <Button
            key="delete"
            type="primary"
            danger
            loading={isDeleting}
            onClick={handleDelete}
          >
            삭제
          </Button>,
        ]}
      >
        <p>
          {isDeletingMultiple
            ? `${selectedCollectionKeys.length}개의 수금을 정말로 삭제하시겠습니까?`
            : `수금번호 '${deletingCollectionId}'(을)를 정말로 삭제하시겠습니까?`}
        </p>
        <p style={{ color: "grey" }}>삭제된 데이터는 복구할 수 없습니다.</p>
      </Modal>

      <ClientLedgerModal
        open={isLedgerModalOpen}
        onClose={handleCloseLedgerModal}
        client={selectedClient}
      />
    </MainLayout>
  );
};

export default CollectionListPage;