import React from 'react';

export default function FormInput({ type = 'text', placeholder, ...props }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className='
        w-full
        rounded-lg
        border
        border-gray-300
        px-3
        py-2
        outline-none
        focus:border-blue-500
      '
      {...props}
    />
  );
}
