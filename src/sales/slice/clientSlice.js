import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getClientList,
  registerClient,
  modifyClient,
  removeClient,
  removeClients,
} from '../../api/sales/clientApi';

export const fetchClients = createAsyncThunk(
  'client/fetchClients', // 액션 타입 prefix
  async ({ page = 1, size = 10, search, keyword }, { rejectWithValue }) => {
    try {
      const response = await getClientList(page, size, search, keyword);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "거래처 목록 조회 실패" });
    }
  }
);

export const addClient = createAsyncThunk(
  'client/addClient',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await registerClient(formData);
      return response; 
    } catch (error) {
      return rejectWithValue(error); 
    }
  }
);

export const updateClient = createAsyncThunk(
  'client/updateClient',
  async ({ clientNo, formData }, { rejectWithValue }) => {
    try {
      const response = await modifyClient(clientNo, formData);
      return response;
    } catch (error) {
       return rejectWithValue(error);
    }
  }
);

export const deleteClient = createAsyncThunk(
  'client/deleteClient',
  async (clientNo, { rejectWithValue }) => {
    try {
      await removeClient(clientNo);
      return clientNo; 
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "거래처 삭제 실패" });
    }
  }
);

export const deleteMultipleClients = createAsyncThunk(
  'client/deleteMultipleClients',
  async (clientNos, { rejectWithValue }) => {
    try {
      await removeClients(clientNos);
      return clientNos;
    } catch (error) {
       return rejectWithValue(error.response?.data || { message: "거래처 선택 삭제 실패" });
    }
  }
);

const initialState = {
  list: [], 
  pagination: { current: 1, pageSize: 10, total: 0 },
  searchParams: { search: "clientCompany", keyword: "" }, 
  selectedKeys: [], 
  loading: false, 
  error: null, 
};

const clientSlice = createSlice({
  name: 'client', 
  initialState,
  reducers: {
    // 검색 조건 변경 액션
    setSearchParam: (state, action) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    // 선택된 행 변경 액션
    setSelectedKeys: (state, action) => {
      // payload: 선택된 clientNo 배열 (예: [1, 3, 5])
      state.selectedKeys = action.payload;
    },
    // 에러 상태 초기화 액션 (선택 사항)
    clearClientError: (state) => {
      state.error = null;
    },
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true; 
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.dtoList; 
        state.pagination = {
          current: action.payload.pageRequestDTO.page,
          pageSize: action.payload.pageRequestDTO.size,
          total: action.payload.totalCount,
        };
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false; 
        state.error = action.payload;
      })
      .addCase(addClient.pending, (state) => {
         // 등록 중 로딩 표시 등 필요시 추가
      })
      .addCase(addClient.rejected, (state, action) => {
        // 등록 실패 에러 처리 (Modal에서 에러 객체 직접 사용)
        state.error = action.payload; 
      })
      .addCase(updateClient.pending, (state) => {

      })
      .addCase(updateClient.rejected, (state, action) => {
         state.error = action.payload;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        // 삭제 성공 시 선택 해제 (목록 업데이트는 fetchClients 재호출로 처리)
        state.selectedKeys = state.selectedKeys.filter(key => key !== action.payload);
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.error = action.payload; 
      })
      .addCase(deleteMultipleClients.fulfilled, (state, action) => {
        state.selectedKeys = [];
      })
      .addCase(deleteMultipleClients.rejected, (state, action) => {
          state.error = action.payload;
      });
  },
});

export const { setSearchParam, setSelectedKeys, clearClientError } = clientSlice.actions;
export default clientSlice.reducer;