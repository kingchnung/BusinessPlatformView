// src/slice/salesReportSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getClientSalesSummary,
  getProjectSalesSummary,
  getQuarterlySalesSummary,
} from "../../api/sales/salesReportApi"; 

// 분기별 매출 조회 Thunk
export const fetchQuarterlySales = createAsyncThunk(
  "salesReport/fetchQuarterlySales",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getQuarterlySalesSummary();
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data || "분기별 매출 조회 실패");
    }
  }
);

// (선택: 거래처/프로젝트별 요약 Thunk - 필요시 추가)
// export const fetchClientSales = createAsyncThunk(...)
// export const fetchProjectSales = createAsyncThunk(...)

const initialState = {
  quarterly: {
    list: [], // [{ year: 2025, quarter: 4, totalSalesAmount: 150000000 }, ...]
    loading: false,
    error: null,
  },
  // clientSales, projectSales Thunk 구현 시 해당 상태 추가
  // client: { list: [], loading: false, error: null },
  // project: { list: [], loading: false, error: null },
};

const salesReportSlice = createSlice({
  name: "salesReport",
  initialState,
  reducers: {
    // 필요시 동기 액션 추가 (e.g., 에러 클리어)
  },
  extraReducers: (builder) => {
    builder
      // --- 분기별 매출 ---
      .addCase(fetchQuarterlySales.pending, (state) => {
        state.quarterly.loading = true;
        state.quarterly.error = null;
      })
      .addCase(fetchQuarterlySales.fulfilled, (state, action) => {
        state.quarterly.loading = false;
        state.quarterly.list = action.payload || [];
      })
      .addCase(fetchQuarterlySales.rejected, (state, action) => {
        state.quarterly.loading = false;
        state.quarterly.error = action.payload;
      });
    // --- clientSales, projectSales Thunk 구현 시 case 추가 ---
  },
});

// 리듀서 추가 시 액션 export
// export const { ... } = salesReportSlice.actions;

export default salesReportSlice.reducer;