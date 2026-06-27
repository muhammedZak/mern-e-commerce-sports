import { Outlet } from 'react-router-dom';

import AuthInitializer from '@/features/auth/components/AuthInitializer';

export default function AppShell() {
  return (
    <AuthInitializer>
      <Outlet />
    </AuthInitializer>
  );
}
