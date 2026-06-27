import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { FormField, SubmitButton } from '@/components/forms';

import { resetPasswordSchema } from '../validation';
import { resetPassword } from '../authThunks';
import { PATHS } from '@/app/router/paths';

export default function ResetPasswordForm({ token }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await dispatch(resetPassword({ token, ...data })).unwrap();

      navigate(PATHS.auth.login, {
        state: {
          message: 'Your password has been reset successfully. Please sign in.',
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
        label='New Password'
        type='password'
        placeholder='Enter your new password'
        required
        error={errors.password}
        {...register('password')}
      />

      <FormField
        label='Confirm Password'
        type='password'
        placeholder='Confirm your new password'
        required
        error={errors.confirmPassword}
        {...register('confirmPassword')}
      />

      {errors.root && (
        <div className='rounded-md bg-red-50 p-3 text-sm text-red-600'>
          {errors.root.message}
        </div>
      )}

      <SubmitButton loading={isSubmitting}>Reset Password</SubmitButton>
    </form>
  );
}
