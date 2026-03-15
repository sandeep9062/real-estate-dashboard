import { useState } from "react";

interface GeolocationHook {
  location: { lat: number; lng: number } | null;
  error: string | null;
  loading: boolean;
  getLocation: (onSuccess: (coords: GeolocationCoordinates) => void) => void;
}

const useGeolocation = (): GeolocationHook => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getLocation = (onSuccess: (coords: GeolocationCoordinates) => void) => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      alert("Geolocation not supported by your browser.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setLoading(false);
        onSuccess(position.coords);
      },
      (geoError) => {
        let message = "Unable to fetch location.";
        if (geoError.code === geoError.PERMISSION_DENIED) {
            message = "Geolocation permission denied. Please enable it in your browser settings.";
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
            message = "Location information is unavailable.";
        } else if (geoError.code === geoError.TIMEOUT) {
            message = "The request to get user location timed out.";
        }
        setError(message);
        setLoading(false);
        alert(message); // Retain alert for immediate user feedback
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return { location, error, loading, getLocation };
};

export default useGeolocation;