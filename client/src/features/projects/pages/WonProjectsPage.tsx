import { useNavigate } from 'react-router-dom';
import { PageTitle } from '../../../components/common/PageTitle';
import { MetricCard } from '../../../components/common/MetricCard';
import { PageToolbar } from '../../../components/common/PageToolbar';
import { Badge } from '../../../components/ui/Badge';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type ContractProject = {
  id: string;
  name: string;
  client: string;
  assignedPeople: string;
  amount: number;
  endDate: string;
  extension: '높음' | '검토' | '낮음';
  nextAction: string;
};

const rows: ContractProject[] = [
  { id: 'p-1', name: '전자조달 플랫폼 고도화', client: '조달청', assignedPeople: '김도윤 외 4명', amount: 1280000000, endDate: '2026-09-30', extension: '높음', nextAction: '연장 견적 준비' },
  { id: 'p-2', name: '공공데이터 API 연계', client: '행정안전부', assignedPeople: '박지훈 외 2명', amount: 740000000, endDate: '2026-08-15', extension: '검토', nextAction: '고객 미팅 필요' },
  { id: 'p-3', name: 'AI 교과서 클라우드 운영', client: 'NIA', assignedPeople: '최민서 외 3명', amount: 430000000, endDate: '2026-07-31', extension: '낮음', nextAction: '철수 계획 수립' }
];

const columns: DataTableColumn<ContractProject>[] = [
  { key: 'name', header: '수행 사업', render: (row) => <strong>{row.name}</strong> },
  { key: 'client', header: '고객사/투입처' },
  { key: 'assignedPeople', header: '투입 인력' },
  { key: 'amount', header: '계약금액', align: 'right', render: (row) => `${Math.round(row.amount / 100000000)}억원` },
  { key: 'endDate', header: '계약 종료일' },
  {
    key: 'extension',
    header: '연장 가능성',
    render: (row) => <Badge tone={row.extension === '높음' ? 'success' : row.extension === '낮음' ? 'danger' : 'info'}>{row.extension}</Badge>
  },
  { key: 'nextAction', header: '다음 조치' }
];

export function WonProjectsPage() {
  const navigate = useNavigate();

  return (
    <section>
      <PageTitle title="참여 사업" description="당사가 인력을 투입해 수행 중인 사업과 종료/연장 가능성을 관리합니다." />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard label="수행 사업" value="36건" />
        <MetricCard label="총 계약금액" value="248억원" />
        <MetricCard label="연장 가능" value="11건" />
        <MetricCard label="종료 임박" value="6건" tone="danger" />
      </div>
      <PageToolbar searchPlaceholder="사업명, 고객사, 인력 검색" />
      <DataTable columns={columns} data={rows} getRowKey={(row) => row.id} onRowClick={(row) => navigate(`/projects/won/${row.id}`)} />
    </section>
  );
}
