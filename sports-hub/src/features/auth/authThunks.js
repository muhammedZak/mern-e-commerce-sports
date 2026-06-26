import { createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from './api/authService';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, thunkAPI) => {
    try {
      const response = await authService.login(credentials);

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Login failed',
      );
    }
  },
);
