'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import {
  INDIA_CENTER,
  INDIA_ZOOM,
  TILE_ATTRIBUTION,
  TILE_URL,
  pinIcon,
} from '@/lib/leaflet-icon';
import { formatPrice, LISTING_TYPE_LABELS } from '@/lib/format';
import type { ListingCard } from '@/lib/types';

function FitBounds({ listings }: { listings: ListingCard[] }) {
  const map = useMap();
  // Refit only when the *set* of listings changes, not on every render.
  const key = useMemo(() => listings.map((l) => l.id).join(','), [listings]);
  useEffect(() => {
    if (listings.length === 0) return;
    const bounds = L.latLngBounds(listings.map((l) => [l.lat, l.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}

function FlyToSelected({ listing }: { listing: ListingCard | null }) {
  const map = useMap();
  useEffect(() => {
    if (listing) map.flyTo([listing.lat, listing.lng], 14, { duration: 0.6 });
  }, [listing, map]);
  return null;
}

export default function ExploreMap({
  listings,
  selectedId,
  onSelect,
  height = 560,
}: {
  listings: ListingCard[];
  selectedId?: number | null;
  onSelect?: (id: number) => void;
  height?: number;
}) {
  const selected = listings.find((l) => l.id === selectedId) ?? null;

  return (
    <div className="border-2 border-ink" style={{ height }}>
      <MapContainer
        center={INDIA_CENTER}
        zoom={INDIA_ZOOM}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <FitBounds listings={listings} />
        <FlyToSelected listing={selected} />
        {listings.map((l) => (
          <Marker
            key={l.id}
            position={[l.lat, l.lng]}
            icon={pinIcon(l.id === selectedId)}
            eventHandlers={{ click: () => onSelect?.(l.id) }}
          >
            <Popup>
              <div className="font-sans p-3 w-[200px]">
                <div className="text-[11px] font-bold uppercase tracking-label text-accent">
                  {LISTING_TYPE_LABELS[l.type]}
                </div>
                <div className="font-display text-base leading-tight mt-1 mb-1">{l.title}</div>
                <div className="text-sm font-bold">{formatPrice(l.price)}</div>
                {l.areaText && <div className="text-xs text-muted mt-0.5">{l.areaText}</div>}
                <Link
                  href={`/listings/${l.id}`}
                  className="inline-block mt-2 text-xs font-bold uppercase tracking-label text-ink border-b-2 border-accent hover:text-accent"
                >
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
