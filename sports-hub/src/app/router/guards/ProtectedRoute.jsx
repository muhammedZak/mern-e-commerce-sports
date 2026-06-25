import { Navigate, Outlet } from 'react-router-dom';
import { PATHS } from '../paths';

export default function ProtectedRoute() {
  const isAuthenticated = false;

  if (!isAuthenticated) {
    return <Navigate to={PATHS.auth.login} replace />;
  }

  return <Outlet />;
}
