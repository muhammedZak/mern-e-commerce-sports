import React from 'react';

export default function SubmitButton({ loading, children }) {
  return (
    <button
      type='submit'
      disabled={loading}
      className='
        w-full
        rounded-lg
        bg-blue-600
        py-2
        text-white
        disabled:opacity-50
        disabled:cursor-not-allowed
      '>
      {loading ? 'Please wait...' : children}
    </button>
  );
}
