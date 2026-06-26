import { PageTitle } from '../../../components/common/PageTitle';
import { MetricCard } from '../../../components/common/MetricCard';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';

type AgencyRow = { id: string; agency: string; activeJobs: number; closingSoon: number; status: 'open' | 'closingSoon' };

const rows: AgencyRow[] = [
  { id: 'agency-1', agency: '조달청', activeJobs: 18, closingSoon: 4, status: 'open' },
  { id: 'agency-2', agency: '행정안전부', activeJobs: 11, closingSoon: 2, status: 'closingSoon' },
  { id: 'agency-3', agency: '서울특별시', activeJobs: 9, closingSoon: 1, status: 'open' }
];

const columns: DataTableColumn<AgencyRow>[] = [
  { key: 'agency', header: '발주기관' },
  { key: 'activeJobs', header: '진행 공고', align: 'right', render: (row) => `${row.activeJobs}건` },
  { key: 'closingSoon', header: '마감임박', align: 'right', render: (row) => `${row.closingSoon}건` },
  { key: 'status', header: '상태', render: (row) => <StatusBadge status={row.status} /> }
];

export function AgencyDashboardPage() {
  return (
    <section>
      <PageTitle title="발주기관 관리 대시보드" description="기관별 공고 운영 현황과 마감 리스크를 추적합니다." />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard label="등록 기관" value="42" />
        <MetricCard label="진행 공고" value="128" />
        <MetricCard label="마감임박" value="17" tone="danger" />
        <MetricCard label="평균 RFP 점수" value="84점" />
      </div>
      <Card className="p-5">
        <h2 className="mb-4 font-headline text-headline-md text-on-surface">기관별 운영 현황</h2>
        <DataTable columns={columns} data={rows} getRowKey={(row) => row.id} />
      </Card>
    </section>
  );
}
