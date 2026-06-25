import ProtectedRoute from './guards/ProtectedRoute';
import AccountLayout from '../layouts/AccountLayout';

import DashboardPage from '@/features/profile/pages/DashboardPage';

import { PATHS } from './paths';

export const accountRoutes = [
  {
    path: PATHS.account.root,
    element: <ProtectedRoute />,
    children: [
      {
        element: <AccountLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
        ],
      },
    ],
  },
];
