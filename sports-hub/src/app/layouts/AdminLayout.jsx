import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <>
      <aside>Admin Sidebar</aside>

      <main>
        <h2>Admin Layout</h2>
        <Outlet />
      </main>
    </>
  );
}
