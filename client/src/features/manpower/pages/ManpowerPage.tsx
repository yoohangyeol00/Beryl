import { PageTitle } from '../../../components/common/PageTitle';
import { MetricCard } from '../../../components/common/MetricCard';
import { PageToolbar } from '../../../components/common/PageToolbar';
import { Badge } from '../../../components/ui/Badge';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type Manpower = { id: string; name: string; role: string; project: string; mm: number; availableFrom: string; status: string };

const rows: Manpower[] = [
  { id: 'm-1', name: '김도현', role: 'PM', project: '전자조달 고도화', mm: 1.0, availableFrom: '2026-08-01', status: '투입중' },
  { id: 'm-2', name: '이서연', role: 'Frontend', project: 'RFP 분석', mm: 0.5, availableFrom: '2026-07-15', status: '부분투입' },
  { id: 'm-3', name: '박지훈', role: 'Backend', project: '대기', mm: 0, availableFrom: '2026-07-01', status: '가용' }
];

const columns: DataTableColumn<Manpower>[] = [
  { key: 'name', header: '인력' },
  { key: 'role', header: '역할' },
  { key: 'project', header: '현재 사업' },
  { key: 'mm', header: 'M/M', align: 'right' },
  { key: 'availableFrom', header: '가용일' },
  { key: 'status', header: '상태', render: (row) => <Badge tone={row.status === '가용' ? 'success' : 'info'}>{row.status}</Badge> }
];

export function ManpowerPage() {
  return (
    <section>
      <PageTitle title="투입인력 관리 및 M/M 현황" description="사업별 인력 투입률과 가용 시점을 관리합니다." />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard label="전체 인력" value="124명" />
        <MetricCard label="투입중" value="86명" />
        <MetricCard label="가용 인력" value="23명" />
        <MetricCard label="월 M/M" value="97.5" />
      </div>
      <PageToolbar searchPlaceholder="이름, 역할, 사업 검색" />
      <DataTable columns={columns} data={rows} getRowKey={(row) => row.id} />
    </section>
  );
}
