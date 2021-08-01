import { setupReducer } from "./setupSlice"

import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { authenticationReducer } from "./authenticationSlice";


export const store = configureStore({
    reducer:{
        setupReducer: setupReducer,
        authenticationReducer: authenticationReducer
    },
    middleware: getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false   
    })
})