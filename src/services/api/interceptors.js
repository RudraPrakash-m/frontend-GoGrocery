import axiosInstance from './axiosInstance';
import { logout } from '../../features/auth/authSlice';
import { toast } from 'sonner';

export const setupInterceptors = (store) => {
  // Request Interceptor (Cookies are sent automatically via withCredentials: true)
  axiosInstance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
  );

  // Response Interceptor (Handles 401 Unauthenticated & 403 Forbidden)
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      const isAuthRoute = ['/login', '/register', '/forgot-password'].includes(
        window.location.pathname
      );

      if (status === 401) {
        // Dispatch Redux logout action to clear state
        if (store?.dispatch) {
          store.dispatch(logout());
        }

        // Only alert and redirect if on a protected route to avoid spamming login form
        if (!isAuthRoute) {
          toast.error('Session expired or unauthenticated. Please log in again.');
          window.location.href = '/login';
        }
      } else if (status === 403) {
        toast.error('Access forbidden. You do not have permission to perform this action.');
      }

      return Promise.reject(error);
    }
  );
};

