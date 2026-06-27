import apiClient from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export const login = async (credentials) => {
  const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);

  return response.data;
};

export const register = async (userData) => {
  const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);

  return response.data;
};

export const logout = async () => {
  const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);

  return response.data;
};

export const getProfile = async () => {
  const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);

  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
    token,
  });

  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
    email,
  });

  return response.data;
};

export const resetPassword = async (data) => {
  const response = await apiClient.post(
    API_ENDPOINTS.AUTH.RESET_PASSWORD,
    data,
  );

  return response.data;
};
