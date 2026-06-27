import { useLocation } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout';

import LoginForm from '../components/LoginForm';
import AuthHeader from '../components/AuthHeader';
import AuthFooter from '../components/AuthFooter';
import AuthLink from '../components/AuthLink';

import { PATHS } from '@/app/router/paths';

export default function LoginPage() {
  const { state } = useLocation();

  const successMessage = state?.message;

  return (
    <AuthLayout>
      <AuthHeader
        title='Welcome Back'
        subtitle='Sign in to continue shopping.'
      />

      {successMessage && (
        <div className='mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700'>
          {successMessage}
        </div>
      )}

      <LoginForm />

      <AuthLink to={PATHS.auth.forgotPassword}>Forgot password?</AuthLink>

      <AuthFooter
        text="Don't have an account?"
        linkText='Create Account'
        to={PATHS.auth.register}
      />
    </AuthLayout>
  );
}
