import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/store/authSlice';
import uiReducer from '../features/ui/store/uiSlice';
import settingsReducer from '../features/settings/store/settingsSlice';
import salesReducer from '../features/sales/store/salesSlice';
import cartReducer from '../features/pos/store/cartSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  settings: settingsReducer,
  sales: salesReducer,
  cart: cartReducer,
});

export default rootReducer;
