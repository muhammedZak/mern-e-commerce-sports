import { Link, Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <>
      <nav style={{ display: 'flex', gap: '20px' }}>
        <Link to='/'>Home</Link>
        <Link to='/shop'>Shop</Link>
        <Link to='/products/123'>Product</Link>
        <Link to='/login'>Login</Link>
        <Link to='/register'>Register</Link>
        <Link to='/account'>Account</Link>
        <Link to='/admin'>Admin</Link>
      </nav>
      <hr />

      <h2>Public Layout</h2>
      <Outlet />

      <footer>Footer</footer>
    </>
  );
}
