import Link from 'next/link';
import { buttonClasses } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <p className="overline mb-5">B2B · Dealer-to-Dealer · India</p>
          <h1 className="font-display text-[44px] leading-[1.02] tracking-tight sm:text-6xl md:text-7xl max-w-4xl">
            Every plot in the
            <br />
            next district.
            <br />
            <span className="text-accent">One network.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Realest is a shared inventory network for property dealers. List what you have, discover
            what you don&apos;t, and co-broker deals across district lines — without the WhatsApp
            chaos.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/explore" className={buttonClasses({ size: 'lg' })}>
              Explore the map
            </Link>
            <Link
              href="/signup"
              className={buttonClasses({ variant: 'secondary', size: 'lg' })}
            >
              Create dealer account
            </Link>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="mx-auto max-w-6xl px-5 py-16 grid gap-12 md:grid-cols-2">
        <div>
          <p className="overline mb-3">The problem</p>
          <h2 className="font-display text-3xl leading-tight mb-4">Dealing is hyperlocal.</h2>
          <p className="text-base leading-relaxed text-muted">
            A dealer knows every plot in their town and has zero visibility into the next district.
            When a buyer wants land along a new highway corridor that spans districts, the deal
            happens through scattered WhatsApp groups and word of mouth. Slow, unreliable, and deals
            fall through.
          </p>
        </div>
        <div className="md:border-l-2 md:border-ink md:pl-12">
          <p className="overline mb-3">The solution</p>
          <h2 className="font-display text-3xl leading-tight mb-4">A shared inventory network.</h2>
          <p className="text-base leading-relaxed text-muted">
            Dealer A lists their properties. Dealer B, working a different area, discovers them on a
            map, filters by what their buyer wants, and connects to co-broker the deal and split
            commission. We&apos;re arming dealers with national reach — not replacing them.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t-2 border-ink bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="overline mb-8">How it works</p>
          <div className="grid gap-px bg-line-strong border-2 border-ink md:grid-cols-3">
            {[
              {
                n: '01',
                title: 'List inventory',
                body: 'Drop a pin on the map, add size, price, type and photos. Faster than a WhatsApp message.',
              },
              {
                n: '02',
                title: 'Discover across districts',
                body: 'Browse every listing on one map. Filter by price, type, and road-facing to match your buyer.',
              },
              {
                n: '03',
                title: 'Co-broker the deal',
                body: 'Reveal the listing dealer’s contact or message them in the deal room, then split commission.',
              },
            ].map((step) => (
              <div key={step.n} className="bg-paper p-8">
                <div className="font-display text-5xl text-accent mb-4">{step.n}</div>
                <h3 className="font-display text-xl mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20 text-center">
        <h2 className="font-display text-4xl sm:text-5xl leading-tight max-w-3xl mx-auto">
          Reach beyond your turf.
        </h2>
        <p className="mt-4 text-muted text-lg">Built for dealers along the corridor.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/signup" className={buttonClasses({ size: 'lg' })}>
            Get started
          </Link>
          <Link href="/explore" className={buttonClasses({ variant: 'ghost', size: 'lg' })}>
            See listings →
          </Link>
        </div>
      </section>
    </div>
  );
}
