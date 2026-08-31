import { createSlice } from '@reduxjs/toolkit';

const getInitialSettings = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('gogrocery_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading settings', e);
      }
    }
  }
  return {
    storeName: 'GoGrocery',
    phone: '7846807407',
    email: 'merchant@gogrocery.in',
    shopCode: 'SHOP-8409',
    address: 'Plot 21, Market Road, Bhubaneswar',
    gstin: '21ABCDE1234F1Z5',
  };
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState: getInitialSettings(),
  reducers: {
    updateStoreDetails: (state, action) => {
      state.storeName = action.payload.storeName || state.storeName;
      state.phone = action.payload.phone || state.phone;
      state.email = action.payload.email || state.email;
      state.shopCode = action.payload.shopCode || state.shopCode;
      state.address = action.payload.address || state.address;
      state.gstin = action.payload.gstin || state.gstin;
      if (typeof window !== 'undefined') {
        localStorage.setItem('gogrocery_settings', JSON.stringify(state));
      }
    },
  },
});

export const { updateStoreDetails } = settingsSlice.actions;
export default settingsSlice.reducer;
