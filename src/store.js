// import authReducer from "./slice/authSlice";
import {configureStore} from '@reduxjs/toolkit';
import approvalReducer from "./approval/slice/approvalSlice";
import authReducer from "./slice/authSlice";

const store = configureStore({
    reducer : {
        auth : authReducer,
        approval : approvalReducer,
        
    }
});

export default store;