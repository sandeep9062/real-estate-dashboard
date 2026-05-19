"use client";
import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface MapProps {
  setLocation?: (location: { lat: number; lng: number }) => void;
  location?: { lat: number; lng: number };
}

const MapEvents = ({
  setLocation,
}: {
  setLocation?: (location: { lat: number; lng: number }) => void;
}) => {
  useMapEvents({
    click(e) {
      if (setLocation) {
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
};

const Map = ({ setLocation, location }: MapProps) => {
  const position = useMemo<[number, number]>(() => {
    return location &&
      typeof location.lat === "number" &&
      typeof location.lng === "number"
      ? [location.lat, location.lng]
      : [30.751851738730274, 76.77228927612306];
  }, [location?.lat, location?.lng]);

  // Use a stable key based on position so the MapContainer fully remounts
  // when coordinates change. This prevents "Map container is already initialized"
  // errors caused by React re-rendering a mounted MapContainer.
  const mapKey = useMemo(
    () => `${position[0].toFixed(4)}-${position[1].toFixed(4)}`,
    [position],
  );

  const markerIcon = useMemo(
    () =>
      new L.Icon({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }),
    [],
  );

  return (
    <MapContainer
      key={mapKey}
      center={position}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position} icon={markerIcon} />
      <MapEvents setLocation={setLocation} />
    </MapContainer>
  );
};

export default Map;
