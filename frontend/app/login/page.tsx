'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Field';
import { Alert } from '@/components/ui/Alert';
import type { User } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notVerified, setNotVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotVerified(false);
    setLoading(true);
    try {
      const { user } = await api.post<{ user: User }>('/auth/login', { email, password });
      setUser(user);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'EMAIL_NOT_VERIFIED') {
        setNotVerified(true);
      } else {
        setError(err instanceof ApiError ? err.message : 'Could not log in');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <p className="overline mb-3">Welcome back</p>
      <h1 className="font-display text-4xl leading-tight mb-8">Log in</h1>

      {error && (
        <Alert tone="error" className="mb-5">
          {error}
        </Alert>
      )}
      {notVerified && (
        <Alert tone="info" className="mb-5">
          Your email isn&apos;t verified yet. Check your inbox for the verification link before
          logging in.
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        New here?{' '}
        <Link href="/signup" className="font-bold text-ink border-b-2 border-accent hover:text-accent">
          Create a dealer account
        </Link>
      </p>
    </div>
  );
}
