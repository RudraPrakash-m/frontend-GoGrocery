import React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import store from '../../store';
import router from '../config/routes.config.jsx';
import QueryProvider from './QueryProvider';
import '../../i18n';

const AppProviders = ({ children }) => {
  return (
    <Provider store={store}>
      <QueryProvider>
        <RouterProvider router={router} />
        {children}
        <Toaster position="top-right" richColors />
      </QueryProvider>
    </Provider>
  );
};

export default AppProviders;
