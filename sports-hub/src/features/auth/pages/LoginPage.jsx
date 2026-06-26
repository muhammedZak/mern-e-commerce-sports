import React from 'react';

import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  return (
    <main className='flex min-h-screen items-center justify-center bg-gray-100 px-4'>
      <div className='w-full max-w-md rounded-lg bg-white p-8 shadow'>
        <h1 className='mb-2 text-3xl font-bold'>Welcome Back</h1>

        <p className='mb-6 text-gray-500'>Sign in to continue shopping.</p>

        <LoginForm />
      </div>
    </main>
  );
}
