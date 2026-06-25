import AdminRoute from './guards/AdminRoute';
import AdminLayout from '../layouts/AdminLayout';

import DashboardPage from '@/features/admin/dashboard/DashboardPage';

import { PATHS } from './paths';

export const adminRoutes = [
  {
    path: PATHS.admin.root,
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
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
