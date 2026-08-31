import React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import store from '../../store';
import router from '../config/routes.config.jsx';
import '../../i18n';

const AppProviders = ({ children }) => {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
      {children}
      <Toaster position="top-right" richColors />
    </Provider>
  );
};

export default AppProviders;
