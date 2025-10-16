// import authReducer from "./slice/authSlice";
import {configureStore} from '@reduxjs/toolkit';
import approvalReducer from "./groupware/approval/slice/approvalSlice";
import authReducer from "./slice/authSlice";
import hrReducer from "./hr/employee/slice/hrSlice";
import departmentReducer from "./hr/department/slice/departmentSlice";

const store = configureStore({
    reducer : {
        auth : authReducer,
        approval : approvalReducer,
        hr:hrReducer,
        department:departmentReducer,
        
    }
});

export default store;