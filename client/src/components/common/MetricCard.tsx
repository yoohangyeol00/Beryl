import { Card } from '../ui/Card';

type MetricCardProps = {
  label: string;
  value: string;
  description?: string;
  tone?: 'primary' | 'danger' | 'neutral';
};

const toneClass = {
  primary: 'text-primary',
  danger: 'text-error',
  neutral: 'text-on-surface'
};

export function MetricCard({ label, value, description, tone = 'primary' }: MetricCardProps) {
  return (
    <Card className="p-5">
      <p className="font-label text-label-sm uppercase text-on-surface-variant">{label}</p>
      <p className={`mt-2 font-headline text-headline-md ${toneClass[tone]}`}>{value}</p>
      {description ? <p className="mt-1 text-sm text-on-surface-variant">{description}</p> : null}
    </Card>
  );
}
