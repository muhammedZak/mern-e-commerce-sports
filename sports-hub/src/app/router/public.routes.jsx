import PublicLayout from '../layouts/PublicLayout';

import HomePage from '@/features/products/pages/HomePage';
import ShopPage from '@/features/products/pages/ShopPage';
import ProductDetailsPage from '@/features/products/pages/ProductDetailsPage';

import { PATHS } from './paths';

export const publicRoutes = [
  {
    path: PATHS.public.home,
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: PATHS.public.shop, element: <ShopPage /> },
      { path: PATHS.public.product, element: <ProductDetailsPage /> },
    ],
  },
];
