'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/Field';
import { Alert } from '@/components/ui/Alert';

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    operatingArea: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post('/auth/signup', form);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create account');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-5 py-20">
        <div className="border-t-4 border-t-accent border-2 border-line-subtle p-8">
          <p className="overline mb-3">Almost there</p>
          <h1 className="font-display text-3xl leading-tight mb-3">Check your email</h1>
          <p className="text-muted leading-relaxed">
            We sent a verification link to <span className="font-bold text-ink">{form.email}</span>.
            Click it to activate your account, then log in.
          </p>
          <Link href="/login" className="inline-block mt-6 text-sm font-bold uppercase tracking-label border-b-2 border-accent hover:text-accent">
            Go to log in →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-14">
      <p className="overline mb-3">Dealer account</p>
      <h1 className="font-display text-4xl leading-tight mb-2">Join the network</h1>
      <p className="text-muted mb-8">List inventory and discover deals across districts.</p>

      {error && (
        <Alert tone="error" className="mb-5">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Ramesh Kumar" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={8} value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="At least 8 characters" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 …" />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Indore" />
          </div>
        </div>
        <div>
          <Label htmlFor="operatingArea">Operating area</Label>
          <Textarea id="operatingArea" value={form.operatingArea} onChange={(e) => update('operatingArea', e.target.value)} placeholder="Districts / corridors you work" className="min-h-[72px]" />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-ink border-b-2 border-accent hover:text-accent">
          Log in
        </Link>
      </p>
    </div>
  );
}
