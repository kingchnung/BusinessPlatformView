// import authReducer from "./slice/authSlice";
import {configureStore} from '@reduxjs/toolkit';
import approvalReducer from "./slice/approvalSlice";
import loginReducer from "./slice/loginSlice";

const store = configureStore({
    reducer : {
        login : loginReducer,
        approval : approvalReducer,
        
    }
});

export default store;