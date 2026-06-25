import { Outlet } from 'react-router-dom';

export default function AccountLayout() {
  return (
    <>
      <aside>Sidebar</aside>

      <main>
        <h2>Account Layout</h2>
        <Outlet />
      </main>
    </>
  );
}
