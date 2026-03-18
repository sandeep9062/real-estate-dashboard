"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), { ssr: false });

interface MapWrapperProps {
  setLocation?: (location: { lat: number; lng: number }) => void;
  location?: { lat: number; lng: number };
}

const MapWrapper = ({ setLocation, location }: MapWrapperProps) => {
  const [mapKey, setMapKey] = useState(0);

  // Force remount when location changes significantly
  useEffect(() => {
    if (location && location.lat && location.lng) {
      setMapKey((prev) => prev + 1);
    }
  }, [location?.lat, location?.lng]);

  return <Map key={mapKey} setLocation={setLocation} location={location} />;
};

export default MapWrapper;
