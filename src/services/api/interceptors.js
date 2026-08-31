import axiosInstance from './axiosInstance';

export const setupInterceptors = (store) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('gogrocery_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('gogrocery_token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
};
