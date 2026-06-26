import { AlertTriangle, Banknote, Bolt, CalendarCheck, Download, Filter, Printer } from 'lucide-react';
import type { ReactNode } from 'react';
import { PageTitle } from '../../../components/common/PageTitle';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type TenderProject = {
  id: string;
  name: string;
  agency: string;
  supplier: string;
  amount: string;
  period: string;
  status: '진행중' | '완료' | '마감임박' | '지연됨';
};

const projects: TenderProject[] = [
  {
    id: 'B2024-AD-0012',
    name: '2024 지능형 전자정부 인프라 고도화 사업',
    agency: '행정안전부',
    supplier: '(주)케이티',
    amount: '₩15,400,000,000',
    period: '2024.03 - 2025.12',
    status: '진행중'
  },
  {
    id: 'B2023-DR-9821',
    name: '차세대 통합 재난 안전 관리 시스템 구축',
    agency: '소방청',
    supplier: 'SK C&C',
    amount: '₩8,900,000,000',
    period: '2023.01 - 2024.02',
    status: '완료'
  },
  {
    id: 'B2024-ED-0433',
    name: '전국 초중고 AI 디지털 교과서 클라우드 운영',
    agency: '한국지능정보사회진흥원',
    supplier: 'NHN 클라우드',
    amount: '₩4,250,000,000',
    period: '2024.05 - 2024.12',
    status: '마감임박'
  },
  {
    id: 'B2023-LG-7712',
    name: '국가 물류 데이터 센터 통합 보안 관제 시스템',
    agency: '해양수산부',
    supplier: '안랩',
    amount: '₩2,100,000,000',
    period: '2023.11 - 2024.11',
    status: '진행중'
  },
  {
    id: 'B2023-DA-0922',
    name: '법정부 데이터 분석 공통 기반 시스템 증설',
    agency: '행정안전부',
    supplier: 'LG CNS',
    amount: '₩11,200,000,000',
    period: '2023.08 - 2024.08',
    status: '지연됨'
  }
];

const columns: DataTableColumn<TenderProject>[] = [
  {
    key: 'name',
    header: '프로젝트 명',
    render: (row) => (
      <div className="max-w-[260px] whitespace-normal">
        <p className="font-headline text-[18px] font-bold leading-7">{row.name}</p>
        <p className="mt-1 text-xs text-on-surface-variant">ID: {row.id}</p>
      </div>
    )
  },
  { key: 'agency', header: '발주 기관' },
  {
    key: 'supplier',
    header: '낙찰 공급업체',
    render: (row) => (
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded bg-secondary-container text-xs font-bold text-primary">
          {row.supplier.slice(0, 2)}
        </span>
        <span>{row.supplier}</span>
      </div>
    )
  },
  { key: 'amount', header: '계약 금액', align: 'right' },
  { key: 'period', header: '사업 기간' },
  {
    key: 'status',
    header: '진행 상태',
    render: (row) => <ProjectStatus status={row.status} />
  }
];

export function JobListPage() {
  return (
    <section>
      <PageTitle title="낙찰 프로젝트 현황 관리" description="공급업체별 낙찰 프로젝트의 진행 상황과 계약 금액을 모니터링합니다." />

      <div className="mb-10 grid gap-6 xl:grid-cols-3">
        <StatCard icon={<CalendarCheck />} label="총 낙찰 프로젝트 수" value="1,284 건" accent="+12% vs 지난달" />
        <StatCard icon={<Banknote />} label="총 계약 금액 (KRW)" value="45.2 조 원" accent="누적 데이터" />
        <StatCard icon={<Bolt />} label="현재 활성 프로젝트" value="156 건" accent="LIVE" />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant p-5">
          <div className="flex gap-3">
            <Button variant="secondary" icon={<Filter className="h-4 w-4" />}>전체 상태</Button>
            <Button variant="secondary">발주 기관</Button>
          </div>
          <div className="flex gap-2 text-on-surface">
            <Button variant="ghost" icon={<Download className="h-5 w-5" />} aria-label="다운로드" />
            <Button variant="ghost" icon={<Printer className="h-5 w-5" />} aria-label="인쇄" />
          </div>
        </div>
        <DataTable columns={columns} data={projects} getRowKey={(row) => row.id} />
        <div className="flex items-center justify-between border-t border-outline-variant px-7 py-5 text-on-surface-variant">
          <span>총 1,284개 중 1-10 표시 중</span>
          <div className="flex gap-2">
            <span className="grid h-9 w-9 place-items-center rounded bg-primary text-on-primary">1</span>
            <span className="grid h-9 w-9 place-items-center rounded border border-outline-variant">2</span>
            <span className="grid h-9 w-9 place-items-center rounded border border-outline-variant">3</span>
          </div>
        </div>
      </Card>

      <div className="mt-10 grid gap-6 xl:grid-cols-[280px_1fr]">
        <Card className="p-7">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-headline text-[24px] font-bold">최근 이슈 공급업체</h2>
            <AlertTriangle className="h-6 w-6 text-error" />
          </div>
          <div className="space-y-5 text-sm">
            <Issue name="대림정보통신" note="인력 수급 지연" />
            <Issue name="현대글로비스" note="계약 변경 검토 중" good />
          </div>
          <Button variant="secondary" className="mt-7 w-full">전체 로그 확인</Button>
        </Card>
        <Card className="p-7">
          <div className="mb-16 flex items-center justify-between">
            <h2 className="font-headline text-[24px] font-bold">분기별 낙찰 트렌드</h2>
            <div className="flex gap-5 text-sm">
              <span className="before:mr-2 before:inline-block before:h-3 before:w-3 before:rounded-full before:bg-primary">공공 IT</span>
              <span className="before:mr-2 before:inline-block before:h-3 before:w-3 before:rounded-full before:bg-secondary">SOC 인프라</span>
            </div>
          </div>
          <div className="flex h-44 items-end justify-around border-b border-outline-variant px-8">
            {[70, 95, 125, 25].map((height, index) => (
              <div key={index} className="flex w-20 flex-col items-center gap-3">
                <div className={index === 2 ? 'w-full bg-primary' : 'w-full bg-primary-fixed-dim'} style={{ height }} />
                <span className={index === 2 ? 'text-primary' : 'text-on-surface-variant'}>{['1Q', '2Q', '3Q(현재)', '4Q(예측)'][index]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, accent }: { icon: ReactNode; label: string; value: string; accent: string }) {
  return (
    <Card className="p-7">
      <div className="mb-6 flex items-start justify-between">
        <div className="grid h-14 w-14 place-items-center rounded bg-secondary-container text-primary">{icon}</div>
        <span className="font-label text-label-md text-primary">{accent}</span>
      </div>
      <p className="font-label text-label-md text-on-surface">{label}</p>
      <p className="mt-2 font-headline text-[36px] font-bold text-on-surface">{value}</p>
    </Card>
  );
}

function ProjectStatus({ status }: { status: TenderProject['status'] }) {
  const tone = status === '지연됨' || status === '마감임박' ? 'danger' : status === '완료' ? 'neutral' : 'success';
  return <Badge tone={tone}>{status}</Badge>;
}

function Issue({ name, note, good = false }: { name: string; note: string; good?: boolean }) {
  return (
    <div>
      <p className="font-bold">{name}</p>
      <p className={good ? 'text-primary' : 'text-error'}>{note}</p>
    </div>
  );
}
