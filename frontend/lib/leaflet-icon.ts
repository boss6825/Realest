import L from 'leaflet';

/**
 * Custom sharp pin (square marker on a teardrop) so we don't depend on
 * Leaflet's default image assets — and it matches the VoiceBox look.
 */
export function pinIcon(active = false): L.DivIcon {
  const fill = active ? '#EF4444' : '#0A0A0A';
  return L.divIcon({
    className: 'realest-pin',
    html: `
      <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z"
              fill="${fill}" stroke="#FAFAFA" stroke-width="2"/>
        <rect x="9.5" y="9.5" width="11" height="11" fill="#FAFAFA"/>
      </svg>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -38],
  });
}

/** Default map view — centered on India. */
export const INDIA_CENTER: [number, number] = [22.9734, 78.6569];
export const INDIA_ZOOM = 5;

export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
