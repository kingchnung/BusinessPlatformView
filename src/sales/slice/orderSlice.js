import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getOrderList, removeOrder } from '../../api/sales/orderApi';

// 주문 목록 조회 Thunk
export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async ({ page = 1, size = 10 /*, searchParams */ }, { rejectWithValue }) => {
    try {
      const response = await getOrderList(page, size /*, searchParams */);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "주문 목록 조회 실패" });
    }
  }
);

// 주문 삭제 Thunk
export const deleteOrder = createAsyncThunk(
  'order/deleteOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      await removeOrder(orderId);
      return orderId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "주문 삭제 실패" });
    }
  }
);
// (addOrder, updateOrder Thunk는 Modal에서 직접 API 호출 후 목록 재조회 방식으로 처리 가능)


const initialState = {
  list: [],
  pagination: { current: 1, pageSize: 10, total: 0 },
  // searchParams: { status: 'all', clientKeyword: '', projectKeyword: '' }, // 필요시 검색 상태 추가
  loading: false,
  error: null,
};


const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // 필요시 검색 파라미터 변경 등 동기 액션 추가
    // setOrderSearchParam: (state, action) => { ... },
    clearOrderError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchOrders Thunk 처리
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
      // deleteOrder Thunk 처리
      .addCase(deleteOrder.fulfilled, (state, action) => {
        // 목록 새로고침으로 처리하므로 상태 직접 변경 최소화
        // 필요하다면 여기서 list에서 해당 orderId 제거 가능
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.error = action.payload;
      });
      // (addOrder, updateOrder 관련 상태 변경은 필요시 추가)
  },
});

export const { clearOrderError /*, setOrderSearchParam */ } = orderSlice.actions;
export default orderSlice.reducer;