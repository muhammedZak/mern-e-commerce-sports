import { useSearchParams } from 'react-router-dom';

import AuthHeader from '../components/AuthHeader';
import AuthFooter from '../components/AuthFooter';
import ResetPasswordForm from '../components/ResetPasswordForm';
import AuthLayout from '../layouts/AuthLayout';
import { PATHS } from '@/app/router/paths';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  if (!token) {
    return (
      <AuthLayout>
        <AuthHeader
          title='Invalid Reset Link'
          description='This password reset link is invalid or has expired.'
        />

        <AuthFooter text='Back to' linkText='Sign In' to='/login' />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthHeader
        title='Reset Password'
        description='Enter your new password below.'
      />

      <ResetPasswordForm token={token} />

      <AuthFooter
        text='Remember your password?'
        linkText='Sign In'
        to={PATHS.auth.login}
      />
    </AuthLayout>
  );
}
