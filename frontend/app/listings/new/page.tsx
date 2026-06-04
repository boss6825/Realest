'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select, Textarea, HelperText } from '@/components/ui/Field';
import { Alert } from '@/components/ui/Alert';
import type { LatLng } from '@/components/MapPicker';
import type { ListingDetail, ListingType } from '@/lib/types';

const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-[360px] border-2 border-ink bg-surface grid place-items-center text-muted">
      Loading map…
    </div>
  ),
});

function NewListingForm() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get('id');
  const isEdit = Boolean(editId);
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ListingType>('agricultural');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const [areaText, setAreaText] = useState('');
  const [roadFacing, setRoadFacing] = useState(false);
  const [notes, setNotes] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>(['']);
  const [location, setLocation] = useState<LatLng | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [prefilling, setPrefilling] = useState(isEdit);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  const loadForEdit = useCallback(async () => {
    if (!editId) return;
    try {
      const { listing } = await api.get<{ listing: ListingDetail }>(`/listings/${editId}`);
      setTitle(listing.title);
      setType(listing.type);
      setPrice(listing.price != null ? String(listing.price) : '');
      setSize(listing.size ?? '');
      setAreaText(listing.areaText ?? '');
      setRoadFacing(listing.roadFacing);
      setNotes(listing.notes ?? '');
      setPhotoUrls(listing.photoUrls && listing.photoUrls.length ? listing.photoUrls : ['']);
      setLocation({ lat: listing.lat, lng: listing.lng });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load listing');
    } finally {
      setPrefilling(false);
    }
  }, [editId]);

  useEffect(() => {
    if (isEdit && user) loadForEdit();
  }, [isEdit, user, loadForEdit]);

  function updatePhoto(i: number, value: string) {
    setPhotoUrls((urls) => urls.map((u, idx) => (idx === i ? value : u)));
  }
  function addPhoto() {
    setPhotoUrls((urls) => [...urls, '']);
  }
  function removePhoto(i: number) {
    setPhotoUrls((urls) => (urls.length === 1 ? [''] : urls.filter((_, idx) => idx !== i)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!location) {
      setError('Tap the map to set the property location.');
      return;
    }

    const cleanedPhotos = photoUrls.map((u) => u.trim()).filter(Boolean);
    const payload = {
      title: title.trim(),
      type,
      lat: location.lat,
      lng: location.lng,
      price: price.trim() === '' ? undefined : Number(price),
      size: size.trim() || undefined,
      areaText: areaText.trim() || undefined,
      roadFacing,
      notes: notes.trim() || undefined,
      photoUrls: cleanedPhotos.length ? cleanedPhotos : undefined,
    };

    if (payload.price !== undefined && !Number.isFinite(payload.price)) {
      setError('Price must be a number (in rupees).');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        await api.patch(`/listings/${editId}`, payload);
      } else {
        await api.post('/listings', payload);
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save listing');
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || prefilling) {
    return <div className="mx-auto max-w-3xl px-5 py-20 text-muted">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <p className="overline mb-2">{isEdit ? 'Edit listing' : 'New listing'}</p>
      <h1 className="font-display text-4xl leading-tight mb-8">
        {isEdit ? 'Update property' : 'List a property'}
      </h1>

      {error && (
        <Alert tone="error" className="mb-6">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-7">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 2 acre highway-facing plot, NH-44"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="type">Property type</Label>
            <Select id="type" value={type} onChange={(e) => setType(e.target.value as ListingType)}>
              <option value="agricultural">Agricultural</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="price">Asking price (₹)</Label>
            <Input
              id="price"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 4500000"
            />
            <HelperText>Whole rupees. Leave blank for &ldquo;price on request&rdquo;.</HelperText>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="size">Size</Label>
            <Input id="size" value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. 2 acres / 1200 sq.yd" />
          </div>
          <div>
            <Label htmlFor="area">Area / locality</Label>
            <Input id="area" value={areaText} onChange={(e) => setAreaText(e.target.value)} placeholder="e.g. Near Dewas bypass" />
          </div>
        </div>

        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={roadFacing}
            onChange={(e) => setRoadFacing(e.target.checked)}
            className="h-[18px] w-[18px] accent-ink cursor-pointer"
          />
          <span className="text-sm font-bold uppercase tracking-label">Road-facing</span>
        </label>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything a co-broker should know — frontage, clear title, negotiable, etc." />
        </div>

        {/* Photo URLs */}
        <div>
          <Label>Photo URLs</Label>
          <div className="space-y-2">
            {photoUrls.map((url, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => updatePhoto(i, e.target.value)}
                  placeholder="https://…"
                />
                <Button type="button" variant="secondary" size="sm" onClick={() => removePhoto(i)} aria-label="Remove">
                  ✕
                </Button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addPhoto}
            className="mt-2 text-xs font-bold uppercase tracking-label text-ink border-b-2 border-accent hover:text-accent"
          >
            + Add another photo
          </button>
          <HelperText>Paste image links (v1 has no uploads).</HelperText>
        </div>

        {/* Location */}
        <div>
          <Label>Location — tap the map</Label>
          <MapPicker value={location} onChange={setLocation} />
          <HelperText>
            {location
              ? `Selected: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
              : 'No location set yet. Tap on the map to drop a pin.'}
          </HelperText>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Publish listing'}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => router.push('/dashboard')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewListingPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-5 py-20 text-muted">Loading…</div>}>
      <NewListingForm />
    </Suspense>
  );
}
