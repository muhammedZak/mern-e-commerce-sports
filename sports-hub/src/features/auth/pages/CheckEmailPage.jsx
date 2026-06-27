import { MailCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout';
import AuthHeader from '../components/AuthHeader';
import AuthFooter from '../components/AuthFooter';
import { PATHS } from '@/app/router/paths';

export default function CheckEmailPage() {
  const { state } = useLocation();

  const { email, title, description } = state;

  return (
    <AuthLayout>
      <AuthHeader
        title='Check Your Email'
        subtitle="We've sent you a verification link."
      />
      <div className='text-center'>
        <MailCheck className='mx-auto h-14 w-14 text-green-600' />

        <h1 className='mt-6 text-2xl font-bold'>{title}</h1>

        {email ? (
          <p className='mt-3 text-gray-600'>
            {description}
            <br />
            <strong>{email}</strong>
          </p>
        ) : (
          <p className='mt-3 text-gray-600'>
            We've sent a verification email. Please check your inbox.
          </p>
        )}

        <p className='mt-6 text-sm text-gray-500'>{description}</p>

        <AuthFooter
          text='Already verified your email?'
          linkText='Sign In'
          to={PATHS.auth.login}
        />
      </div>
    </AuthLayout>
  );
}
