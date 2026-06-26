import { PageTitle } from '../../../components/common/PageTitle';
import { MetricCard } from '../../../components/common/MetricCard';
import { PageToolbar } from '../../../components/common/PageToolbar';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type Project = { id: string; name: string; supplier: string; agency: string; amount: number; status: 'awarded' | 'open' };

const rows: Project[] = [
  { id: 'p-1', name: '전자조달 플랫폼 고도화', supplier: '베릴소프트', agency: '조달청', amount: 1280000000, status: 'awarded' },
  { id: 'p-2', name: '공공데이터 API 연계', supplier: '스마트웍스', agency: '행정안전부', amount: 740000000, status: 'open' },
  { id: 'p-3', name: '성과관리 대시보드', supplier: '그린아이티', agency: '한국도로공사', amount: 430000000, status: 'awarded' }
];

const columns: DataTableColumn<Project>[] = [
  { key: 'name', header: '사업명' },
  { key: 'supplier', header: '공급기업' },
  { key: 'agency', header: '발주기관' },
  { key: 'amount', header: '계약금액', align: 'right', render: (row) => `${Math.round(row.amount / 100000000)}억원` },
  { key: 'status', header: '상태', render: (row) => <StatusBadge status={row.status} /> }
];

export function WonProjectsPage() {
  return (
    <section>
      <PageTitle title="수주 사업 관리 현황" description="낙찰 이후 계약사업 진행 상태와 금액을 관리합니다." />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <MetricCard label="수주 사업" value="36건" />
        <MetricCard label="총 계약금액" value="248억원" />
        <MetricCard label="진행중" value="21건" />
      </div>
      <PageToolbar searchPlaceholder="사업명 또는 기업 검색" />
      <DataTable columns={columns} data={rows} getRowKey={(row) => row.id} />
    </section>
  );
}
