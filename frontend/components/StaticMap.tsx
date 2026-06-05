'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { TILE_ATTRIBUTION, TILE_URL, pinIcon } from '@/lib/leaflet-icon';

export default function StaticMap({
  lat,
  lng,
  height = 280,
  zoom = 14,
}: {
  lat: number;
  lng: number;
  height?: number;
  zoom?: number;
}) {
  return (
    <div className="border-2 border-ink" style={{ height }}>
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <Marker position={[lat, lng]} icon={pinIcon(true)} />
      </MapContainer>
    </div>
  );
}
