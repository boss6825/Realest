'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Chip';
import { Button, buttonClasses } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { formatPrice, formatDate, LISTING_TYPE_LABELS } from '@/lib/format';
import type { ListingCard } from '@/lib/types';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { listings } = await api.get<{ listings: ListingCard[] }>('/listings/mine');
      setListings(listings);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load your listings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  async function handleDelete(id: number) {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.del(`/listings/${id}`);
      setListings((ls) => ls.filter((l) => l.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete listing');
    } finally {
      setDeletingId(null);
    }
  }

  if (authLoading || (!user && !authLoading)) {
    return <div className="mx-auto max-w-6xl px-5 py-20 text-muted">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-6 mb-8">
        <div>
          <p className="overline mb-2">Dashboard</p>
          <h1 className="font-display text-4xl leading-tight">Your listings</h1>
          {user && (
            <p className="text-muted mt-1">
              Signed in as <span className="text-ink font-bold">{user.name}</span>
              {user.city ? ` · ${user.city}` : ''}
            </p>
          )}
        </div>
        <Link href="/listings/new" className={buttonClasses({})}>
          + Add listing
        </Link>
      </div>

      {error && (
        <Alert tone="error" className="mb-6">
          {error}
        </Alert>
      )}

      {loading ? (
        <p className="text-muted">Loading listings…</p>
      ) : listings.length === 0 ? (
        <div className="border-2 border-dashed border-line-medium p-12 text-center">
          <h2 className="font-display text-2xl mb-2">No listings yet</h2>
          <p className="text-muted mb-6">Add your first property so other dealers can find it.</p>
          <Link href="/listings/new" className={buttonClasses({})}>
            Add your first listing
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <Card key={l.id} className="flex flex-col">
              {l.photoUrls && l.photoUrls.length > 0 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={l.photoUrls[0]}
                  alt={l.title}
                  className="h-40 w-full object-cover border-2 border-ink mb-4"
                />
              )}
              <div className="flex items-center gap-2 mb-2">
                <Badge tone="outline">{LISTING_TYPE_LABELS[l.type]}</Badge>
                {l.roadFacing && <Badge tone="accent">Road-facing</Badge>}
              </div>
              <h3 className="font-display text-xl leading-tight mb-1">{l.title}</h3>
              <p className="text-lg font-bold mb-1">{formatPrice(l.price)}</p>
              <p className="text-sm text-muted">
                {l.areaText || '—'}
                {l.size ? ` · ${l.size}` : ''}
              </p>
              <p className="text-xs text-faint mt-2">Listed {formatDate(l.createdAt)}</p>

              <div className="mt-4 pt-4 border-t border-line-subtle flex gap-2">
                <Link
                  href={`/listings/${l.id}`}
                  className={buttonClasses({ variant: 'secondary', size: 'sm' })}
                >
                  View
                </Link>
                <Link
                  href={`/listings/new?id=${l.id}`}
                  className={buttonClasses({ variant: 'secondary', size: 'sm' })}
                >
                  Edit
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-accent"
                  disabled={deletingId === l.id}
                  onClick={() => handleDelete(l.id)}
                >
                  {deletingId === l.id ? 'Deleting…' : 'Delete'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
