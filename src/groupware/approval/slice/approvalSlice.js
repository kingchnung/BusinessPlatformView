import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { draftApproval, getApprovalList } from "../../../api/groupware/approvalApi";

export const fetchApprovals = createAsyncThunk(
    "/approvals",
    async () => {
        return await getApprovalList();
    }
);

export const createDraft = createAsyncThunk(
    "/approvals/draft",
    async (payload) => {
        return await draftApproval(payload);
    }
);

const approvalSlice = createSlice({
    name : "approval",
    initialState : {
        approvals : [],
        loading : false,
    },
    reducers : {},
    extraReducers : (builder) => {
        builder
        .addCase(fetchApprovals.pending, (state) => {
            state.loading = true;
        })
        .addCase(fetchApprovals.fulfilled, (state, action) => {
            state.loading = false;
            state.approvals = action.payload;
        })
        .addCase(createDraft.fulfilled, (state, action) => {
            state.approvals.unshift(action.payload);
        });
    },
});

export default approvalSlice.reducer;