import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'gogrocery_pos_cart';

// Load cart from sessionStorage for persistence across page navigation and refreshes
const loadInitialCart = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.items)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load POS cart from storage:', err);
  }
  return {
    items: [{ id: 1, name: 'Maggi 70g', price: 14, qty: 1, barcode: '8901234567890', unit: 'Pack' }],
    paymentMode: 'UPI',
    activeStep: 'cart', // 'cart' | 'payment' | 'completed'
    discount: 0,
  };
};

const saveCartToStorage = (state) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save POS cart to storage:', err);
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadInitialCart(),
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const availableStock =
        product.stock !== undefined ? Number(product.stock) : Infinity;

      const existingIndex = state.items.findIndex(
        (item) =>
          item.id === product.id ||
          item.id === product._id ||
          (product.barcode && item.barcode === product.barcode)
      );

      if (existingIndex > -1) {
        const currentItem = state.items[existingIndex];
        const itemStock =
          currentItem.stock !== undefined
            ? Number(currentItem.stock)
            : availableStock;
        const newQty = currentItem.qty + (product.qty || 1);
        state.items[existingIndex].qty = Math.min(newQty, itemStock);
        if (currentItem.stock === undefined && product.stock !== undefined) {
          state.items[existingIndex].stock = Number(product.stock);
        }
      } else {
        const initialQty = Math.min(product.qty || 1, availableStock);
        if (initialQty > 0) {
          state.items.push({
            id: product.id || product._id || Date.now(),
            name: product.name,
            price: Number(product.sellingPrice || product.price) || 0,
            qty: initialQty,
            stock: availableStock,
            barcode: product.barcode,
            unit: product.unit || 'Pcs',
          });
        }
      }
      saveCartToStorage(state);
    },

    updateCartQty: (state, action) => {
      const { id, qty } = action.payload;
      const index = state.items.findIndex((item) => item.id === id);
      if (index > -1) {
        if (qty <= 0) {
          state.items.splice(index, 1);
        } else {
          const maxStock =
            state.items[index].stock !== undefined
              ? Number(state.items[index].stock)
              : Infinity;
          state.items[index].qty = Math.min(qty, maxStock);
        }
      }
      saveCartToStorage(state);
    },

    removeFromCart: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((item) => item.id !== id);
      saveCartToStorage(state);
    },

    setPaymentMode: (state, action) => {
      state.paymentMode = action.payload;
      saveCartToStorage(state);
    },

    setActiveStep: (state, action) => {
      state.activeStep = action.payload;
      saveCartToStorage(state);
    },

    setDiscount: (state, action) => {
      state.discount = Number(action.payload) || 0;
      saveCartToStorage(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.activeStep = 'cart';
      state.discount = 0;
      saveCartToStorage(state);
    },
  },
});

export const {
  addToCart,
  updateCartQty,
  removeFromCart,
  setPaymentMode,
  setActiveStep,
  setDiscount,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
