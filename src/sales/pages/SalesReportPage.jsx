import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import {
  Card,
  Spin,
  message,
  Row,
  Col,
  Select,
  Button,
  Table,
  Typography,
  Calendar,
  List,
  Space,
  ConfigProvider,
  Divider, 
} from "antd";
import {
  BarChart,
  Bar,
  LineChart,
  Line, 
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import MainLayout from "../../layouts/MainLayout";
import { fetchQuarterlySales } from "../slice/salesReportSlice";
import { setSelectedYear as setTargetSelectedYear } from "../slice/salesTargetSlice";
import {
  fetchPeriodSalesStatus,
  clearSalesStatusError,
} from "../slice/salesStatusSlice";
import { getSalesTargetList } from "../../api/sales/salesTargetApi";
import SalesAnalyticsTabs from "../components/SalesAnalyticsTabs";

const { Title } = Typography;
const { Option } = Select;

// 금액 포맷팅 헬퍼
const formatCurrency = (value) =>
  value || value === 0 ? `${Number(value).toLocaleString("ko-KR")}` : "0";

// --- 메인 컴포넌트 ---
const SalesReportPage = () => {
  const dispatch = useDispatch();

  // --- Redux 상태 가져오기 ---
  // 1. 실제 분기별 매출 (salesReportSlice)
  const {
    list: quarterlySales,
    loading: actualLoading,
    error: actualError,
  } = useSelector((state) => state.salesReport.quarterly);

  // 🔽 [수정] 2. 월별 매출+목표 (salesStatusSlice)
  const {
    periodStatusList,
    periodStatusLoading,
    error: periodError,
  } = useSelector((state) => state.salesStatus);

  // 3. 선택된 연도 (salesTargetSlice)
  const selectedYear = useSelector((state) => state.salesTarget.selectedYear);

  // 4. 선택된 연도의 월별 목표 데이터를 저장할 로컬 State (분기별 차트용)
  const [monthlyTargets, setMonthlyTargets] = useState([]);
  const [targetLoading, setTargetLoading] = useState(false);
  const [targetError, setTargetError] = useState(null);

  // --- 데이터 가져오기 ---
  useEffect(() => {
    // 1. 분기별 실제 매출 항상 가져오기
    dispatch(fetchQuarterlySales());
  }, [dispatch]);

  // 2. selectedYear가 변경되면 해당 연도의 (분기용) 목표 데이터 + (월별용) 데이터를 모두 가져오기
  useEffect(() => {
    if (!selectedYear) return; // 연도가 없으면 실행 안 함

    // 2-1. (기존) 분기별 차트의 "목표"를 위한 월별 목표 API 호출
    const fetchTargets = async () => {
      setTargetLoading(true);
      setTargetError(null);
      setMonthlyTargets([]); // 이전 데이터 초기화
      try {
        const response = await getSalesTargetList(1, 999, selectedYear);
        setMonthlyTargets(response?.dtoList || []);
      } catch (error) {
        setTargetError({ message: `${selectedYear}년 매출 목표 조회 실패` });
        setMonthlyTargets([]);
      } finally {
        setTargetLoading(false);
      }
    };
    fetchTargets();

    // 🔽 [수정] 2-2. 꺾은선 그래프를 위한 "월별 매출+목표" API 호출
    dispatch(fetchPeriodSalesStatus({ year: selectedYear }));
  }, [selectedYear, dispatch]); // dispatch 의존성 추가

  // --- 에러 처리 ---
  useEffect(() => {
    if (actualError)
      message.error(actualError.message || "분기별 매출 조회 실패");
    if (targetError) message.error(targetError.message || "매출 목표 조회 실패");
    // 🔽 [수정] 월별 데이터 에러 처리
    if (periodError) {
      message.error(periodError.message || "월별 현황 조회 실패");
      dispatch(clearSalesStatusError()); // 에러 초기화
    }
  }, [actualError, targetError, periodError, dispatch]);

  // --- 차트 및 컨트롤용 데이터 가공 ---

  // 🔽 [수정] 1. (분기별) 막대 차트용 데이터
  const processedQuarterlyData = useMemo(() => {
    const actualYears =
      quarterlySales.length > 0
        ? [...new Set(quarterlySales.map((item) => item.year))]
        : [];
    const availableYears = [...new Set([...actualYears, selectedYear])]
      .filter((year) => year != null)
      .sort((a, b) => b - a);

    const currentSelectedYear =
      selectedYear || availableYears[0] || new Date().getFullYear();

    const selectedYearActualSales = quarterlySales.filter(
      (item) => item.year === currentSelectedYear
    );

    const quarterlyTargets = { 1: 0, 2: 0, 3: 0, 4: 0 };
    monthlyTargets.forEach((target) => {
      const month = target.targetMonth;
      const amount = Number(target.targetAmount || 0);
      if (month >= 1 && month <= 3) quarterlyTargets[1] += amount;
      else if (month >= 4 && month <= 6) quarterlyTargets[2] += amount;
      else if (month >= 7 && month <= 9) quarterlyTargets[3] += amount;
      else if (month >= 10 && month <= 12) quarterlyTargets[4] += amount;
    });

    const chartData = [
      { name: "1분기", sales: 0, target: quarterlyTargets[1] },
      { name: "2분기", sales: 0, target: quarterlyTargets[2] },
      { name: "3분기", sales: 0, target: quarterlyTargets[3] },
      { name: "4분기", sales: 0, target: quarterlyTargets[4] },
    ];

    selectedYearActualSales.forEach((item) => {
      if (item.quarter >= 1 && item.quarter <= 4) {
        chartData[item.quarter - 1].sales = Number(item.totalSalesAmount || 0);
      }
    });

    return { chartData, availableYears, currentSelectedYear };
  }, [quarterlySales, monthlyTargets, selectedYear]);

  // 🔽 [수정] 2. (월별) 꺾은선 그래프용 데이터
  const monthlyChartData = useMemo(() => {
    if (!periodStatusList || periodStatusList.length === 0) {
      return [];
    }
    return periodStatusList.map((item) => ({
      monthLabel: `${item.month}월`, // X축 레이블
      targetAmount: Number(item.targetAmount),
      salesAmount: Number(item.salesAmount),
    }));
  }, [periodStatusList]);

  // 🔽 [수정] 연도 선택 핸들러 (salesTargetSlice의 액션 사용 - 기존 로직 유지)
  const handleYearChange = (value) => {
    dispatch(setTargetSelectedYear(value));
  };

  // 🔽 [수정] 전체 로딩 상태 (월별 로딩 추가)
  const overallLoading = actualLoading || targetLoading || periodStatusLoading;

const monthOptions = Array.from({ length: 12 }, (_, m) => ({
  value: m,
  label: `${m + 1}월`,
}));
const yearOptions = (centerYear = dayjs().year()) =>
  Array.from({ length: 11 }, (_, i) => centerYear - 5 + i).map((y) => ({
    value: y,
    label: `${y}년`,
  }));

const PrettyCalendar = ({ value, onChange }) => {
  const [val, setVal] = React.useState(value || dayjs());
  const [years, setYears] = React.useState(yearOptions(val.year()));

  const setMonth = (m) => {
    const next = val.month(m);
    setVal(next);
    onChange?.(next);
  };
  const setYear = (y) => {
    const next = val.year(y);
    setVal(next);
    onChange?.(next);
    // 선택 연도 기준으로 드롭다운 범위 갱신(스크롤 많이 안 하게)
    setYears(yearOptions(y));
  };

  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: "#4d78ff", borderRadius: 12 },
      }}
    >
      <Card size="small" className="calendarCard">
        <Calendar
          fullscreen={false}
          value={val}
          onChange={(d) => {
            setVal(d);
            onChange?.(d);
          }}
          // ✅ 상단 커스텀 헤더 (연/월 수정)
          headerRender={({ value, onChange }) => {
            const curr = value.clone();
            const goPrev = () => onChange(curr.subtract(1, "month"));
            const goNext = () => onChange(curr.add(1, "month"));

            return (
              <div className="calHeader">
                <Button shape="circle" size="small" onClick={goPrev}>
                  &lt;
                </Button>

                <div className="titleFlex">
                  <Select
                    size="small"
                    value={curr.year()}
                    onChange={(y) => {
                      setYear(y);
                      onChange(curr.year(y));
                    }}
                    options={years}
                    style={{ width: 92, marginRight: 8 }}
                    dropdownMatchSelectWidth={120}
                  />
                  <Select
                    size="small"
                    value={curr.month()}
                    onChange={(m) => {
                      setMonth(m);
                      onChange(curr.month(m));
                    }}
                    options={monthOptions}
                    style={{ width: 84 }}
                    dropdownMatchSelectWidth={120}
                  />
                </div>

                <Button shape="circle" size="small" onClick={goNext}>
                  &gt;
                </Button>
              </div>
            );
          }}
          // ✅ 주말 색상 커스텀
          dateFullCellRender={(date) => {
            const dow = date.day(); // 0=일, 6=토
            const isToday =
              date.isSame(dayjs(), "day") && date.isSame(dayjs(), "month");

            const style = {
              borderRadius: 8,
              padding: 6,
              textAlign: "right",
              minHeight: 28,
              color:
                dow === 0 ? "#d84a4a" : dow === 6 ? "#3a6cff" : undefined,
              fontWeight: isToday ? 700 : 400,
              border: isToday ? "1px solid #4d78ff" : "1px solid transparent",
            };
            return <div style={style}>{date.date()}</div>;
          }}
        />
      </Card>
    </ConfigProvider>
  );
};

  return (
    <MainLayout>
      <div className="page-header-with-tabs">
        <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
          매출 목표 대비 달성 현황
        </h2>
        <SalesAnalyticsTabs className="header-tabs" />
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card>
            {/* --- 컨트롤: 연도 선택 --- */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
              <Col>
                <Select
                  style={{ width: 120 }}
                  placeholder="연도 선택"
                  value={processedQuarterlyData.currentSelectedYear}
                  onChange={handleYearChange}
                  disabled={processedQuarterlyData.availableYears.length === 0 && !overallLoading}
                >
                  {(processedQuarterlyData.availableYears.length > 0
                    ? processedQuarterlyData.availableYears
                    : [new Date().getFullYear()]
                  ).map((year) => (
                    <Option key={year} value={year}>
                      {year}년
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>

            {/* --- 콘텐츠: 그래프 (월별 + 분기별) --- */}
            <Spin spinning={overallLoading} tip="데이터 로딩 중...">
              
              {/* 🔽 [수정] 1. 월별 꺾은선 그래프 (신규 추가) */}
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Title level={4}>
                    {processedQuarterlyData.currentSelectedYear}년 월별 매출 vs 목표
                  </Title>
                  {monthlyChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="monthLabel" />
                        <YAxis tickFormatter={formatCurrency} width={100} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="targetAmount"
                          name="월 목표액"
                          stroke="#b9b0b0ff"
                        />
                        <Line
                          type="monotone"
                          dataKey="salesAmount"
                          name="월 매출액"
                          stroke="#479ef6ff"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    !periodStatusLoading && <p>해당 연도의 월별 데이터가 없습니다.</p>
                  )}
                </Col>
              </Row>
              
              <Divider /> {/* 👈 [수정] 두 차트 사이에 구분선 추가 */}

              {/* 🔽 [수정] 2. 분기별 막대 그래프 (기존 로직) */}
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Title level={4}>
                    {processedQuarterlyData.currentSelectedYear}년 분기별 매출
                  </Title>
                  {processedQuarterlyData.chartData.some(
                    (d) => d.sales > 0 || d.target > 0
                  ) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={processedQuarterlyData.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={formatCurrency} width={100} />
                        <Tooltip formatter={(value) => formatCurrency(value)} cursor={false} />
                        <Legend />
                        <Bar dataKey="target" fill="#CCCCCC" name="목표액" />
                        <Bar dataKey="sales" fill="#479ef6ff" name="매출액" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    !overallLoading && (
                      <p>해당 연도의 분기별 데이터가 없거나 목표가 설정되지 않았습니다.</p>
                    )
                  )}
                </Col>
              </Row>
            </Spin>
          </Card>
        </Col>

        {/* --- 1-2. 달력 및 목표 리스트 영역 (기존 코드 유지) --- */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <PrettyCalendar />
            <Card
              size="small"
              title={`${processedQuarterlyData.currentSelectedYear}년 월별 목표`}
            >
              <Spin spinning={targetLoading}>
                {monthlyTargets.length > 0 ? (
                  <Table
                    dataSource={monthlyTargets.sort((a, b) => a.targetMonth - b.targetMonth)}
                    columns={[
                      { title: "월", dataIndex: "targetMonth", key: "month", align: "center", render: (m) => `${m}월` },
                      { title: "목표 금액", dataIndex: "targetAmount", key: "amount", align: "right", render: formatCurrency },
                    ]}
                    rowKey="targetMonth"
                    pagination={false}
                    size="small"
                    scroll={{ y: 200 }}
                  />
                ) : (
                  <Typography.Text type="secondary">
                    해당 연도의 목표가 없습니다.
                  </Typography.Text>
                )}
              </Spin>
            </Card>
          </Space>
        </Col>
      </Row>
    </MainLayout>
  );
};

export default SalesReportPage;