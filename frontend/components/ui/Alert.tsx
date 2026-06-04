import * as React from 'react';
import { cn } from '@/lib/cn';

type Tone = 'error' | 'success' | 'info';

const tones: Record<Tone, string> = {
  error: 'border-accent bg-[#FEF2F2] text-accent',
  success: 'border-success bg-[#F0FDF4] text-success',
  info: 'border-ink bg-surface text-ink',
};

export function Alert({
  tone = 'info',
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('border-2 px-4 py-3 text-sm font-medium', tones[tone], className)}
      {...props}
    >
      {children}
    </div>
  );
}
