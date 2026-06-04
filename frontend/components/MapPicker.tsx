'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import {
  INDIA_CENTER,
  INDIA_ZOOM,
  TILE_ATTRIBUTION,
  TILE_URL,
  pinIcon,
} from '@/lib/leaflet-icon';

export interface LatLng {
  lat: number;
  lng: number;
}

function ClickCapture({ onPick }: { onPick: (pos: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapPicker({
  value,
  onChange,
  height = 360,
}: {
  value: LatLng | null;
  onChange: (pos: LatLng) => void;
  height?: number;
}) {
  return (
    <div className="border-2 border-ink" style={{ height }}>
      <MapContainer
        center={value ? [value.lat, value.lng] : INDIA_CENTER}
        zoom={value ? 13 : INDIA_ZOOM}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <ClickCapture onPick={onChange} />
        {value && <Marker position={[value.lat, value.lng]} icon={pinIcon(true)} />}
      </MapContainer>
    </div>
  );
}
