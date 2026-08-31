import { createSlice } from '@reduxjs/toolkit';

const getInitialSales = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('gogrocery_sales');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading sales', e);
      }
    }
  }
  return [
    {
      id: 'inv-10244',
      invoiceNo: 'INV-10244',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: '12:30 PM',
      total: 108,
      subtotal: 108,
      discount: 0,
      paymentMode: 'UPI',
      itemsCount: 2,
      storeName: 'GoGrocery',
      address: 'Plot 21, Market Road, Bhubaneswar',
      phone: '7846807407',
      gstin: '21ABCDE1234F1Z5',
      items: [
        { id: 1, name: 'Amul Milk 1L', price: 68, qty: 1 },
        { id: 2, name: 'Britannia Bread', price: 40, qty: 1 },
      ],
    },
    {
      id: 'inv-10243',
      invoiceNo: 'INV-10243',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: '11:15 AM',
      total: 14,
      subtotal: 14,
      discount: 0,
      paymentMode: 'CASH',
      itemsCount: 1,
      storeName: 'GoGrocery',
      address: 'Plot 21, Market Road, Bhubaneswar',
      phone: '7846807407',
      gstin: '21ABCDE1234F1Z5',
      items: [{ id: 3, name: 'Maggi 70g', price: 14, qty: 1 }],
    },
  ];
};

const salesSlice = createSlice({
  name: 'sales',
  initialState: {
    salesHistory: getInitialSales(),
  },
  reducers: {
    addSale: (state, action) => {
      state.salesHistory.unshift(action.payload);
      if (typeof window !== 'undefined') {
        localStorage.setItem('gogrocery_sales', JSON.stringify(state.salesHistory));
      }
    },
  },
});

export const { addSale } = salesSlice.actions;
export default salesSlice.reducer;
