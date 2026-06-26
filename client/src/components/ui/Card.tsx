import type { HTMLAttributes } from 'react';

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        'rounded-xl border border-outline-variant bg-surface-container-lowest transition-shadow hover:shadow-ambient',
        className
      ].join(' ')}
      {...props}
    />
  );
}
