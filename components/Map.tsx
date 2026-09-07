"use client";
import { useEffect, useMemo, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface MapProps {
  setLocation?: (location: { lat: number; lng: number }) => void;
  location?: { lat: number; lng: number };
}

const DEFAULT_POSITION: [number, number] = [30.751851738730274, 76.77228927612306];

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const Map = ({ setLocation, location }: MapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  // Keep the latest setLocation in a ref so the click handler never goes stale
  // and never forces us to rebuild the map.
  const setLocationRef = useRef(setLocation);
  setLocationRef.current = setLocation;

  const position = useMemo<[number, number]>(() => {
    return location &&
      typeof location.lat === "number" &&
      typeof location.lng === "number"
      ? [location.lat, location.lng]
      : DEFAULT_POSITION;
  }, [location?.lat, location?.lng]);

  // Initialize the map exactly once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: position,
      zoom: 13,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    markerRef.current = L.marker(position, { icon: markerIcon }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      setLocationRef.current?.({
        lat: Number(e.latlng.lat.toFixed(6)),
        lng: Number(e.latlng.lng.toFixed(6)),
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pan map + move marker when coordinates change
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    map.setView(position, map.getZoom(), { animate: true });
    marker.setLatLng(position);
  }, [position]);

  return (
    <div
      ref={containerRef}
      style={{ height: "100%", width: "100%" }}
      className="leaflet-container"
    />
  );
};

export default Map;
