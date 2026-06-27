import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import {
  selectIsAuthenticated,
  selectIsInitialized,
} from '@/features/auth/selectors';

import AppLoader from '@/components/common/AppLoader';

import { PATHS } from '../paths';

export default function ProtectedRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const isInitialized = useSelector(selectIsInitialized);

  if(!isInitialized){
    return <AppLoader/>
  }

  if (!isAuthenticated) {
    return <Navigate to={PATHS.auth.login} replace />;
  }

  return <Outlet />;
}
