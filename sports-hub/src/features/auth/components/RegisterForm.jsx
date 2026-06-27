import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { FormField, SubmitButton } from '@/components/forms';

import { registerSchema } from '../validation';

import { registerUser } from '../authThunks';

import { REQUEST_STATUS } from '@/constants/requestStatus';
import { PATHS } from '@/app/router/paths';

export default function RegisterForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async ({ confirmPassword, ...data }) => {
    try {
      await dispatch(registerUser(data)).unwrap();

      navigate(PATHS.auth.checkEmail, {
        state: {
          email: data.email,
          title: 'Check your email',
          description: "We've sent a verification email to",
        },
      });
    } catch (error) {
      setError('root', {
        type: 'server',
        message: error,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5' noValidate>
      <FormField
        label='First name'
        placeholder='Enter your first name'
        required
        error={errors.firstName}
        {...register('firstName')}
      />

      <FormField
        label='Last name'
        placeholder='Enter your last name'
        required
        error={errors.lastName}
        {...register('lastName')}
      />
      <FormField
        label='Email'
        type='email'
        placeholder='Enter your email'
        required
        error={errors.email}
        {...register('email')}
      />

      <FormField
        label='Password'
        type='password'
        placeholder='Enter your password'
        required
        error={errors.password}
        {...register('password')}
      />

      <FormField
        label='Confirm password'
        type='password'
        placeholder='Confirm your password'
        required
        error={errors.confirmPassword}
        {...register('confirmPassword')}
      />

      {errors.root && (
        <div className='rounded-md bg-red-50 p-3 text-sm text-red-600'>
          {errors.root.message}
        </div>
      )}

      <SubmitButton loading={isSubmitting}>Register</SubmitButton>
    </form>
  );
}
