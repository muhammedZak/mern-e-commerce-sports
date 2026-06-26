export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
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
