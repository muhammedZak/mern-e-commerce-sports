// app/router/paths.js

export const PATHS = {
  public: {
    home: '/',
    shop: '/shop',
    product: '/products/:slug',
    categories: '/categories',
    category: '/categories/:categorySlug',
    search: '/search',
    about: '/about',
    contact: '/contact',
    faq: '/faq',
  },

  auth: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    checkEmail: '/check-email',
    verifyEmail: '/verify-email',
    verifyPhone: '/verify-phone',
  },

  account: {
    root: '/account',
    dashboard: '',
    profile: 'profile',
    addresses: 'addresses',
    orders: 'orders',
    wishlist: 'wishlist',
    cart: 'cart',
    checkout: 'checkout',
    notifications: 'notifications',
  },

  admin: {
    root: '/admin',
    dashboard: '',
    products: 'products',
    categories: 'categories',
    orders: 'orders',
    customers: 'customers',
    coupons: 'coupons',
  },
};
