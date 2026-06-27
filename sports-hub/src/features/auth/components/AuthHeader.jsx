import React from 'react';

export default function AuthHeader({ title, subtitle }) {
  return (
    <header className='mb-8 text-center'>
      <h1 className='text-3xl font-bold'>{title}</h1>
      {subtitle && <p className='mt-2 text-sm text-gray-600'>{subtitle}</p>}
    </header>
  );
}
