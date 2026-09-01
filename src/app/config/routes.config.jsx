import React, { useEffect, useState, Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import MainLayout from '../../components/layout/MainLayout';
import Loader from '../../components/common/Loader';
import { authService } from '../../features/auth/services/authService';
import { setUserProfile, logout } from '../../features/auth/authSlice';
import { updateStoreDetails } from '../../features/settings/store/settingsSlice';

// Lazy Loaded Route Chunks for Fast Initial Page Load
const LoginPage = lazy(() => import('../../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../../features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../../features/auth/pages/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('../../features/dashboard/pages/DashboardPage'));
const POSPage = lazy(() => import('../../features/pos/pages/POSPage'));
const AddStockPage = lazy(() => import('../../features/inventory/pages/AddStockPage'));
const ProductsPage = lazy(() => import('../../features/products/pages/ProductsPage'));
const SalesPage = lazy(() => import('../../features/sales/pages/SalesPage'));
const ReportsPage = lazy(() => import('../../features/reports/pages/ReportsPage'));
const SettingsPage = lazy(() => import('../../features/settings/pages/SettingsPage'));
const HelpPage = lazy(() => import('../../features/help/pages/HelpPage'));
const MorePage = lazy(() => import('../../features/more/pages/MorePage'));
const ErrorPage = lazy(() => import('../../features/error/pages/ErrorPage'));

// Helper Wrapper for Suspense Fallbacks
const LazyRoute = ({ children }) => (
  <Suspense fallback={<Loader text="Loading page..." />}>
    {children}
  </Suspense>
);

// Protected Route Wrapper for Data Router (Verifies HTTP-Only Cookies & Bearer Tokens)
const ProtectedLayout = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, authCheckComplete } = useSelector((state) => state.auth || {});
  const [checkingAuth, setCheckingAuth] = useState(!authCheckComplete);
  const [loaderSubtext, setLoaderSubtext] = useState('');

  useEffect(() => {
    let isMounted = true;
    let timer1, timer2;

    if (!authCheckComplete) {
      timer1 = setTimeout(() => {
        if (isMounted) setLoaderSubtext('Connecting to server...');
      }, 3000);

      timer2 = setTimeout(() => {
        if (isMounted)
          setLoaderSubtext(
            'Waking up cloud server (Render free tier backends may take 15-30s on cold start)...'
          );
      }, 8000);
    }

    const checkSession = async () => {
      try {
        // Call GET /api/auth/me using HTTP-only cookie or Bearer token
        const res = await authService.getMe();
        if (isMounted) {
          const userObj = res?.user || res?.data?.user || res?.data || res;
          dispatch(setUserProfile(userObj));
          dispatch(updateStoreDetails(userObj));
        }
      } catch (err) {
        if (isMounted) {
          dispatch(logout());
        }
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
        }
      }
    };

    if (!authCheckComplete) {
      checkSession();
    } else {
      setCheckingAuth(false);
    }

    return () => {
      isMounted = false;
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [authCheckComplete, dispatch]);

  if (checkingAuth) {
    return <Loader text="Verifying session..." subtext={loaderSubtext} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout />;
};

// Data Router Definition using createBrowserRouter
export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <LazyRoute>
        <LoginPage />
      </LazyRoute>
    ),
    errorElement: (
      <LazyRoute>
        <ErrorPage />
      </LazyRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <LazyRoute>
        <RegisterPage />
      </LazyRoute>
    ),
    errorElement: (
      <LazyRoute>
        <ErrorPage />
      </LazyRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <LazyRoute>
        <ForgotPasswordPage />
      </LazyRoute>
    ),
    errorElement: (
      <LazyRoute>
        <ErrorPage />
      </LazyRoute>
    ),
  },
  {
    path: '/',
    element: <ProtectedLayout />,
    errorElement: (
      <LazyRoute>
        <ErrorPage />
      </LazyRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <LazyRoute>
            <DashboardPage />
          </LazyRoute>
        ),
      },
      {
        path: 'pos',
        element: (
          <LazyRoute>
            <POSPage />
          </LazyRoute>
        ),
      },
      {
        path: 'inventory/add',
        element: (
          <LazyRoute>
            <AddStockPage />
          </LazyRoute>
        ),
      },
      {
        path: 'products',
        element: (
          <LazyRoute>
            <ProductsPage />
          </LazyRoute>
        ),
      },
      {
        path: 'sales',
        element: (
          <LazyRoute>
            <SalesPage />
          </LazyRoute>
        ),
      },
      {
        path: 'reports',
        element: (
          <LazyRoute>
            <ReportsPage />
          </LazyRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <LazyRoute>
            <SettingsPage />
          </LazyRoute>
        ),
      },
      {
        path: 'help',
        element: (
          <LazyRoute>
            <HelpPage />
          </LazyRoute>
        ),
      },
      {
        path: 'more',
        element: (
          <LazyRoute>
            <MorePage />
          </LazyRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <LazyRoute>
        <ErrorPage />
      </LazyRoute>
    ),
  },
]);

export default router;
