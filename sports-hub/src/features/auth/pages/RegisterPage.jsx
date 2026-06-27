import React from 'react';
import AuthLayout from '../layouts/AuthLayout';
import AuthHeader from '../components/AuthHeader';
import RegisterForm from '../components/RegisterForm';
import AuthFooter from '../components/AuthFooter';
import { PATHS } from '@/app/router/paths';

export default function RegisterPage() {
  return (
    <AuthLayout>
      <AuthHeader title='Create Account' subtitle='Join Sports Store today.' />
      <RegisterForm />
      <AuthFooter
        text='Already have an account?'
        linkText='Sign In'
        to={PATHS.auth.login}
      />
    </AuthLayout>
  );
}
