import { Badge } from '../ui/Badge';

type StatusBadgeProps = {
  status: 'open' | 'closingSoon' | 'closed' | 'awarded' | 'draft';
};

const statusMap = {
  open: { label: '진행 중', tone: 'success' },
  closingSoon: { label: '마감 임박', tone: 'danger' },
  closed: { label: '마감', tone: 'neutral' },
  awarded: { label: '낙찰', tone: 'success' },
  draft: { label: '작성 중', tone: 'info' }
} as const;

export function StatusBadge({ status }: StatusBadgeProps) {
  const item = statusMap[status];

  return <Badge tone={item.tone}>{item.label}</Badge>;
}
