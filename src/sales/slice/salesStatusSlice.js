import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { 
  getClientSalesStatus, 
  getPeriodSalesStatus, 
  getReceivablesSummary, getAnnualSalesStatus,
} from "../../api/sales/salesReportApi";

// "거래처별 현황" Thunk
export const fetchClientSalesStatus = createAsyncThunk(
  "salesStatus/fetchClientSalesStatus",
  async (params, { rejectWithValue }) => {
    try {
      const res = await getClientSalesStatus(params);

      // axios일 때 res.data, fetch-wrapper면 res 그대로일 수 있으니 모두 커버
      const data = res?.data ?? res ?? {};

      // 백엔드 PageResponseDTO ↔ 프론트 상태 형태 매핑
      const {
        dtoList = [],
        page: current = 1,
        size: pageSize = 10,
        totalCount = 0,
      } = data;

      return {
        list: dtoList,
        pagination: { current, pageSize, total: totalCount },
      };
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message: error.message || "조회 실패" });
    }
  }
);

// "기간별 현황" Thunk
export const fetchPeriodSalesStatus = createAsyncThunk(
  "salesStatus/fetchPeriodSalesStatus",
  async ({ year }, { rejectWithValue }) => {
    try {
      const response = await getPeriodSalesStatus({ year });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchReceivablesSummary = createAsyncThunk(
  "salesStatus/fetchReceivablesSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getReceivablesSummary();
      return response; // List<ClientReceivablesDTO>
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAnnualSalesStatus = createAsyncThunk(
  "salesStatus/fetchAnnualSalesStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAnnualSalesStatus();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🔽 2. 초기 상태
const initialState = {
  clientStatusList: [],
  clientStatusPagination: { current: 1, pageSize: 10, total: 0 },
  clientStatusLoading: false,
  periodStatusList: [],
  periodStatusLoading: false,
  selectedYear: new Date().getFullYear(),
  selectedMonth: new Date().getMonth() + 1,
  error: null,

  // 🔽 CollectionListPage '거래처별 요약' 탭용 상태
  receivables: {
    list: [],
    loading: false,
    error: null,
  },

  annualStatus: {
    list: [],
    loading: false,
    error: null,
  },
};

// 🔽 3. Slice 정의
const salesStatusSlice = createSlice({
  name: "salesStatus",
  initialState,
  reducers: {
    setSelectedYear: (state, action) => {
      state.selectedYear = action.payload;
      state.clientStatusPagination.current = 1;
    },
    setSelectedMonth: (state, action) => {
      state.selectedMonth = action.payload;
      state.clientStatusPagination.current = 1;
    },
    clearSalesStatusError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // [거래처별 현황]
      .addCase(fetchClientSalesStatus.pending, (state) => {
        state.clientStatusLoading = true;
        state.error = null;
      })
      .addCase(fetchClientSalesStatus.fulfilled, (state, action) => {
        state.clientStatusLoading = false;
        state.clientStatusList = action.payload.list;
        state.clientStatusPagination = action.payload.pagination;
      })
      .addCase(fetchClientSalesStatus.rejected, (state, action) => {
        state.clientStatusLoading = false;
        state.error = action.payload || { message: "데이터 로드 실패" };
      })
      
      // [기간별 현황]
      .addCase(fetchPeriodSalesStatus.pending, (state) => {
        state.periodStatusLoading = true;
        state.error = null;
      })
      .addCase(fetchPeriodSalesStatus.fulfilled, (state, action) => {
        state.periodStatusLoading = false;
        state.periodStatusList = action.payload; // 기간별 현황은 리스트만 받음
      })
      .addCase(fetchPeriodSalesStatus.rejected, (state, action) => {
        state.periodStatusLoading = false;
        state.error = action.payload || { message: "데이터 로드 실패" };
      })

      // 🔽 미수금 요약 (CollectionListPage용)
      .addCase(fetchReceivablesSummary.pending, (state) => {
        state.receivables.loading = true;
        state.receivables.error = null;
      })
      .addCase(fetchReceivablesSummary.fulfilled, (state, action) => {
        state.receivables.loading = false;
        state.receivables.list = action.payload || [];
      })
      .addCase(fetchReceivablesSummary.rejected, (state, action) => {
        state.receivables.loading = false;
        state.receivables.error = action.payload || { message: "미수금 요약 로드 실패" };
      })
      // 🔽 연도별 요약 케이스
      .addCase(fetchAnnualSalesStatus.pending, (state) => {
        state.annualStatus.loading = true;
        state.annualStatus.error = null;
      })
      .addCase(fetchAnnualSalesStatus.fulfilled, (state, action) => {
        state.annualStatus.loading = false;
        state.annualStatus.list = action.payload || [];
      })
      .addCase(fetchAnnualSalesStatus.rejected, (state, action) => {
        state.annualStatus.loading = false;
        state.annualStatus.error = action.payload;
      });
  },
});

export const { setSelectedYear, setSelectedMonth, clearSalesStatusError } =
  salesStatusSlice.actions;

export default salesStatusSlice.reducer;