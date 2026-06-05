'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useAuth } from '@/components/AuthProvider';

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center h-[63px] px-1 text-xs font-bold uppercase tracking-label border-b-[3px] transition-colors',
        active
          ? 'border-accent text-ink'
          : 'border-transparent text-muted hover:text-ink',
      )}
    >
      {label}
    </Link>
  );
}

export function Nav() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setOpen(false);
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-[1000] bg-paper border-b-2 border-ink">
      <div className="mx-auto max-w-6xl px-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 py-4">
          <span className="font-display text-2xl leading-none tracking-tight">REALEST</span>
          <span className="hidden sm:inline-block h-3 w-3 bg-accent" aria-hidden />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink href="/explore" label="Explore" />
          {user && <NavLink href="/dashboard" label="Dashboard" />}
          {user && <NavLink href="/listings/new" label="Add Listing" />}
          <div className="flex items-center gap-3 pl-2">
            {!loading && !user && (
              <>
                <Link
                  href="/login"
                  className="text-xs font-bold uppercase tracking-label text-ink hover:text-accent"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="bg-ink text-paper border-2 border-ink px-4 py-2 text-xs font-bold uppercase tracking-label hover:bg-accent hover:border-accent transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
            {user && (
              <button
                onClick={handleLogout}
                className="text-xs font-bold uppercase tracking-label text-ink hover:text-accent"
              >
                Log out
              </button>
            )}
          </div>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 -mr-2"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <span className="block h-0.5 w-6 bg-ink" />
            <span className="block h-0.5 w-6 bg-ink" />
            <span className="block h-0.5 w-6 bg-ink" />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t-2 border-ink bg-paper px-5 py-4 flex flex-col gap-4">
          <Link href="/explore" onClick={() => setOpen(false)} className="text-sm font-bold uppercase tracking-label">
            Explore
          </Link>
          {user && (
            <Link href="/dashboard" onClick={() => setOpen(false)} className="text-sm font-bold uppercase tracking-label">
              Dashboard
            </Link>
          )}
          {user && (
            <Link href="/listings/new" onClick={() => setOpen(false)} className="text-sm font-bold uppercase tracking-label">
              Add Listing
            </Link>
          )}
          {!loading && !user && (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="text-sm font-bold uppercase tracking-label">
                Log in
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="text-sm font-bold uppercase tracking-label text-accent">
                Sign up
              </Link>
            </>
          )}
          {user && (
            <button onClick={handleLogout} className="text-left text-sm font-bold uppercase tracking-label">
              Log out
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
