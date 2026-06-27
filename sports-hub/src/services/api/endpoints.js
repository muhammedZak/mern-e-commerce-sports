export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },

  PRODUCTS: {
    LIST: '/products',
    DETAILS: (id) => `/products/${id}`,
  },

  CART: {
    LIST: '/cart',
    ADD: '/cart',
    REMOVE: (id) => `/cart/${id}`,
  },

  WISHLIST: {
    LIST: '/wishlist',
    ADD: '/wishlist',
    REMOVE: (id) => `/wishlist/${id}`,
  },
};
