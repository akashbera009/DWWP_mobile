/**
 * store/index.ts
 *
 * RTK store with MMKV-backed redux-persist.
 *
 * Deps:
 *   npm install @reduxjs/toolkit react-redux redux-persist react-native-mmkv
 */

import { configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import logger from 'redux-logger'
import { combineReducers } from '@reduxjs/toolkit'

import mmkvStorage from "../utils/mmkvStorage";

import authReducer from '@dwwp/modules/auth/authSlice'
import dashboardReducer from '@dwwp/modules/dashboard/dashboardSlice'
import paymentReducer from '@dwwp/modules/paymentsDashboard/paymentSlice'
import servoReducer from '@dwwp/modules/dashboard/servoSlice'
import usageReducer from '@dwwp/modules/dashboard/usageSlice'
import  notificationReducer from '@dwwp/modules/dashboard/Notificationslice'

import {
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist'

// persist 
const persistConfig = {
    key: 'root',
    storage: mmkvStorage,
    whitelist: ['auth', 'usage' ,'dashboard'],
}

const rootReducer = combineReducers({
    auth: authReducer,
    dashboard: dashboardReducer,
    payment: paymentReducer,
    servo: servoReducer,
    usage: usageReducer,
    notification : notificationReducer
})
// payment: paymentReducer,
const persistedReducer = persistReducer(persistConfig, rootReducer);

// store
export const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(logger)
})

export const persistor = persistStore(store)

// ─── Types ────────────────────────────────────────────────────────────────────
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch