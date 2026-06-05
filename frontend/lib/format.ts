import type { ListingType } from './types';

/** Format whole rupees the Indian way: lakhs / crores. */
export function formatPrice(price?: number | null): string {
  if (price == null) return 'Price on request';
  if (price >= 10000000) return `₹${trim(price / 10000000)} Cr`;
  if (price >= 100000) return `₹${trim(price / 100000)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

function trim(n: number): string {
  // Up to 2 decimals, but drop trailing zeros (1.50 -> 1.5, 2.00 -> 2).
  return Number(n.toFixed(2)).toString();
}

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  agricultural: 'Agricultural',
  residential: 'Residential',
  commercial: 'Commercial',
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
