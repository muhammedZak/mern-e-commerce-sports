import { AxiosHeaders } from 'axios';

export const setupInterceptors = (
  axiosInstance,
  { getAccessToken, onUnauthorized } = {},
) => {
  const requestInterceptor = axiosInstance.interceptors.request.use(
    (config) => {
      const token = getAccessToken?.();

      if (token) {
        config.headers = config.headers ?? new AxiosHeaders();

        config.headers.set('Authorization', `Bearer ${token}`);
      }

      if (import.meta.env.DEV) {
        console.groupCollapsed(
          `➡️ ${config.method?.toUpperCase()} ${config.url}`,
        );

        console.log('Request Config:', config);

        console.groupEnd();
      }

      return config;
    },

    (error) => {
      if (import.meta.env.DEV) {
        console.error('❌ Request Error', error);
      }

      return Promise.reject(error);
    },
  );

  const responseInterceptor = axiosInstance.interceptors.response.use(
    (response) => {
      if (import.meta.env.DEV) {
        console.groupCollapsed(`✅ ${response.status} ${response.config.url}`);

        console.log('Response:', response);

        console.groupEnd();
      }

      return response;
    },

    async (error) => {
      if (import.meta.env.DEV) {
        console.groupCollapsed('❌ API Error');

        console.error(error);

        console.groupEnd();
      }

      const status = error.response?.status;

      if (status === 401) {
        onUnauthorized?.();
      }

      const normalizedError = {
        status,

        message:
          error.response?.data?.message ||
          error.message ||
          'Something went wrong',

        data: error.response?.data,

        originalError: error,
      };

      return Promise.reject(normalizedError);
    },
  );

  return () => {
    axiosInstance.interceptors.request.eject(requestInterceptor);

    axiosInstance.interceptors.response.eject(responseInterceptor);
  };
};
