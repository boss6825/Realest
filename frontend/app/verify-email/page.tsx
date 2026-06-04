'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { buttonClasses } from '@/components/ui/Button';

const MESSAGES: Record<string, { title: string; body: string; tone: 'good' | 'bad' }> = {
  success: {
    title: 'Email verified',
    body: 'Your account is active. You can now log in and start listing inventory.',
    tone: 'good',
  },
  already: {
    title: 'Already verified',
    body: 'This account is already verified. Go ahead and log in.',
    tone: 'good',
  },
  expired: {
    title: 'Link expired',
    body: 'That verification link has expired. Sign up again to get a fresh link.',
    tone: 'bad',
  },
  invalid: {
    title: 'Invalid link',
    body: "We couldn't verify that link. It may be incorrect or already used.",
    tone: 'bad',
  },
};

function VerifyContent() {
  const status = useSearchParams().get('status') ?? 'invalid';
  const msg = MESSAGES[status] ?? MESSAGES.invalid;

  return (
    <div className="mx-auto max-w-md px-5 py-24">
      <div
        className={`border-2 border-line-subtle p-8 ${
          msg.tone === 'good' ? 'border-t-4 border-t-success' : 'border-t-4 border-t-accent'
        }`}
      >
        <p className="overline mb-3">Email verification</p>
        <h1 className="font-display text-3xl leading-tight mb-3">{msg.title}</h1>
        <p className="text-muted leading-relaxed mb-6">{msg.body}</p>
        {msg.tone === 'good' ? (
          <Link href="/login" className={buttonClasses({})}>
            Log in
          </Link>
        ) : (
          <Link href="/signup" className={buttonClasses({ variant: 'secondary' })}>
            Sign up again
          </Link>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-5 py-24 text-muted">Loading…</div>}>
      <VerifyContent />
    </Suspense>
  );
}
