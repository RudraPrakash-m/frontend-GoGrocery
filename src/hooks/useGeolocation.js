import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Custom hook to request browser GPS coordinates and reverse-geocode into a street address
 */
const useGeolocation = () => {
  const [loading, setLoading] = useState(false);

  const getCurrentAddress = (onSuccess) => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Free OpenStreetMap Nominatim reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data && data.display_name) {
            const formatted =
              data.display_name ||
              [data.address?.road, data.address?.suburb, data.address?.city, data.address?.postcode]
                .filter(Boolean)
                .join(', ');

            if (onSuccess) onSuccess(formatted);
            toast.success('Location detected successfully!');
          } else {
            toast.error('Could not determine exact street address. Please enter manually.');
          }
        } catch (_err) {
          toast.error('Failed to fetch address details. Please type manually.');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location permission denied. Please type your address manually.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          toast.error('Location information unavailable. Please type manually.');
        } else if (error.code === error.TIMEOUT) {
          toast.error('Location request timed out. Please try again or type manually.');
        } else {
          toast.error('Unable to fetch location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  return {
    getCurrentAddress,
    loading,
  };
};

export default useGeolocation;
