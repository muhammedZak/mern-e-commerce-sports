import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import {
  selectIsAuthenticated,
  selectIsInitialized,
} from '@/features/auth/selectors';

import AppLoader from '@/components/common/AppLoader';

import { PATHS } from '../paths';

export default function GuestRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const isInitialized = useSelector(selectIsInitialized);

  if (!isInitialized) {
    return <AppLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={PATHS.account.root} replace />;
  }

  return <Outlet />;
}
