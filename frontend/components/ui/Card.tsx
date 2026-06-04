import * as React from 'react';
import { cn } from '@/lib/cn';

export function Card({
  elevated,
  hover,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { elevated?: boolean; hover?: boolean }) {
  return (
    <div
      className={cn(
        'bg-paper border-2 border-line-subtle',
        elevated && 'border-t-4 border-t-accent',
        hover && 'transition-colors hover:border-ink',
        className,
      )}
      {...props}
    />
  );
}
