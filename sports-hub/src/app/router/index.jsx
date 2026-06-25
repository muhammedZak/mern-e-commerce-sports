import { createBrowserRouter } from 'react-router-dom';

import { publicRoutes } from './public.routes';
import { guestRoutes } from './guest.routes';
import { accountRoutes } from './account.routes';
import { adminRoutes } from './admin.routes';

import NotFoundPage from '@/features/errors/pages/NotFoundPage';

export const router = createBrowserRouter([
  ...publicRoutes,
  ...guestRoutes,
  ...accountRoutes,
  ...adminRoutes,
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
