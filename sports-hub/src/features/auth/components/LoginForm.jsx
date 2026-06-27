import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { FormField, SubmitButton } from '@/components/forms';

import { loginSchema } from '../validation';

import { loginUser } from '../authThunks';

import { selectAuthError, selectAuthStatus } from '../selectors';
import { REQUEST_STATUS } from '@/constants/requestStatus';
import { PATHS } from '@/app/router/paths';

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const status = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await dispatch(loginUser(data)).unwrap();

      navigate(PATHS.public.home);
    } catch (error) {}
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
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

      {authError && (
        <div className='rounded-md bg-red-50 p-3 text-sm text-red-600'>
          {authError}
        </div>
      )}

      <SubmitButton loading={status === REQUEST_STATUS.LOADING}>
        Login
      </SubmitButton>
    </form>
  );
}
