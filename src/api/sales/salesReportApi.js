import axiosInstance from "../../common/axiosInstance";

// 🔽 BASE_URL을 새로 만든 SalesDataReportController 경로로 변경
const BASE_URL = "/sales/report";

/**
 * 1. 매출 현황 - 거래처별
 * month가 0 또는 null일 수 있음
 */
export const getClientSalesStatus = async ({ page, size, year, month }) => {
  const params = { page, size, year };
  
  // month가 0이 아닌 유효한 값일 때만 파라미터로 전송 (0 = '전체')
  if (month) { 
    params.month = month;
  }
  
  const { data } = await axiosInstance.get(`${BASE_URL}/status/client`, {
    params: params,
  });
  return data;
};

/**
 * [신규] 2. 매출 현황 - 기간별 (연 필터)
 * GET /api/sales/report/status/period
 */
export const getPeriodSalesStatus = async ({ year }) => {
  // 1. DTO 객체 생성
  const params = { year };

  // 2. GET 요청
  const { data } = await axiosInstance.get(`${BASE_URL}/status/period`, {
    params: params,
  });

  return data; // List<PeriodSalesStatusDTO>
};

// --- 🔽 아래는 기존 리포트 (CollectionController -> SalesDataReportController로 이동) ---

/**
 * 3. 거래처별 미수금 요약 (CollectionListPage '거래처별 요약' 탭용)
 * GET /api/sales/report/receivables
 */
export const getReceivablesSummary = async () => {
  const { data } = await axiosInstance.get(`${BASE_URL}/receivables`);
  return data; // List<ClientReceivablesDTO>
};

/**
 * 4. 거래처별 매출 요약 조회 (기존 salesReportApi.js -> 경로 변경)
 */
export const getClientSalesSummary = async () => {
  const { data } = await axiosInstance.get(`${BASE_URL}/sales/client`);
  return data; // List<ClientSalesSummary>
};

/**
 * 5. 프로젝트별 매출 요약 조회 (기존 salesReportApi.js -> 경로 변경)
 */
export const getProjectSalesSummary = async () => {
  const { data } = await axiosInstance.get(`${BASE_URL}/sales/project`);
  return data; // List<ProjectSalesSummary>
};

/**
 * 6. 분기별 매출 요약 조회 (기존 salesReportApi.js -> 경로 변경)
 */
export const getQuarterlySalesSummary = async () => {
  const { data } = await axiosInstance.get(`${BASE_URL}/sales/quarter`);
  return data; // List<QuarterlySalesSummary>
};

/**
 * 7. 매출 현황 - 연도별 요약
 * GET /api/sales/report/status/annual
 */
export const getAnnualSalesStatus = async () => {
  const { data } = await axiosInstance.get(`${BASE_URL}/status/annual`);
  return data; // List<YearlySalesStatusDTO>
};