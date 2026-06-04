import * as React from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-sans font-bold uppercase tracking-label border-2 transition-colors select-none disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-paper border-ink hover:bg-accent hover:border-accent active:bg-accent-active active:border-accent-active',
  secondary: 'bg-transparent text-ink border-ink hover:bg-ink hover:text-paper active:bg-[#262626]',
  ghost: 'bg-transparent text-ink border-transparent hover:text-accent active:text-accent-active',
  destructive: 'bg-accent text-paper border-accent hover:bg-accent-active hover:border-accent-active active:bg-accent-deep active:border-accent-deep',
};

const sizes: Record<Size, string> = {
  sm: 'text-xs px-4 py-1.5',
  md: 'text-sm px-6 py-2.5',
  lg: 'text-base px-8 py-3.5',
};

export function buttonClasses(opts: { variant?: Variant; size?: Size; className?: string } = {}) {
  const { variant = 'primary', size = 'md', className } = opts;
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={buttonClasses({ variant, size, className })} {...props} />;
}
