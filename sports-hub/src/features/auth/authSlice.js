import { createSlice } from '@reduxjs/toolkit';

import { REQUEST_STATUS } from '@/constants/requestStatus';
import { getCurrentUser, loginUser } from './authThunks';

const initialState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  status: REQUEST_STATUS.IDLE,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.status = REQUEST_STATUS.IDLE;
      state.error = null;
    },

    clearAuthError(state) {
      state.error = null;
    },

    resetAuthState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = REQUEST_STATUS.LOADING;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        state.status = REQUEST_STATUS.SUCCEEDED;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.status = REQUEST_STATUS.FAILED;
        state.error = action.payload;
      })

      .addCase(getCurrentUser.pending, (state) => {
        state.status = REQUEST_STATUS.LOADING;
      })

      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.error = null;
        state.status = REQUEST_STATUS.SUCCEEDED;
      })

      .addCase(getCurrentUser.rejected, (state) => {
        state.status = REQUEST_STATUS.FAILED;
        state.user = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
      });
  },
});

export const { logout, clearAuthError, resetAuthState } = authSlice.actions;
export default authSlice.reducer;
