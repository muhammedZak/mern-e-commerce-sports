import { REQUEST_STATUS } from '@/constants/requestStatus';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  accessToken: null,
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
});

export const { logout, clearAuthError, resetAuthState } = authSlice.actions;
export default authSlice.reducer;
