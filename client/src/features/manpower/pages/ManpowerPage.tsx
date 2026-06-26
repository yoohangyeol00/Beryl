import { useNavigate } from 'react-router-dom';
import { PageTitle } from '../../../components/common/PageTitle';
import { MetricCard } from '../../../components/common/MetricCard';
import { PageToolbar } from '../../../components/common/PageToolbar';
import { Badge } from '../../../components/ui/Badge';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type Manpower = {
  id: string;
  name: string;
  role: string;
  client: string;
  project: string;
  mm: number;
  endDate: string;
  availableFrom: string;
  status: '투입중' | '부분투입' | '가용' | '교체검토';
};

const rows: Manpower[] = [
  { id: 'm-1', name: '김도윤', role: 'PM/아키텍트', client: '소방청', project: '재난 안전 관리 시스템', mm: 1.0, endDate: '2026-09-30', availableFrom: '2026-10-01', status: '투입중' },
  { id: 'm-2', name: '이서연', role: 'Frontend', client: '조달청', project: '전자조달 포털 개선', mm: 0.5, endDate: '2026-08-15', availableFrom: '2026-08-16', status: '부분투입' },
  { id: 'm-3', name: '박지훈', role: 'Backend', client: '-', project: '대기', mm: 0, endDate: '-', availableFrom: '2026-07-01', status: '가용' },
  { id: 'm-4', name: '최민서', role: 'DevOps', client: 'NIA', project: 'AI 교과서 클라우드 운영', mm: 1.0, endDate: '2026-07-31', availableFrom: '2026-08-01', status: '교체검토' }
];

const columns: DataTableColumn<Manpower>[] = [
  { key: 'name', header: '인력', render: (row) => <strong>{row.name}</strong> },
  { key: 'role', header: '역할/등급' },
  { key: 'client', header: '현재 투입처' },
  { key: 'project', header: '수행 사업' },
  { key: 'mm', header: 'M/M', align: 'right' },
  { key: 'endDate', header: '계약 종료일' },
  { key: 'availableFrom', header: '다음 가용일' },
  {
    key: 'status',
    header: '상태',
    render: (row) => <Badge tone={row.status === '가용' ? 'success' : row.status === '교체검토' ? 'danger' : 'info'}>{row.status}</Badge>
  }
];

export function ManpowerPage() {
  const navigate = useNavigate();

  return (
    <section>
      <PageTitle title="투입현황 관리" description="당사 인력이 어느 고객사와 사업에 투입되어 있는지, 종료일과 다음 가용 시점을 관리합니다." />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard label="전체 인력" value="124명" />
        <MetricCard label="투입중" value="86명" />
        <MetricCard label="30일 내 가용" value="18명" />
        <MetricCard label="교체/리스크" value="4명" tone="danger" />
      </div>
      <PageToolbar searchPlaceholder="이름, 고객사, 사업명 검색" />
      <DataTable columns={columns} data={rows} getRowKey={(row) => row.id} onRowClick={(row) => navigate(`/resumes/${row.id}`)} />
    </section>
  );
}
