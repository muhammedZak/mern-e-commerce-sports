import AuthLayout from '../layouts/AuthLayout';
import GuestRoute from './guards/GuestRoute';

import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import CheckEmailPage from '@/features/auth/pages/CheckEmailPage';
import VerifyEmailPage from '@/features/auth/pages/VerifyEmailPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';

import { PATHS } from './paths';

export const guestRoutes = [
  {
    element: <GuestRoute />,
    children: [
      {
        path: PATHS.auth.login,
        element: <LoginPage />,
      },
      {
        path: PATHS.auth.register,
        element: <RegisterPage />,
      },
      {
        path: PATHS.auth.checkEmail,
        element: <CheckEmailPage />,
      },
      {
        path: PATHS.auth.verifyEmail,
        element: <VerifyEmailPage />,
      },
      {
        path: PATHS.auth.forgotPassword,
        element: <ForgotPasswordPage />,
      },
      {
        path: PATHS.auth.resetPassword,
        element: <ResetPasswordPage />,
      },
    ],
    // children: [
    //   {
    //     element: <AuthLayout />,
    //     children: [
    //       {
    //         path: PATHS.auth.login,
    //         element: <LoginPage />,
    //       },
    //       {
    //         path: PATHS.auth.register,
    //         element: <RegisterPage />,
    //       },
    //     ],
    //   },
    // ],
  },
];
