import React from 'react';

import FormError from './FormError';
import FormInput from './FormInput';

export default function FormField({
  label,
  error,
  required = false,
  ...inputProps
}) {
  return (
    <div className='space-y-1'>
      <label className='font-medium'>
        {label}

        {required && <span className='text-red-500'> *</span>}
      </label>

      <FormInput {...inputProps} />

      <FormError error={error} />
    </div>
  );
}
