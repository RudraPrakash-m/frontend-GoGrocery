import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import { setupInterceptors } from '../services/api/interceptors';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

setupInterceptors(store);

export default store;
