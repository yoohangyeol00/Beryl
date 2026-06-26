import { Send } from 'lucide-react';
import { PageTitle } from '../../../components/common/PageTitle';
import { PageToolbar } from '../../../components/common/PageToolbar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type Proposal = {
  id: string;
  project: string;
  client: string;
  proposedPeople: string;
  expectedStart: string;
  monthlyRate: string;
  fitScore: number;
  status: '후보선정' | '제안완료' | '인터뷰' | '보완필요';
};

const rows: Proposal[] = [
  { id: 'pr-1', project: '차세대 통합 재난 안전 관리 시스템 구축', client: '소방청', proposedPeople: '김도윤, 이서연, 박지훈', expectedStart: '2026-08-01', monthlyRate: '월 3,800만원', fitScore: 91, status: '제안완료' },
  { id: 'pr-2', project: '공공데이터 API 연계 플랫폼', client: '행정안전부', proposedPeople: '박지훈, 최민서', expectedStart: '2026-07-22', monthlyRate: '월 2,200만원', fitScore: 84, status: '후보선정' },
  { id: 'pr-3', project: 'AI 디지털 교과서 클라우드 운영', client: 'NIA', proposedPeople: '정하늘', expectedStart: '2026-07-10', monthlyRate: '월 1,600만원', fitScore: 78, status: '보완필요' },
  { id: 'pr-4', project: '전자조달 사용자 포털 개선', client: '조달청', proposedPeople: '이서연', expectedStart: '2026-08-15', monthlyRate: '월 1,400만원', fitScore: 82, status: '인터뷰' }
];

const columns: DataTableColumn<Proposal>[] = [
  { key: 'project', header: '제안 사업', render: (row) => <strong>{row.project}</strong> },
  { key: 'client', header: '고객사/발주처' },
  { key: 'proposedPeople', header: '제안 인력' },
  { key: 'expectedStart', header: '예상 투입일' },
  { key: 'monthlyRate', header: '제안 단가', align: 'right' },
  { key: 'fitScore', header: '적합도', align: 'right', render: (row) => `${row.fitScore}점` },
  {
    key: 'status',
    header: '진행상태',
    render: (row) => <Badge tone={row.status === '보완필요' ? 'danger' : row.status === '제안완료' ? 'success' : 'info'}>{row.status}</Badge>
  }
];

export function BidParticipationPage() {
  return (
    <section>
      <PageTitle
        title="제안관리"
        description="발굴한 사업에 어떤 인력을 제안할지, 단가와 투입 일정, 고객사 피드백을 관리합니다."
        actions={<Button icon={<Send className="h-4 w-4" />}>제안서 생성</Button>}
      />
      <PageToolbar searchPlaceholder="사업명, 고객사, 인력명 검색" />
      <DataTable columns={columns} data={rows} getRowKey={(row) => row.id} />
    </section>
  );
}
