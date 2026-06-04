'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Chip';
import { Button, buttonClasses } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { Alert } from '@/components/ui/Alert';
import { formatPrice, formatDate, LISTING_TYPE_LABELS } from '@/lib/format';
import type { ListingDetail, Message } from '@/lib/types';

const StaticMap = dynamic(() => import('@/components/StaticMap'), {
  ssr: false,
  loading: () => <div className="h-[280px] border-2 border-ink bg-surface" />,
});

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuth();

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const { listing } = await api.get<{ listing: ListingDetail }>(`/listings/${id}`);
        if (active) setListing(listing);
      } catch (err) {
        if (active) setError(err instanceof ApiError ? err.message : 'Could not load listing');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-5 py-20 text-muted">Loading…</div>;
  }
  if (error || !listing) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-20">
        <Alert tone="error">{error ?? 'Listing not found'}</Alert>
        <Link href="/explore" className="inline-block mt-6 text-sm font-bold uppercase tracking-label border-b-2 border-accent">
          ← Back to explore
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === listing.dealerId;
  const photos = listing.photoUrls ?? [];

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Link href="/explore" className="text-xs font-bold uppercase tracking-label text-muted hover:text-ink">
        ← Back to explore
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px] mt-4">
        {/* Main */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge tone="ink">{LISTING_TYPE_LABELS[listing.type]}</Badge>
            {listing.roadFacing && <Badge tone="accent">Road-facing</Badge>}
          </div>

          <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] mb-3">{listing.title}</h1>
          <p className="font-display text-3xl text-accent mb-6">{formatPrice(listing.price)}</p>

          {/* Photos */}
          {photos.length > 0 && (
            <div className="mb-8 grid gap-3 sm:grid-cols-2">
              {photos.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt={`${listing.title} photo ${i + 1}`}
                  className={`w-full object-cover border-2 border-ink ${i === 0 ? 'sm:col-span-2 h-72' : 'h-48'}`}
                />
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-line-strong border-2 border-ink mb-8">
            <Meta label="Size" value={listing.size || '—'} />
            <Meta label="Area" value={listing.areaText || '—'} />
            <Meta label="Listed" value={formatDate(listing.createdAt)} />
          </div>

          {listing.notes && (
            <div className="mb-8">
              <p className="overline mb-2">Notes</p>
              <p className="text-base leading-relaxed whitespace-pre-line">{listing.notes}</p>
            </div>
          )}

          <div>
            <p className="overline mb-2">Location</p>
            <StaticMap lat={listing.lat} lng={listing.lng} />
            <p className="mt-2 text-xs font-mono text-muted">
              {listing.lat.toFixed(5)}, {listing.lng.toFixed(5)}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Contact */}
          <Card elevated className="p-6">
            <p className="overline mb-2">Listing dealer</p>
            <h2 className="font-display text-2xl leading-tight">{listing.dealerName ?? 'Dealer'}</h2>
            {listing.dealerCity && <p className="text-sm text-muted mt-0.5">{listing.dealerCity}</p>}
            {listing.dealerOperatingArea && (
              <p className="text-sm text-muted mt-2">
                <span className="font-bold text-ink">Operates: </span>
                {listing.dealerOperatingArea}
              </p>
            )}

            <div className="mt-5">
              {revealed ? (
                <div className="space-y-2 text-sm">
                  {listing.dealerPhone && (
                    <a href={`tel:${listing.dealerPhone}`} className="block font-bold border-b-2 border-accent w-fit hover:text-accent">
                      {listing.dealerPhone}
                    </a>
                  )}
                  {listing.dealerEmail && (
                    <a href={`mailto:${listing.dealerEmail}`} className="block font-bold border-b-2 border-accent w-fit hover:text-accent break-all">
                      {listing.dealerEmail}
                    </a>
                  )}
                  {!listing.dealerPhone && !listing.dealerEmail && (
                    <p className="text-muted">No contact details provided.</p>
                  )}
                </div>
              ) : (
                <Button className="w-full" onClick={() => setRevealed(true)}>
                  Reveal contact
                </Button>
              )}
            </div>
          </Card>

          {/* Deal room */}
          <DealRoom listingId={listing.id} isOwner={isOwner} loggedIn={Boolean(user)} />
        </aside>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper p-4">
      <p className="text-[11px] font-bold uppercase tracking-label text-muted mb-1">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function DealRoom({
  listingId,
  isOwner,
  loggedIn,
}: {
  listingId: number;
  isOwner: boolean;
  loggedIn: boolean;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { messages } = await api.get<{ messages: Message[] }>(`/messages/${listingId}`);
      setMessages(messages);
    } catch {
      /* thread is optional — ignore load errors */
    }
  }, [listingId]);

  useEffect(() => {
    if (loggedIn) load();
  }, [loggedIn, load]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setError(null);
    try {
      await api.post('/messages', { listingId, text: text.trim() });
      setText('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send message');
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="p-6">
      <p className="overline mb-2">Deal room</p>
      <h3 className="font-display text-xl leading-tight mb-4">Coordinate the deal</h3>

      {!loggedIn ? (
        <div>
          <p className="text-sm text-muted mb-4">Log in to message this dealer about the property.</p>
          <Link href="/login" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
            Log in to message
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3 max-h-72 overflow-y-auto mb-4">
            {messages.length === 0 ? (
              <p className="text-sm text-muted">
                {isOwner ? 'No inquiries yet.' : 'No messages yet. Start the conversation below.'}
              </p>
            ) : (
              messages.map((m) => {
                const mine = m.senderId === user?.id;
                return (
                  <div
                    key={m.id}
                    className={`border-2 p-3 text-sm ${mine ? 'border-ink bg-surface ml-6' : 'border-line-subtle mr-6'}`}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-label text-muted mb-1">
                      {mine ? 'You' : m.senderName ?? 'Dealer'}
                    </p>
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                );
              })
            )}
          </div>

          {error && (
            <Alert tone="error" className="mb-3">
              {error}
            </Alert>
          )}

          {isOwner ? (
            <p className="text-xs text-muted">
              This is your listing. Inquiries from other dealers appear here — reply via their
              revealed contact details.
            </p>
          ) : (
            <form onSubmit={send} className="flex gap-2">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="I have a buyer for this…"
              />
              <Button type="submit" size="sm" disabled={sending}>
                {sending ? '…' : 'Send'}
              </Button>
            </form>
          )}
        </>
      )}
    </Card>
  );
}
