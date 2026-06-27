import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { FormField, SubmitButton } from '@/components/forms';

import { forgotPasswordSchema } from '../validation';

import { forgotPassword } from '../authThunks';
import { PATHS } from '@/app/router/paths';

export default function ForgotPasswordForm() {
  const dipatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async ({ email }) => {
    try {
      await dipatch(forgotPassword(email)).unwrap();

      navigate(PATHS.auth.checkEmail, {
        state: {
          email,
          title: 'Check your email',
          description:
            "We've sent a password reset link to your email address.",
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
        label='Email'
        type='email'
        placeholder='Enter your email'
        required
        error={errors.email}
        {...register('email')}
      />

      {errors.root && (
        <div className='rounded-md bg-red-50 p-3 text-sm text-red-600'>
          {errors.root.message}
        </div>
      )}

      <SubmitButton loading={isSubmitting}>Send Reset Link</SubmitButton>
    </form>
  );
}
