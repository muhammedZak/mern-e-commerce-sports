import apiClient from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export const login = async (credentials) => {
  const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
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
