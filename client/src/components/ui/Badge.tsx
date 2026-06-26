import type { HTMLAttributes } from 'react';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'success' | 'danger' | 'neutral' | 'info';
};

const tones = {
  success: 'bg-primary-fixed text-on-primary-fixed-variant',
  danger: 'bg-error-container text-on-error-container',
  neutral: 'bg-surface-container-high text-on-surface-variant',
  info: 'bg-secondary-container text-on-secondary-container'
};

export function Badge({ className = '', tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-1 font-label text-label-sm',
        tones[tone],
        className
      ].join(' ')}
      {...props}
    />
  );
}
