import React from 'react';

export default function AuthLayout({ children }) {
  return (
    <main className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10'>
      <div className='w-full max-w-md rounded-xl border bg-white p-8 shadow-sm'>
        {children}
      </div>
    </main>
  );
}
