import ForgotPasswordForm from '../components/ForgotPasswordForm';
import AuthFooter from '../components/AuthFooter';
import AuthHeader from '../components/AuthHeader';
import AuthLayout from '../layouts/AuthLayout';
import { PATHS } from '@/app/router/paths';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <AuthHeader
        title='Forgot Password?'
        description="Enter your email address and we'll send you a password reset link."
      />

      <ForgotPasswordForm />

      <AuthFooter
        text='Remember your password?'
        linkText='Sign In'
        to={PATHS.auth.login}
      />
    </AuthLayout>
  );
}
