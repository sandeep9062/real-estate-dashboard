"use client";
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default icon issue with webpack
interface MapProps {
  setLocation?: (location: { lat: number; lng: number }) => void;
  location?: { lat: number; lng: number };
}

// Component to handle map centering
const MapCenterHandler = ({ position }: { position: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    if (map && position) {
      map.setView(position, 13);
    }
  }, [position, map]);

  return null;
};

const Map = ({ setLocation, location }: MapProps) => {
  const [position, setPosition] = useState<[number, number]>(
    location && location.lat && location.lng
      ? [location.lat, location.lng]
      : [30.751851738730274, 76.77228927612306]
  );
  
  const mapRef = useRef<any>(null);
  const [mapKey, setMapKey] = useState(0);

  // Update position when location prop changes
  useEffect(() => {
    if (location && location.lat && location.lng) {
      setPosition([location.lat, location.lng]);
    }
  }, [location]);

  // Force remount if map becomes corrupted
  useEffect(() => {
    const handleResize = () => {
      // Force map remount on window resize if needed
      setMapKey(prev => prev + 1);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        if (setLocation) {
          const { lat, lng } = e.latlng;
          setPosition([lat, lng]);
          setLocation({ lat, lng });
        }
      },
    });
    return null;
  };

  return (
    <div key={mapKey} style={{ height: "100%", width: "100%" }}>
      <MapContainer
        ref={mapRef}
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker
          position={position}
          icon={
            new L.Icon({
              iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
              iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
              shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })
          }
        ></Marker>
        <MapCenterHandler position={position} />
        <MapEvents />
      </MapContainer>
    </div>
  );
};

export default Map;
