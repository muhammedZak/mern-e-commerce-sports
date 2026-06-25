import AuthLayout from '../layouts/AuthLayout';

import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';

import { PATHS } from './paths';
import GuestRoute from './guards/GuestRoute';

export const guestRoutes = [
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: PATHS.auth.login,
            element: <LoginPage />,
          },
          {
            path: PATHS.auth.register,
            element: <RegisterPage />,
          },
        ],
      },
    ],
  },
];
