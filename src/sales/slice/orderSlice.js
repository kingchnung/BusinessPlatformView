import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getOrderList, removeOrder, removeOrders } from '../../api/sales/orderApi';

// --- 비동기 Thunk 정의 ---

// 주문 목록 조회 Thunk
export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async ({ page = 1, size = 10, search, keyword, startDate, endDate, minAmount, maxAmount }, { rejectWithValue }) => {
    try {
      const response = await getOrderList(
        page,
        size,
        search,
        keyword,
        startDate,
        endDate,
        minAmount,
        maxAmount
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "주문 목록 조회 실패" });
    }
  }
);

// 단일 주문 삭제 Thunk
export const deleteOrder = createAsyncThunk(
  'order/deleteOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      await removeOrder(orderId);
      return orderId; // 성공 시 삭제된 ID 반환
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "주문 삭제 실패" });
    }
  }
);

// 여러 주문 삭제 Thunk
export const deleteMultipleOrders = createAsyncThunk(
  'order/deleteMultipleOrders',
  async (orderIds, { rejectWithValue }) => {
    try {
      await removeOrders(orderIds); // 백엔드 API 호출
      return orderIds; // 성공 시 삭제된 ID 배열 반환
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "주문 선택 삭제 실패" });
    }
  }
);

// --- 초기 상태 정의 ---
const initialState = {
  list: [],
  pagination: { current: 1, pageSize: 10, total: 0 },
  // 검색 파라미터에 날짜 필드 추가 (초기값 null)
  searchParams: {
    search: "client",
    keyword: "",
    startDate: null,
    endDate: null,
  },
  selectedKeys: [],
  loading: false,
  error: null,
};

// --- Slice 생성 ---
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // 검색 파라미터 변경 액션
    setSearchParam: (state, action) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    setSelectedKeys: (state, action) => {
      state.selectedKeys = action.payload;
    },
    clearOrderError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchOrders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.dtoList;
        state.pagination = {
          current: action.payload.pageRequestDTO.page,
          pageSize: action.payload.pageRequestDTO.size,
          total: action.payload.totalCount,
        };
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // deleteOrder
      .addCase(deleteOrder.fulfilled, (state, action) => {
         state.selectedKeys = state.selectedKeys.filter(key => key !== action.payload);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.error = action.payload;
      })
      // deleteMultipleOrders
      .addCase(deleteMultipleOrders.fulfilled, (state, action) => {
        state.selectedKeys = [];
      })
      .addCase(deleteMultipleOrders.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setSearchParam, setSelectedKeys, clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;

