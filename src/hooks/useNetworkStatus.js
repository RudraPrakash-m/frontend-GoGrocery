import { useState, useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Custom hook to monitor network online/offline state with non-blocking toast notifications
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? window.navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Internet connection restored! Ready to sync.', {
        id: 'network-status',
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('No internet connection. Operating in local offline mode.', {
        id: 'network-status',
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export default useNetworkStatus;
