import { createSlice } from '@reduxjs/toolkit';

import { REQUEST_STATUS } from '@/constants/requestStatus';
import { loginUser } from './authThunks';

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
      state.accessToken = null;
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
        state.status = REQUEST_STATUS.SUCCEEDED;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.status = REQUEST_STATUS.FAILED;
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError, resetAuthState } = authSlice.actions;
export default authSlice.reducer;
