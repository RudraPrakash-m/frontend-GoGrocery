import { createSlice } from '@reduxjs/toolkit';

if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('gogrocery_sales');
  } catch (_e) {
    // Ignore storage clear errors
  }
}

const salesSlice = createSlice({
  name: 'sales',
  initialState: {
    salesHistory: [],
  },
  reducers: {
    addSale: (state, action) => {
      state.salesHistory.unshift(action.payload);
    },
    clearSalesHistory: (state) => {
      state.salesHistory = [];
    },
  },
});

export const { addSale, clearSalesHistory } = salesSlice.actions;
export default salesSlice.reducer;
