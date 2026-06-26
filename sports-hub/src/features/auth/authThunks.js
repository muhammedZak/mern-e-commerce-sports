import { createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from './api/authService';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, thunkAPI) => {
    try {
      const data = await authService.login(credentials);

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Login failed',
      );
    }
  },
);
