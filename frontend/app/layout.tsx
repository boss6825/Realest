import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { Nav } from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Realest — Dealer-to-Dealer Property Network',
  description:
    'A shared inventory network for property dealers. List your inventory, discover plots across districts, and co-broker deals.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Mono:wght@400;700&family=Work+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <Nav />
          <main className="min-h-[calc(100vh-65px)]">{children}</main>
          <footer className="border-t-2 border-ink mt-24">
            <div className="mx-auto max-w-6xl px-5 py-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="font-display text-xl">REALEST</div>
              <p className="text-xs text-muted max-w-md">
                A B2B network for property dealers. Arming dealers with reach beyond their local
                turf — not replacing them.
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
