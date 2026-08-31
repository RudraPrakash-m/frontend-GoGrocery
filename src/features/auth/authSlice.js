import { createSlice } from '@reduxjs/toolkit';

const initialToken = localStorage.getItem('gogrocery_token') || null;
const initialUser = JSON.parse(localStorage.getItem('gogrocery_user') || 'null');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    token: initialToken,
    isAuthenticated: !!initialToken || false,
    loading: false,
    authCheckComplete: false,
    error: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      const { user, token } = action.payload || {};
      state.user = user || state.user;
      state.token = token || state.token;
      state.isAuthenticated = true;
      state.authCheckComplete = true;
      state.error = null;
      if (token) localStorage.setItem('gogrocery_token', token);
      if (user) localStorage.setItem('gogrocery_user', JSON.stringify(user));
    },
    setUserProfile: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.authCheckComplete = true;
      state.error = null;
      localStorage.setItem('gogrocery_user', JSON.stringify(action.payload));
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAuthCheckComplete: (state, action) => {
      state.authCheckComplete = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.authCheckComplete = true;
      state.error = null;
      localStorage.removeItem('gogrocery_token');
      localStorage.removeItem('gogrocery_user');
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  loginSuccess,
  setUserProfile,
  setAuthLoading,
  setAuthCheckComplete,
  logout,
  setError,
} = authSlice.actions;

export default authSlice.reducer;
