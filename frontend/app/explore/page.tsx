'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { FilterChip, Badge } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { formatPrice, LISTING_TYPE_LABELS } from '@/lib/format';
import type { ListingCard, ListingType } from '@/lib/types';

const ExploreMap = dynamic(() => import('@/components/ExploreMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[560px] border-2 border-ink bg-surface grid place-items-center text-muted">
      Loading map…
    </div>
  ),
});

const TYPES: ListingType[] = ['agricultural', 'residential', 'commercial'];

interface Filters {
  type: ListingType | null;
  roadFacing: boolean;
  minPrice?: number;
  maxPrice?: number;
}

function toNum(s: string): number | undefined {
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : undefined;
}

export default function ExplorePage() {
  const [filters, setFilters] = useState<Filters>({ type: null, roadFacing: false });
  const [minInput, setMinInput] = useState('');
  const [maxInput, setMaxInput] = useState('');
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const qs = new URLSearchParams();
    if (filters.minPrice != null) qs.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice != null) qs.set('maxPrice', String(filters.maxPrice));
    if (filters.type) qs.set('type', filters.type);
    if (filters.roadFacing) qs.set('roadFacing', 'true');
    return qs.toString();
  }, [filters]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { listings } = await api.get<{ listings: ListingCard[] }>(
        `/listings${queryString ? `?${queryString}` : ''}`,
      );
      setListings(listings);
    } catch {
      setError('Could not load listings. Is the API running?');
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    load();
  }, [load]);

  function applyPrice() {
    setFilters((f) => ({ ...f, minPrice: toNum(minInput), maxPrice: toNum(maxInput) }));
  }
  function clearAll() {
    setFilters({ type: null, roadFacing: false });
    setMinInput('');
    setMaxInput('');
  }

  const hasFilters =
    filters.type || filters.roadFacing || filters.minPrice != null || filters.maxPrice != null;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <div className="border-b-2 border-ink pb-6 mb-6">
        <p className="overline mb-2">Discover</p>
        <h1 className="font-display text-4xl leading-tight">Explore inventory</h1>
        <p className="text-muted mt-1">
          {loading ? 'Loading…' : `${listings.length} listing${listings.length === 1 ? '' : 's'} on the map`}
        </p>
      </div>

      {/* Filters */}
      <div className="border-2 border-ink p-4 mb-6 flex flex-wrap items-center gap-x-6 gap-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-label text-muted mr-1">Type</span>
          {TYPES.map((t) => (
            <FilterChip
              key={t}
              selected={filters.type === t}
              onClick={() => setFilters((f) => ({ ...f, type: f.type === t ? null : t }))}
            >
              {LISTING_TYPE_LABELS[t]}
            </FilterChip>
          ))}
        </div>

        <FilterChip
          selected={filters.roadFacing}
          onClick={() => setFilters((f) => ({ ...f, roadFacing: !f.roadFacing }))}
        >
          Road-facing
        </FilterChip>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-label text-muted mr-1">Price ₹</span>
          <Input
            className="h-9 w-28"
            inputMode="numeric"
            placeholder="Min"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value.replace(/[^0-9]/g, ''))}
          />
          <span className="text-muted">–</span>
          <Input
            className="h-9 w-28"
            inputMode="numeric"
            placeholder="Max"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value.replace(/[^0-9]/g, ''))}
          />
          <Button variant="secondary" size="sm" onClick={applyPrice}>
            Apply
          </Button>
        </div>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="ml-auto text-xs font-bold uppercase tracking-label text-accent hover:text-accent-active"
          >
            Clear all
          </button>
        )}
      </div>

      {error && (
        <Alert tone="error" className="mb-6">
          {error}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* List */}
        <div className="order-2 lg:order-1 space-y-4 lg:max-h-[560px] lg:overflow-y-auto lg:pr-2">
          {loading ? (
            <p className="text-muted">Loading listings…</p>
          ) : listings.length === 0 ? (
            <div className="border-2 border-dashed border-line-medium p-8 text-center">
              <h2 className="font-display text-xl mb-1">No matches</h2>
              <p className="text-sm text-muted">Try widening your filters.</p>
            </div>
          ) : (
            listings.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedId(l.id)}
                className={cn(
                  'block w-full text-left border-2 p-4 transition-colors',
                  selectedId === l.id ? 'border-ink bg-surface' : 'border-line-subtle hover:border-ink',
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge tone="outline">{LISTING_TYPE_LABELS[l.type]}</Badge>
                  {l.roadFacing && <Badge tone="accent">Road-facing</Badge>}
                </div>
                <h3 className="font-display text-lg leading-tight">{l.title}</h3>
                <p className="text-base font-bold mt-1">{formatPrice(l.price)}</p>
                <p className="text-sm text-muted mt-0.5">
                  {l.areaText || '—'}
                  {l.size ? ` · ${l.size}` : ''}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-faint">
                    {l.dealerName ? `by ${l.dealerName}` : ''}
                    {l.dealerCity ? ` · ${l.dealerCity}` : ''}
                  </span>
                  <Link
                    href={`/listings/${l.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-bold uppercase tracking-label border-b-2 border-accent hover:text-accent"
                  >
                    Details →
                  </Link>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Map */}
        <div className="order-1 lg:order-2 lg:sticky lg:top-24 h-fit">
          <ExploreMap listings={listings} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </div>
    </div>
  );
}
