import { PageTitle } from '../../../components/common/PageTitle';
import { MetricCard } from '../../../components/common/MetricCard';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import { Badge } from '../../../components/ui/Badge';

type SupplierRow = { id: string; supplier: string; contracts: number; winRate: string; grade: string };

const rows: SupplierRow[] = [
  { id: 'supplier-1', supplier: '베릴소프트', contracts: 12, winRate: '42%', grade: 'A' },
  { id: 'supplier-2', supplier: '그린아이티', contracts: 8, winRate: '31%', grade: 'B' },
  { id: 'supplier-3', supplier: '스마트웍스', contracts: 15, winRate: '48%', grade: 'A' }
];

const columns: DataTableColumn<SupplierRow>[] = [
  { key: 'supplier', header: '공급기업' },
  { key: 'contracts', header: '계약사업', align: 'right', render: (row) => `${row.contracts}건` },
  { key: 'winRate', header: '수주율', align: 'right' },
  { key: 'grade', header: '등급', render: (row) => <Badge tone="success">{row.grade}</Badge> }
];

export function SupplierDashboardPage() {
  return (
    <section>
      <PageTitle title="공급기업 관리 대시보드" description="공급기업의 계약, 수주율, 수행 리스크를 한눈에 봅니다." />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard label="등록 기업" value="68" />
        <MetricCard label="계약사업" value="156" />
        <MetricCard label="평균 수주율" value="36%" />
        <MetricCard label="주의 기업" value="5" tone="danger" />
      </div>
      <Card className="p-5">
        <h2 className="mb-4 font-headline text-headline-md text-on-surface">공급기업 성과</h2>
        <DataTable columns={columns} data={rows} getRowKey={(row) => row.id} />
      </Card>
    </section>
  );
}
