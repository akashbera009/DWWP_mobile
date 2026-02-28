import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import logger from 'redux-logger';
//Reducers
// import authReducer from '../modules/auth/authSlice';
// import cartReducer from '../modules/cart/cartSlice';
// //Storage
import mmkvStorage from '../utils/mmkvStorage';

const persistConfig = {
  key: 'root',
  storage: mmkvStorage,
  whitelist: ['auth', 'cart'], // add 'settings' for tutorial persistence
};

const rootReducer = combineReducers({
//   auth: authReducer,
//   cart: cartReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({ serializableCheck: false }).concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persister = persistStore(store);

export default store;