import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import useNetworkStatus from '../../hooks/useNetworkStatus';
import GlobalProgressBar from '../common/GlobalProgressBar';
import { PRODUCT_QUERY_KEYS } from '../../features/products/hooks/useProductsQuery';
import { productService } from '../../features/products/services/productService';
import { preloadAllRoutes } from '../../app/utils/routePreloader';

const MainLayout = () => {
  // Monitor real-time online/offline network transitions
  useNetworkStatus();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Background prefetch catalog & routes for instant 0ms tab transitions
    preloadAllRoutes();
    queryClient.prefetchQuery({
      queryKey: PRODUCT_QUERY_KEYS.list({ search: '', filter: 'all', category: '' }),
      queryFn: () => productService.getProducts({ search: '', filter: 'all', category: '' }),
      staleTime: 1000 * 60 * 3,
    });
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      <GlobalProgressBar />
      <Sidebar />
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-10 pb-28 md:pb-10 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default MainLayout;
