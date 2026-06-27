import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getCurrentUser } from '../authThunks';

import { selectIsInitialized } from '../selectors';

import AppLoader from '@/components/common/AppLoader';

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const isInitialized = useSelector(selectIsInitialized);
  
  
  useEffect(() => {;
    dispatch(getCurrentUser());
  }, [dispatch]);

  if (!isInitialized) {
    return <AppLoader />;
  }

  return children;
}
