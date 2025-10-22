import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getSalesTargetList,
  registerSalesTarget, 
  modifySalesTarget, 
  removeSalesTarget,
} from '../../api/sales/salesTargetApi'; 
export const fetchSalesTargets = createAsyncThunk(
  'salesTarget/fetchSalesTargets', 
  async ({ page = 1, size = 10, year }, { rejectWithValue }) => {
    try {
      const response = await getSalesTargetList(page, size, year);
      return response;
    } catch (error) {
       return rejectWithValue(error.response?.data || { message: "매출 목표 조회 실패" });
    }
  }
);

export const addSalesTarget = createAsyncThunk(
  'salesTarget/addSalesTarget', 
  async (targetData, { rejectWithValue }) => {
    try {
      const response = await registerSalesTarget(targetData);
      return response;
    } catch (error) {
       return rejectWithValue(error);
    }
  }
);

export const updateSalesTarget = createAsyncThunk(
  'salesTarget/updateSalesTarget', 
  async ({ targetId, targetData }, { rejectWithValue }) => {
    try {
      const response = await modifySalesTarget(targetId, targetData);
      return response;
    } catch (error) {
       return rejectWithValue(error);
    }
  }
);

export const deleteSalesTarget = createAsyncThunk(
  'salesTarget/deleteSalesTarget', 
  async (targetId, { rejectWithValue }) => {
    try {
      await removeSalesTarget(targetId);
      return targetId; 
    } catch (error) {
       return rejectWithValue(error.response?.data || { message: "매출 목표 삭제 실패" });
    }
  }
);

// 👇 여러 목표 삭제 Thunk 추가
export const deleteMultipleSalesTargets = createAsyncThunk(
  'salesTarget/deleteMultipleSalesTargets',
  async (targetIds, { rejectWithValue }) => {
    try {
      // 백엔드 API 호출 (removeSalesTargets 함수 필요)
      await removeSalesTargets(targetIds);
      return targetIds; // 성공 시 삭제된 ID 배열 반환
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "매출 목표 선택 삭제 실패" });
    }
  }
);


const initialState = {
  list: [],
  pagination: { current: 1, pageSize: 10, total: 0 },
  selectedYear: new Date().getFullYear(),
  selectedKeys: [], 
  loading: false,
  error: null,
};

const salesTargetSlice = createSlice({
  name: 'salesTarget', 
  initialState,
  reducers: {
    setSelectedYear: (state, action) => {
      state.selectedYear = action.payload;
    },
    setSelectedKeys: (state, action) => {
      state.selectedKeys = action.payload;
    },
     clearTargetError: (state) => {
      state.error = null;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesTargets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesTargets.fulfilled, (state, action) => {
         state.loading = false;
         state.list = action.payload.dtoList;
         state.pagination = {
           current: action.payload.pageRequestDTO.page,
           pageSize: action.payload.pageRequestDTO.size,
           total: action.payload.totalCount,
         };
      })
      .addCase(fetchSalesTargets.rejected, (state, action) => {
         state.loading = false;
         state.error = action.payload;
      })
      .addCase(addSalesTarget.pending, (state) => {

      })
      .addCase(addSalesTarget.rejected, (state, action) => {
         state.error = action.payload;
      })
      .addCase(updateSalesTarget.pending, (state) => {

      })
      .addCase(updateSalesTarget.rejected, (state, action) => {
         state.error = action.payload;
      })
      .addCase(deleteSalesTarget.fulfilled, (state, action) => {
        state.selectedKeys = state.selectedKeys.filter(key => key !== action.payload);
      })
      .addCase(deleteSalesTarget.rejected, (state, action) => {
         state.error = action.payload;
      })
      .addCase(deleteMultipleSalesTargets.fulfilled, (state, action) => {
        state.selectedKeys = [];
      })
      .addCase(deleteMultipleSalesTargets.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setSelectedYear, setSelectedKeys, clearTargetError } = salesTargetSlice.actions;
export default salesTargetSlice.reducer;