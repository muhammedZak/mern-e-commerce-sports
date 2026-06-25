import { Navigate, Outlet } from 'react-router-dom';
import { PATHS } from '../paths';

export default function GuestRoute() {
  const isAuthenticated = false;

  if (isAuthenticated) {
    return <Navigate to={PATHS.account.root} replace />;
  }

  return <Outlet />;
}
