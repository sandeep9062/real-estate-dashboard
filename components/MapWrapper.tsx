"use client";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), { ssr: false });

interface MapWrapperProps {
  setLocation?: (location: { lat: number; lng: number }) => void;
  location?: { lat: number; lng: number };
}

const MapWrapper = ({ setLocation, location }: MapWrapperProps) => {
  return <Map setLocation={setLocation} location={location} />;
};

export default MapWrapper;
