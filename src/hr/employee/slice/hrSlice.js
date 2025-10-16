import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchEmployees,
  fetchEmployeeDetail,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../../api/hr/employeeApi";

/**
 * ==============================
 * ✅ HR (직원 관리) Slice
 * - 직원 목록 / 상세 / CRUD 상태 관리
 * ==============================
 */

// 🔹 직원 목록 조회
export const getEmployees = createAsyncThunk("hr/fetchAll", async () => {
  const data = await fetchEmployees();
  if (Array.isArray(data)) {
    return data;
  } else if (Array.isArray(data?.dtoList)) {
    return data.dtoList;
  } else if (Array.isArray(data?.data)) {
    return data.data;
  } else {
    console.warn("⚠️ [getEmployees] 예상치 못한 응답 구조:", data);
    return [];
  }
});

// 🔹 직원 상세 조회
export const getEmployeeDetail = createAsyncThunk("hr/fetchOne", async (empId) => {
  const data = await fetchEmployeeDetail(empId);
  return data;
});

// 🔹 신규 등록
export const addEmployee = createAsyncThunk("hr/add", async (employeeData) => {
  const data = await createEmployee(employeeData);
  return data;
});

// 🔹 수정
export const editEmployee = createAsyncThunk(
  "hr/update",
  async ({ empId, employeeData }) => {
    const data = await updateEmployee(empId, employeeData);
    return data;
  }
);

// 🔹 삭제
export const removeEmployee = createAsyncThunk("hr/delete", async (empId) => {
  const data = await deleteEmployee(empId);
  return { empId, data };
});

const hrSlice = createSlice({
  name: "hr",
  initialState: {
    employees: [],
    selectedEmployee: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 직원 목록
      .addCase(getEmployees.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(getEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // 직원 상세
      .addCase(getEmployeeDetail.fulfilled, (state, action) => {
        state.selectedEmployee = action.payload;
      })

      // 등록
      .addCase(addEmployee.fulfilled, (state, action) => {
        state.employees.unshift(action.payload);
      })

      // 수정
      .addCase(editEmployee.fulfilled, (state, action) => {
        const index = state.employees.findIndex(
          (e) => e.empId === action.payload.empId
        );
        if (index !== -1) state.employees[index] = action.payload;
      })

      // 삭제
      .addCase(removeEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter(
          (e) => e.empId !== action.payload.empId
        );
      });
  },
});

export const { clearSelectedEmployee } = hrSlice.actions;
export default hrSlice.reducer;
