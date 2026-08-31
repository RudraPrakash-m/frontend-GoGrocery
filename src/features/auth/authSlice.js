import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    authCheckComplete: false,
    error: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      const user = action.payload?.user || action.payload || state.user;
      state.user = user;
      state.isAuthenticated = true;
      state.authCheckComplete = true;
      state.error = null;
    },
    setUserProfile: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.authCheckComplete = true;
      state.error = null;
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAuthCheckComplete: (state, action) => {
      state.authCheckComplete = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.authCheckComplete = true;
      state.error = null;
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

