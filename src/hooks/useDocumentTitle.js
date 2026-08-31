import { useEffect } from 'react';

/**
 * Custom hook to dynamically update document title and OpenGraph metadata
 * @param {string} title - Page title
 * @param {string} suffix - App brand suffix (default 'GoGrocery')
 */
export const useDocumentTitle = (title, suffix = 'GoGrocery') => {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title ? `${title} | ${suffix}` : 'GoGrocery - Point of Sale & Grocery Store Management';

    return () => {
      document.title = originalTitle;
    };
  }, [title, suffix]);
};

export default useDocumentTitle;
