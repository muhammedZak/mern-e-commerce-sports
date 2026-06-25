import { Navigate, Outlet } from 'react-router-dom';
import { PATHS } from '../paths';

export default function AdminRoute() {
  const isAuthenticated = false;
  const role = 'customer';

  if (!isAuthenticated) {
    return <Navigate to={PATHS.auth.login} replace />;
  }

  if (role !== 'admin') {
    return <Navigate to='/403' replace />;
  }

  return <Outlet />;
}
