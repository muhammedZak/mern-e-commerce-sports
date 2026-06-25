import { configureStore } from '@reduxjs/toolkit';

import rootReducer from './rootReducer';

import middleware from './middleware';

export const store = configureStore({
  reducer: rootReducer,
  middleware,
  devTools: import.meta.env.NODE_ENV !== 'production',
});
