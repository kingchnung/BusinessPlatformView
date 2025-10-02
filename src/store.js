import {loginSlice} from './slice/loginSlice';
import {configureStore} from '@reduxjs/toolkit';

export default configureStore({
    reducer : {
        "loginSlice" : loginSlice
    }
});