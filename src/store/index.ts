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

// persist 
const persistConfig = {
    key: 'root',
    storage: mmkvStorage,
    whitelist: ['auth','payment'],
}

const rootReducer = combineReducers({
    auth: authReducer,
    dashboard: dashboardReducer,
    payment: paymentReducer
})
// payment: paymentReducer,
const persistedReducer = persistReducer(persistConfig, rootReducer);

// store
export const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({ serializableCheck: false, }).concat(logger)
})

export const persistor = persistStore(store)

// ─── Types ────────────────────────────────────────────────────────────────────
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch