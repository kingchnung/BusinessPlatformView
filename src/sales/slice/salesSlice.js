// src/pages/sales/slice/salesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { listSales, removeSales } from "../../api/sales/salesApi";

export const fetchSales = createAsyncThunk(
  "sales/fetchSales",
  async (params, { rejectWithValue }) => {
    try {
      // 👇 params 객체 전체를 API로 전달
      const res = await listSales(params); 
      return {
        list: res.dtoList || [],
        pagination: {
          current: res.pageRequestDTO?.page || params.page || 1,
          pageSize: res.pageRequestDTO?.size || params.size || 10,
          total: res.totalCount || 0,
        },
      };
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: "목록 조회 실패" });
    }
  }
);

export const deleteSales = createAsyncThunk(
  "sales/deleteSales",
  async (salesId, { rejectWithValue }) => {
    try {
      await removeSales(salesId);
      return salesId;
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: "삭제 실패" });
    }
  }
);

export const deleteMultipleSales = createAsyncThunk(
  "sales/deleteMultipleSales",
  async (salesIds, { rejectWithValue }) => {
    try {
      await Promise.all(salesIds.map((id) => removeSales(id)));
      return salesIds;
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: "선택 삭제 실패" });
    }
  }
);

const salesSlice = createSlice({
  name: "sales",
  initialState: {
    list: [],
   searchParams: {
      search: "client",
      keyword: "",
      startDate: null,
      endDate: null,
      minAmount: null,
      maxAmount: null,
      invoiceIssued: null,
      orderId: null,
    },
    selectedKeys: [],
    loading: false,
    error: null,
  },
  reducers: {
    setSearchParam(state, action) {
      state.searchParams = {
        ...state.searchParams,
        ...action.payload,
      };
    },
    setSelectedKeys(state, action) {
      state.selectedKeys = action.payload || [];
    },
    clearSalesError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetch
    builder.addCase(fetchSales.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSales.fulfilled, (state, action) => {
      state.loading = false;
      state.list = action.payload.list;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchSales.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error;
    });

    // delete
    builder.addCase(deleteSales.pending, (state) => {
      state.error = null;
    });
    builder.addCase(deleteSales.fulfilled, (state, action) => {
      const id = action.payload;
      state.list = state.list.filter((s) => s.salesId !== id);
      state.selectedKeys = state.selectedKeys.filter((k) => k !== id);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    });
    builder.addCase(deleteSales.rejected, (state, action) => {
      state.error = action.payload || action.error;
    });

    // delete multiple
    builder.addCase(deleteMultipleSales.pending, (state) => {
      state.error = null;
    });
    builder.addCase(deleteMultipleSales.fulfilled, (state, action) => {
      const ids = new Set(action.payload || []);
      state.list = state.list.filter((s) => !ids.has(s.salesId));
      state.selectedKeys = [];
      state.pagination.total = Math.max(0, state.pagination.total - ids.size);
    });
    builder.addCase(deleteMultipleSales.rejected, (state, action) => {
      state.error = action.payload || action.error;
    });
  },
});

export const { setSelectedKeys, clearSalesError, setSearchParam } = salesSlice.actions;
export default salesSlice.reducer;
