import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import MainLayout from '../../components/layout/MainLayout';
import LoginPage from '../../features/auth/pages/LoginPage';
import RegisterPage from '../../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../../features/auth/pages/ForgotPasswordPage';
import DashboardPage from '../../features/dashboard/pages/DashboardPage';
import POSPage from '../../features/pos/pages/POSPage';
import AddStockPage from '../../features/inventory/pages/AddStockPage';
import ProductsPage from '../../features/products/pages/ProductsPage';
import SalesPage from '../../features/sales/pages/SalesPage';
import ReportsPage from '../../features/reports/pages/ReportsPage';
import SettingsPage from '../../features/settings/pages/SettingsPage';
import HelpPage from '../../features/help/pages/HelpPage';
import MorePage from '../../features/more/pages/MorePage';
import ErrorPage from '../../features/error/pages/ErrorPage';

// Protected Route Wrapper for Data Router
const ProtectedLayout = () => {
  const { isAuthenticated } = useSelector((state) => state.auth || {});

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout />;
};

// Data Router Definition using createBrowserRouter
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/',
    element: <ProtectedLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'pos',
        element: <POSPage />,
      },
      {
        path: 'inventory/add',
        element: <AddStockPage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'sales',
        element: <SalesPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'help',
        element: <HelpPage />,
      },
      {
        path: 'more',
        element: <MorePage />,
      },
    ],
  },
  {
    path: '*',
    element: <ErrorPage />,
  },
]);

export default router;
