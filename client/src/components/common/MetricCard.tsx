import type { KeyboardEvent } from 'react';
import { Card } from '../ui/Card';

type MetricCardProps = {
  label: string;
  value: string;
  description?: string;
  tone?: 'primary' | 'danger' | 'neutral';
  onClick?: () => void;
};

const toneClass = {
  primary: 'text-primary',
  danger: 'text-error',
  neutral: 'text-on-surface'
};

export function MetricCard({ label, value, description, tone = 'primary', onClick }: MetricCardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      className={[
        'p-5',
        onClick ? 'cursor-pointer hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25' : ''
      ].join(' ')}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <p className="font-label text-label-sm uppercase text-on-surface-variant">{label}</p>
      <p className={`mt-2 font-headline text-headline-md ${toneClass[tone]}`}>{value}</p>
      {description ? <p className="mt-1 text-sm text-on-surface-variant">{description}</p> : null}
    </Card>
  );
}
