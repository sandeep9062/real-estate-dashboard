"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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
  // Use useMemo to prevent unnecessary re-renders when location changes
  const initialPosition = useMemo<[number, number]>(() => {
    return location && location.lat && location.lng
      ? [location.lat, location.lng]
      : [30.751851738730274, 76.77228927612306];
  }, [location?.lat, location?.lng]);

  const [position, setPosition] = useState<[number, number]>(initialPosition);
  const [shouldRenderMap, setShouldRenderMap] = useState(false);

  const mapRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update position when location prop changes
  useEffect(() => {
    if (location && location.lat && location.lng) {
      setPosition([location.lat, location.lng]);
      // Only render map after location is available
      setShouldRenderMap(true);
    } else {
      setShouldRenderMap(false);
    }
  }, [location?.lat, location?.lng]);

  // Cleanup function to prevent duplicate initialization
  const cleanupMap = useCallback(() => {
    if (mapRef.current) {
      try {
        // Remove any existing map instance
        if (mapRef.current._container) {
          mapRef.current.remove();
        }
        mapRef.current = null;
      } catch (error) {
        console.warn("Error cleaning up map:", error);
      }
    }
    isInitializedRef.current = false;
  }, []);

  // Initialize map with proper cleanup
  useEffect(() => {
    return () => {
      cleanupMap();
    };
  }, [cleanupMap]);

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

  // Only render the map when we have valid coordinates
  if (!shouldRenderMap) {
    return (
      <div
        ref={containerRef}
        style={{
          height: "100%",
          width: "100%",
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "#6b7280" }}>
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>🗺️</div>
          <div>Map will load when location is set</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ height: "100%", width: "100%" }}>
      <MapContainer
        ref={(ref) => {
          if (ref && !isInitializedRef.current) {
            // Clean up any existing map instance before setting new one
            cleanupMap();
            mapRef.current = ref;
            isInitializedRef.current = true;
          }
        }}
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        whenReady={() => {
          if (mapRef.current) {
            isInitializedRef.current = true;
          }
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker
          position={position}
          icon={
            new L.Icon({
              iconUrl:
                "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
              iconRetinaUrl:
                "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
              shadowUrl:
                "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
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
