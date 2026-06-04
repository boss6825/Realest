import * as React from 'react';
import { cn } from '@/lib/cn';

/** Toggleable filter chip. */
export function FilterChip({
  selected,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'border-2 px-3.5 py-1 text-xs font-bold uppercase tracking-label transition-colors',
        selected
          ? 'bg-ink text-paper border-ink'
          : 'bg-transparent text-muted border-line-medium hover:border-ink hover:text-ink',
        className,
      )}
      {...props}
    />
  );
}

/** Static label badge (property type, road-facing, etc.). */
export function Badge({
  className,
  tone = 'ink',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: 'ink' | 'accent' | 'success' | 'outline' }) {
  const tones = {
    ink: 'bg-ink text-paper border-ink',
    accent: 'bg-accent text-paper border-accent',
    success: 'bg-[#F0FDF4] text-success border-success',
    outline: 'bg-transparent text-ink border-ink',
  } as const;
  return (
    <span
      className={cn(
        'inline-flex items-center border-2 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-label',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
