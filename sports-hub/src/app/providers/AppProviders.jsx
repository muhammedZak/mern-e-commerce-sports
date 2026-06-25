import ReduxProvider from './ReduxProvider';

export default function AppProviders({ children }) {
  return <ReduxProvider>{children}</ReduxProvider>;
}