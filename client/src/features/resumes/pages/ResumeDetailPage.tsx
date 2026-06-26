import { PageTitle } from '../../../components/common/PageTitle';
import { MetricCard } from '../../../components/common/MetricCard';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type History = { id: string; project: string; role: string; period: string; mm: number };

const histories: History[] = [
  { id: 'h-1', project: '전자조달 플랫폼 고도화', role: 'Frontend Lead', period: '2025.01 - 2025.12', mm: 12 },
  { id: 'h-2', project: 'RFP 분석 자동화', role: 'React Engineer', period: '2024.03 - 2024.12', mm: 8 },
  { id: 'h-3', project: '공공데이터 API 연계', role: 'Fullstack', period: '2023.06 - 2024.02', mm: 7 }
];

const columns: DataTableColumn<History>[] = [
  { key: 'project', header: '사업명' },
  { key: 'role', header: '역할' },
  { key: 'period', header: '기간' },
  { key: 'mm', header: 'M/M', align: 'right' }
];

export function ResumeDetailPage() {
  return (
    <section>
      <PageTitle title="인력 상세 정보 및 이력 관리" description="핵심 인력의 역량, 이력, 투입 가능 시점을 관리합니다." />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard label="이름" value="김도현" />
        <MetricCard label="역할" value="PM" />
        <MetricCard label="경력" value="12년" />
        <MetricCard label="가용일" value="2026-08-01" />
      </div>
      <Card className="mb-6 p-6">
        <h2 className="mb-4 font-headline text-headline-md text-on-surface">보유 역량</h2>
        <div className="flex flex-wrap gap-2">
          {['공공조달', 'PMO', 'React', 'PostgreSQL', 'RFP 분석'].map((skill) => (
            <Badge key={skill} tone="info">
              {skill}
            </Badge>
          ))}
        </div>
      </Card>
      <DataTable columns={columns} data={histories} getRowKey={(row) => row.id} />
    </section>
  );
}
