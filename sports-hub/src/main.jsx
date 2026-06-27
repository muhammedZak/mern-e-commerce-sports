import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { RouterProvider } from 'react-router-dom';

import { router } from './app/router';

import './index.css';

import AppProviders from './app/providers/AppProviders';
import App from './App.jsx';
import AuthInitializer from './features/auth/components/AuthInitializer';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router}>
        <App />
      </RouterProvider>
    </AppProviders>
  </StrictMode>,
);
