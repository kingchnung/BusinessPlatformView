import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchDepartments,
  fetchDepartmentDetail,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../../api/hr/departmentsAPI";

/**
 * ==========================================
 * ✅ Department Slice
 * - 부서 CRUD 및 트리 데이터 관리
 * ==========================================
 */

// 🔹 1️⃣ 전체 부서 조회
export const getDepartments = createAsyncThunk("department/fetchAll", async () => {
  const data = await fetchDepartments();
  return data;
});

// 🔹 2️⃣ 단일 부서 조회
export const getDepartmentDetail = createAsyncThunk(
  "department/fetchOne",
  async (deptId) => {
    const data = await fetchDepartmentDetail(deptId);
    return data;
  }
);

// 🔹 3️⃣ 신규 부서 등록
export const addDepartment = createAsyncThunk("department/add", async (deptData) => {
  const data = await createDepartment(deptData);
  return data;
});

// 🔹 4️⃣ 부서 수정
export const editDepartment = createAsyncThunk(
  "department/update",
  async ({ deptId, deptData }) => {
    const data = await updateDepartment(deptId, deptData);
    return data;
  }
);

// 🔹 5️⃣ 부서 삭제
export const removeDepartment = createAsyncThunk("department/delete", async (deptId) => {
  const data = await deleteDepartment(deptId);
  return { deptId, data };
});

const departmentSlice = createSlice({
  name: "department",
  initialState: {
    departments: [], // 전체 부서 목록
    selectedDepartment: null, // 선택된 부서 상세
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedDepartment: (state) => {
      state.selectedDepartment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 전체 부서 목록
      .addCase(getDepartments.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload || [];
      })
      .addCase(getDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // 부서 상세
      .addCase(getDepartmentDetail.fulfilled, (state, action) => {
        state.selectedDepartment = action.payload;
      })

      // 신규 등록
      .addCase(addDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload);
      })

      // 수정
      .addCase(editDepartment.fulfilled, (state, action) => {
        const index = state.departments.findIndex(
          (dept) => dept.deptId === action.payload.deptId
        );
        if (index !== -1) state.departments[index] = action.payload;
      })

      // 삭제
      .addCase(removeDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter(
          (dept) => dept.deptId !== action.payload.deptId
        );
      });
  },
});

export const { clearSelectedDepartment } = departmentSlice.actions;
export default departmentSlice.reducer;
