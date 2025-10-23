// import authReducer from "./slice/authSlice";
import {configureStore} from '@reduxjs/toolkit';
import approvalReducer from "./groupware/approval/slice/approvalSlice";
import authReducer from "./slice/authSlice";
import hrReducer from "./hr/employee/slice/hrSlice";
import departmentReducer from "./hr/department/slice/departmentSlice";
import clientReducer from "./sales/slice/clientSlice";
import salesTargetReducer from "./sales/slice/salesTargetSlice";
import orderReducer from "./sales/slice/orderSlice";
import salesReducer from "./sales/slice/salesSlice";
import collectionReducer from "./sales/slice/collectionSlice";
import salesReportReducer from "./sales/slice/salesReportSlice";
import salesStatusReducer from "./sales/slice/salesStatusSlice";


const store = configureStore({
    reducer : {
        auth : authReducer,
        approval : approvalReducer,
        hr:hrReducer,
        department:departmentReducer,
        client: clientReducer,
        salesTarget: salesTargetReducer,
        order: orderReducer,    
        sales: salesReducer,    
        collection: collectionReducer,
        salesReport: salesReportReducer,
        salesStatus : salesStatusReducer
    }
});

export default store;