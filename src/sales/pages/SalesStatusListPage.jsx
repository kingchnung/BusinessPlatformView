// src/sales/pages/SalesStatusListPage.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
  message,
  Card,
  Spin,
  Row,
  Col,
  Select,
  Pagination,
  Tabs,
  Space,
  Typography,
  Divider,
  Statistic, // ✅ 추가
} from "antd";
import MainLayout from "../../layouts/MainLayout";
import {
  fetchClientSalesStatus,
  fetchPeriodSalesStatus,
  fetchAnnualSalesStatus,
  setSelectedYear,
  setSelectedMonth,
  clearSalesStatusError,
} from "../slice/salesStatusSlice";
import SalesAnalyticsTabs from "../components/SalesAnalyticsTabs";

const { Option } = Select;
const { Title } = Typography;

/** 연도 옵션 */
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear + 1; i >= currentYear - 5; i--) {
    years.push(
      <Option key={i} value={i}>
        {i}년
      </Option>
    );
  }
  return years;
};

/** 월 옵션 (0 = 전체) */
const generateMonthOptions = () => {
  const months = [
    <Option key="all" value={0}>
      전체
    </Option>,
  ];
  for (let i = 1; i <= 12; i++) {
    months.push(
      <Option key={i} value={i}>
        {i}월
      </Option>
    );
  }
  return months;
};

/** 금액 포맷 */
const formatCurrency = (v) =>
  v || v === 0 ? `${Math.trunc(Number(v)).toLocaleString("ko-KR")} 원` : "-";

/** 거래처별 현황 컬럼 (월/연간 제목 분기) */
const getClientStatusColumns = (selectedMonth, pagination) => [
  {
    title: "No",
    key: "rowNumber",
    align: "center",
    width: 64,
    render: (_, __, index) => {
      const cur = pagination?.current || 1;
      const sz  = pagination?.pageSize || 10;
      return (cur - 1) * sz + index + 1;
    },
  },
  {
    title: "사업자번호",
    dataIndex: "clientId",
    key: "clientId",
    align: "center",
  },
  {
    title: "거래처명",
    dataIndex: "clientCompany",
    key: "clientCompany",
    align: "center",
  },
  {
    title: selectedMonth > 0 ? "월 매출액" : "연간 매출액",
    dataIndex: "monthlySalesAmount",
    key: "salesAmount",
    align: "right",
    render: formatCurrency,
  },
  {
    title: selectedMonth > 0 ? "월 목표 대비" : "연간 목표 대비",
    dataIndex: "achievementRatio",
    key: "achievementRatio",
    align: "center",
    render: (v) => (v || v === 0 ? `${(Number(v) * 100).toFixed(1)}%` : "-"),
  },
  {
    title: "미수금 합계",
    dataIndex: "outstandingBalance",
    key: "outstandingBalance",
    align: "right",
    render: formatCurrency,
  },
];

/** 연도별 요약 컬럼 */
const annualStatusColumns = [
  {
    title: "연도",
    dataIndex: "year",
    key: "year",
    align: "center",
    render: (y) => `${y}년`,
  },
  {
    title: "연간 목표액",
    dataIndex: "targetAmount",
    key: "targetAmount",
    align: "right",
    render: formatCurrency,
  },
  {
    title: "연간 매출액",
    dataIndex: "salesAmount",
    key: "salesAmount",
    align: "right",
    render: formatCurrency,
  },
  {
    title: "달성률",
    dataIndex: "achievementRatio",
    key: "achievementRatio",
    align: "center",
    render: (v) => (v || v === 0 ? `${(Number(v) * 100).toFixed(1)}%` : "-"),
  },
];

/** 기간별(월별) 상세 컬럼 */
const periodStatusColumns = [
  {
    title: "기간 (월)",
    dataIndex: "month",
    key: "month",
    align: "center",
    render: (m) => `${m}월`,
  },
  {
    title: "목표 금액",
    dataIndex: "targetAmount",
    key: "targetAmount",
    align: "right",
    render: formatCurrency,
  },
  {
    title: "매출액",
    dataIndex: "salesAmount",
    key: "salesAmount",
    align: "right",
    render: formatCurrency,
  },
  {
    title: "달성률",
    dataIndex: "achievementRatio",
    key: "achievementRatio",
    align: "center",
    render: (v) => (v || v === 0 ? `${(Number(v) * 100).toFixed(1)}%` : "-"),
  },
];

const SalesStatusListPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("byClient");

  const {
    clientStatusList,
    clientStatusPagination,
    clientStatusLoading,
    periodStatusList,
    periodStatusLoading,
    annualStatus,
    selectedYear,
    selectedMonth,
    error,
  } = useSelector((state) => state.salesStatus);

  /** 데이터 로드 함수 */
  const loadClientStatus = (page, size, year, month) => {
    dispatch(fetchClientSalesStatus({ page, size, year, month }));
  };
  const loadPeriodStatus = (year) => dispatch(fetchPeriodSalesStatus({ year }));
  const loadAnnualStatus = () => dispatch(fetchAnnualSalesStatus());

  /** 탭/연/월 변경 시 로딩 */
  useEffect(() => {
    if (activeTab === "byClient") {
      // 거래처별 현황
      loadClientStatus(
        clientStatusPagination?.current || 1,
        clientStatusPagination?.pageSize || 10,
        selectedYear,
        selectedMonth
      );

      // ✅ 선택에 따른 목표 데이터 로드(우측 박스 표시용)
      if (selectedMonth === 0) {
        loadAnnualStatus(); // 연간 목표 요약
      } else {
        loadPeriodStatus(selectedYear); // 월별 목표 요약
      }
    } else if (activeTab === "byPeriod") {
      // 기간별 현황 탭
      loadAnnualStatus();
      loadPeriodStatus(selectedYear);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedYear, selectedMonth]);

  /** 에러 핸들링 */
  useEffect(() => {
    if (error) {
      message.error(error.message || "매출 현황 조회 중 오류가 발생했습니다.");
      dispatch(clearSalesStatusError());
    }
  }, [error, dispatch]);

  /** 핸들러 */
  const handleTabChange = (key) => setActiveTab(key);
  const handleYearChange = (value) => dispatch(setSelectedYear(value));
  const handleMonthChange = (value) => dispatch(setSelectedMonth(value));
  const handleClientPaginationChange = (page, pageSize) => {
    loadClientStatus(page, pageSize, selectedYear, selectedMonth);
  };

  /** ✅ 현재 선택(연/월)에 맞는 목표액 계산 */
  const getCurrentTargetAmount = () => {
    if (selectedMonth === 0) {
      const yearRow = (annualStatus?.list || []).find(
        (r) => r.year === selectedYear
      );
      return yearRow?.targetAmount ?? 0;
    } else {
      const monthRow = (periodStatusList || []).find(
        (r) => r.month === selectedMonth
      );
      return monthRow?.targetAmount ?? 0;
    }
  };

  /** ✅ 라벨 */
  const targetLabel =
    selectedMonth === 0
      ? `${selectedYear}년 연간 목표액`
      : `${selectedYear}년 ${selectedMonth}월 목표액`;

  /** 거래처별 탭의 검색 + 우측 목표 박스 */
  const renderClientSearch = () => (
    <Card style={{ marginBottom: 20 }}>
      <Row align="middle" justify="space-between" gutter={16}>
        <Col>
          <Space>
            <Select
              value={selectedYear}
              style={{ width: 120 }}
              onChange={handleYearChange}
            >
              {generateYearOptions()}
            </Select>
            <Select
              value={selectedMonth}
              style={{ width: 100 }}
              onChange={handleMonthChange}
            >
              {generateMonthOptions()}
            </Select>
          </Space>
        </Col>

        {/* ✅ 우측 목표액 표시 박스 */}
        <Col flex="none">
          <div
            style={{
              minWidth: 320,
              padding: 12,
              border: "1px solid #f0f0f0",
              borderRadius: 8,
              background: "#fff",
            }}
          >
            <Statistic
              title={targetLabel}
              value={getCurrentTargetAmount()}
              precision={0}
              formatter={(v) => formatCurrency(v)}
            />
          </div>
        </Col>
      </Row>
    </Card>
  );

  /** 기간별 탭 검색(연도 선택) */
  const renderPeriodSearch = () => (
    <Card style={{ marginBottom: 20 }}>
      <Row justify="start">
        <Col>
          <Space>
            <Select
              value={selectedYear}
              style={{ width: 120 }}
              onChange={handleYearChange}
            >
              {generateYearOptions()}
            </Select>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  /** 탭 정의 */
  const tabItems = [
    {
      key: "byClient",
      label: "거래처별 현황",
      children: (
        <>
          {renderClientSearch()}
          <Spin spinning={clientStatusLoading} tip="로딩 중...">
            <Table
              rowKey="clientId"
              dataSource={clientStatusList}
              columns={getClientStatusColumns(selectedMonth, clientStatusPagination)}
              pagination={false}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 20,
              }}
            >
              {clientStatusList && clientStatusList.length > 0 && (
                <Pagination
                  current={clientStatusPagination?.current || 1}
                    pageSize={clientStatusPagination?.pageSize || 10}
                    total={clientStatusPagination?.total || 0}
                    onChange={(p, ps) => handleClientPaginationChange(p, ps)} 
                    onShowSizeChange={(p, ps) => handleClientPaginationChange(1, ps)} 
                    showSizeChanger
                    pageSizeOptions={['10','20','50']}
                />
              )}
            </div>
          </Spin>
        </>
      ),
    },
    {
      key: "byPeriod",
      label: "기간별 현황",
      children: (
        <>
          <Title level={5}>연도별 요약</Title>
          <Spin spinning={annualStatus.loading} tip="로딩 중...">
            <Table
              rowKey="year"
              dataSource={annualStatus.list}
              columns={annualStatusColumns}
              pagination={false}
              style={{ marginBottom: 20 }}
              size="small"
            />
          </Spin>

          <Divider />

          <Title level={5}>{selectedYear}년 월별 상세</Title>
          {renderPeriodSearch()}
          <Spin spinning={periodStatusLoading} tip="로딩 중...">
            <Table
              rowKey="month"
              dataSource={periodStatusList}
              columns={periodStatusColumns}
              pagination={false}
            />
          </Spin>
        </>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="page-header-with-tabs">
        <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
          매출 목표 대비 달성 현황
        </h2>
        <SalesAnalyticsTabs className="header-tabs" />
      </div>
      <Tabs activeKey={activeTab} items={tabItems} onChange={handleTabChange} />
    </MainLayout>
  );
};

export default SalesStatusListPage;
