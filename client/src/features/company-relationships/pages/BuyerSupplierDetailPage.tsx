import { AlertTriangle, Search, Users } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import { Input } from '../../../components/ui/Input';

type Contract = { id: string; name: string; agency: string; period: string; amount: string; progress: string; status: '진행중' | '마감임박' | '정상' };

const contracts: Contract[] = [
  { id: 'P-2024-0012', name: '차세대 지능형 정부 통합 관리 시스템 구축', agency: '행정안전부', period: '2024.01 - 2024.12', amount: '₩1,250,000,000', progress: '65%', status: '진행중' },
  { id: 'P-2023-0482', name: '국립도서관 통합 아카이브 고도화 사업', agency: '문화체육관광부', period: '2023.11 - 2024.05', amount: '₩850,000,000', progress: '82%', status: '마감임박' },
  { id: 'P-2024-0105', name: 'AI 기반 수요예측 플랫폼 연구용역', agency: '한국정보화진흥원', period: '2024.03 - 2024.09', amount: '₩320,000,000', progress: '15%', status: '진행중' },
  { id: 'P-2024-0056', name: '공공 클라우드 전환 지원 기술 컨설팅', agency: '정보통신산업진흥원', period: '2024.02 - 2024.08', amount: '₩670,000,000', progress: '45%', status: '정상' }
];

const columns: DataTableColumn<Contract>[] = [
  { key: 'name', header: '사업명', render: (row) => <div className="max-w-[220px] whitespace-normal"><strong className="text-[18px] leading-7">{row.name}</strong><p className="mt-2 text-xs text-on-surface-variant">{row.id}</p></div> },
  { key: 'agency', header: '발주기관' },
  { key: 'period', header: '계약기간' },
  { key: 'amount', header: '계약금액', align: 'right', render: (row) => <strong className="text-primary">{row.amount}</strong> },
  { key: 'progress', header: '진행률', render: (row) => <div className="w-24"><div className="mb-2 h-2 rounded bg-surface-container"><div className="h-2 rounded bg-primary" style={{ width: row.progress }} /></div><strong className={row.status === '마감임박' ? 'text-error' : 'text-primary'}>{row.progress}</strong></div> },
  { key: 'status', header: '상태', render: (row) => <Badge tone={row.status === '마감임박' ? 'danger' : row.status === '정상' ? 'neutral' : 'success'}>{row.status}</Badge> }
];

export function BuyerSupplierDetailPage() {
  return (
    <section>
      <div className="mb-8">
        <Input className="max-w-[720px]" icon={<Search className="h-5 w-5" />} placeholder="공급기업 또는 사업명 검색" />
      </div>

      <Card className="mb-10 p-8">
        <div className="grid items-center gap-8 xl:grid-cols-[1fr_220px_220px_220px]">
          <div className="flex items-center gap-8">
            <div className="h-24 w-24 rounded-lg bg-surface-container bg-[linear-gradient(135deg,#1b2b29,#4d5e5a)]" />
            <div>
              <h1 className="font-headline text-[36px] font-bold">테크솔루션 코리아</h1>
              <div className="mt-3 flex gap-3">
                <Badge tone="neutral">사업자번호 123-45-67890</Badge>
                <Badge tone="success">주요 파트너 A등급</Badge>
              </div>
            </div>
          </div>
          <CompanyMetric label="Total Contract Value" value="₩4.2B" />
          <CompanyMetric label="Current M/M Input" value="18.5" />
          <CompanyMetric label="Project Health" value="84%" />
        </div>
      </Card>

      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-headline text-[26px] font-bold">계약 사업 관리 현황</h2>
            <div className="flex gap-3">
              <Button variant="secondary">전체 진행상태</Button>
              <Button variant="secondary">전체 발주처</Button>
            </div>
          </div>
          <DataTable columns={columns} data={contracts} getRowKey={(row) => row.id} />
        </section>

        <aside className="space-y-8">
          <Card className="p-8">
            <div className="mb-7 flex items-center justify-between rounded border border-outline-variant bg-surface-container-low p-5">
              <div className="flex items-center gap-4">
                <Users className="h-7 w-7 text-primary" />
                <strong>총 투입 인원</strong>
              </div>
              <strong className="text-[28px] text-primary">24명</strong>
            </div>
            <h3 className="mb-5 font-bold">프로젝트별 배정</h3>
            <div className="space-y-5">
              <Allocation name="지능형 정부 통합 관리" mm="8.0 M/M" />
              <Allocation name="국립도서관 아카이브" mm="4.5 M/M" />
              <Allocation name="AI 수요예측 플랫폼" mm="3.0 M/M" />
            </div>
            <div className="mt-7 flex gap-4 rounded bg-error-container p-5 text-on-error-container">
              <AlertTriangle className="h-7 w-7" />
              <p><strong>가용 자원 부족</strong><br />다음 달 차세대 통합 프로젝트에 2.0 M/M 추가 인력이 필요합니다.</p>
            </div>
          </Card>
          <Card className="p-8">
            <h3 className="mb-10 font-headline text-[22px] font-bold">분기별 매출 기여도</h3>
            <div className="flex h-48 items-end justify-around">
              {[80, 110, 150, 35].map((h, i) => <div key={i} className={i === 2 ? 'w-16 bg-primary' : 'w-16 bg-primary-fixed-dim'} style={{ height: h }} />)}
            </div>
          </Card>
        </aside>
      </div>
    </section>
  );
}

function CompanyMetric({ label, value }: { label: string; value: string }) {
  return <div className="text-center"><p className="font-label text-label-sm uppercase">{label}</p><p className="mt-4 font-headline text-[32px] font-bold text-primary">{value}</p></div>;
}

function Allocation({ name, mm }: { name: string; mm: string }) {
  return <div className="flex items-center justify-between"><span>{name}</span><strong>{mm}</strong></div>;
}
