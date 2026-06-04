import * as React from 'react';
import { cn } from '@/lib/cn';

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        'block text-xs font-bold uppercase tracking-label text-ink mb-1.5',
        className,
      )}
      {...props}
    />
  );
}

export function HelperText({
  error,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & { error?: boolean }) {
  return (
    <p className={cn('mt-1 text-xs', error ? 'text-accent' : 'text-muted', className)} {...props} />
  );
}

const fieldBox =
  'w-full bg-paper border-2 px-3.5 text-sm text-ink placeholder:text-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:bg-surface disabled:opacity-50';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(fieldBox, 'h-11', invalid ? 'border-accent' : 'border-line-medium focus:border-ink', className)}
      {...props}
    />
  );
});

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(fieldBox, 'py-2.5 min-h-[96px]', invalid ? 'border-accent' : 'border-line-medium focus:border-ink', className)}
      {...props}
    />
  );
});

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        fieldBox,
        'h-11 appearance-none bg-no-repeat pr-9',
        invalid ? 'border-accent' : 'border-line-medium focus:border-ink',
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%230A0A0A' stroke-width='2' fill='none'/%3E%3C/svg%3E\")",
        backgroundPosition: 'right 12px center',
      }}
      {...props}
    >
      {children}
    </select>
  );
});

export function Checkbox({
  className,
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      <input
        type="checkbox"
        className={cn(
          'appearance-none h-[18px] w-[18px] border-2 border-ink bg-paper cursor-pointer',
          'checked:bg-ink checked:bg-[length:14px_14px] checked:bg-center checked:bg-no-repeat',
          'focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
          className,
        )}
        style={{
          // Checkmark drawn in paper-white when checked.
          backgroundImage: props.checked
            ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Cpath d='M2.5 7.5l3 3 6-6.5' stroke='%23FAFAFA' stroke-width='2' fill='none' stroke-linecap='square'/%3E%3C/svg%3E\")"
            : undefined,
        }}
        {...props}
      />
      {label ? <span className="text-sm text-ink">{label}</span> : null}
    </label>
  );
}
