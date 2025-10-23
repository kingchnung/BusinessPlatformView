import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { listCollections, removeCollection } from "../../api/sales/collectionApi";

// 💡 2. Thunk 이름을 'collection/...'으로 변경
export const fetchCollections = createAsyncThunk(
  "collection/fetchCollections",
  async (params, { rejectWithValue }) => {
    try {
      // 💡 listCollections API 호출
      const res = await listCollections(params); 
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

// 💡 3. deleteCollection
export const deleteCollection = createAsyncThunk(
  "collection/deleteCollection",
  async (collectionId, { rejectWithValue }) => {
    try {
      // 💡 removeCollection API 호출
      await removeCollection(collectionId);
      return collectionId;
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: "삭제 실패" });
    }
  }
);

// 💡 4. deleteMultipleCollections
export const deleteMultipleCollections = createAsyncThunk(
  "collection/deleteMultipleCollections",
  async (collectionIds, { rejectWithValue }) => {
    try {
      // 💡 removeCollection API 호출
      await Promise.all(collectionIds.map((id) => removeCollection(id)));
      return collectionIds;
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: "선택 삭제 실패" });
    }
  }
);


const collectionSlice = createSlice({
  name: "collection",
  initialState: {
    list: [],
    searchParams: {
      search: "c", // 기본값 'c' (거래처명)
      keyword: "",
      startDate: null,
      endDate: null,
      minAmount: null,
      maxAmount: null,
    },
       selectedKeys: [],
    pagination: { current: 1, pageSize: 10, total: 0 },
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

    clearCollectionError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // --- fetchCollections ---
    builder.addCase(fetchCollections.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCollections.fulfilled, (state, action) => {
      state.loading = false;
      state.list = action.payload.list;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchCollections.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error;
    });

    // --- deleteCollection ---
    builder.addCase(deleteCollection.pending, (state) => {
      state.error = null;
    });
    builder.addCase(deleteCollection.fulfilled, (state, action) => {
      const id = action.payload;
      // 💡 'collectionId' 기준으로 필터링
      state.list = state.list.filter((c) => c.collectionId !== id);
      state.selectedKeys = state.selectedKeys.filter((k) => k !== id);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    });
    builder.addCase(deleteCollection.rejected, (state, action) => {
      state.error = action.payload || action.error;
    });

    // --- deleteMultipleCollections ---
    builder.addCase(deleteMultipleCollections.pending, (state) => {
      state.error = null;
    });
    builder.addCase(deleteMultipleCollections.fulfilled, (state, action) => {
      const ids = new Set(action.payload || []);
      // 💡 'collectionId' 기준으로 필터링
      state.list = state.list.filter((c) => !ids.has(c.collectionId));
      state.selectedKeys = [];
      state.pagination.total = Math.max(0, state.pagination.total - ids.size);
    });
    builder.addCase(deleteMultipleCollections.rejected, (state, action) => {
      state.error = action.payload || action.error;
    });
  },
});

// 💡 8. actions export
export const { setSelectedKeys, clearCollectionError, setSearchParam } =
  collectionSlice.actions;

export default collectionSlice.reducer;