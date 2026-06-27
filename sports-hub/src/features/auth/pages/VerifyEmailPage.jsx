import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout';
import AuthHeader from '../components/AuthHeader';

import { verifyEmail } from '../authThunks';
import AuthFooter from '../components/AuthFooter';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  const dispatch = useDispatch();

  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing.');
        return;
      }

      try {
        await dispatch(verifyEmail(token)).unwrap();

        setStatus('success');
      } catch (error) {
        console.log(error);
        setStatus('error');
        setMessage(error);
      }
    };

    verify();
  }, [dispatch, token]);

  if (status === 'loading') {
    return (
      <AuthLayout>
        <p>Verifying your email...</p>
      </AuthLayout>
    );
  }

  if (status === 'error') {
    return (
      <AuthLayout>
        <h1>Verification Failed</h1>

        <p>{message}</p>

        <AuthFooter text='Back to' linkText='Sign In' to='/login' />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1>Email Verified</h1>

      <p>Your email has been verified successfully.</p>

      <AuthFooter text='Continue to' linkText='Sign In' to='/login' />
    </AuthLayout>
  );
}
