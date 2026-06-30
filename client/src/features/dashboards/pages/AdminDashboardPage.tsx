import { ClipboardCheck, FileSearch, Send, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageTitle } from '../../../components/common/PageTitle';
import { MetricCard } from '../../../components/common/MetricCard';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import { Badge } from '../../../components/ui/Badge';

type ActionRow = {
  id: string;
  project: string;
  client: string;
  issue: string;
  owner: string;
  status: '긴급' | '검토';
};

const actions: ActionRow[] = [
  { id: 'a-1', project: '차세대 통합 재난 안전 관리', client: '소방청', issue: '제안 마감 D-3, 후보 2명 확정 필요', owner: '사업개발팀', status: '긴급' },
  { id: 'a-2', project: '공공데이터 API 연계 플랫폼', client: '행정안전부', issue: '백엔드 가용 인력 부족', owner: '인력운영팀', status: '검토' },
  { id: 'a-3', project: 'AI 디지털 교과서 클라우드 운영', client: 'NIA', issue: '계약 종료 30일 전, 연장 가능성 확인', owner: '계약관리팀', status: '긴급' }
];

const columns: DataTableColumn<ActionRow>[] = [
  { key: 'project', header: '사업/공고', sortable: true },
  { key: 'client', header: '고객사/발주처', sortable: true },
  { key: 'issue', header: '필요 조치', sortable: true },
  { key: 'owner', header: '담당', sortable: true },
  { key: 'status', header: '상태', sortable: true, render: (row) => <Badge tone={row.status === '긴급' ? 'danger' : 'info'}>{row.status}</Badge> }
];

const weeklyCollection = [
  { label: '월', value: 18 },
  { label: '화', value: 32 },
  { label: '수', value: 26 },
  { label: '목', value: 42 },
  { label: '금', value: 35 }
];

const pipeline = [
  { label: '수집', value: 42 },
  { label: '검토', value: 17 },
  { label: '후보선정', value: 12 },
  { label: '제안', value: 9 },
  { label: '투입', value: 4 }
];

export function AdminDashboardPage() {
  const navigate = useNavigate();

  return (
    <section>
      <PageTitle title="운영 대시보드" description="수집된 입찰공고, 제안 후보, 투입 인력, 계약 종료/연장 리스크를 한 곳에서 확인합니다." />

      <div className="mb-6 grid gap-4 md:grid-cols-5">
        <MetricCard label="신규 수집 공고" value="42건" description="API/크롤링" onClick={() => navigate('/buyer/jobs')} />
        <MetricCard label="검토 필요" value="17건" description="마감 14일 이내" tone="danger" onClick={() => navigate('/buyer/jobs?deadline=urgent')} />
        <MetricCard label="제안 진행" value="9건" description="후보 확정 전" onClick={() => navigate('/supplier/bid-participation')} />
        <MetricCard label="투입 인력" value="86명" description="12개 고객사" onClick={() => navigate('/supplier/manpower?status=투입중')} />
        <MetricCard label="종료 임박" value="6건" description="30일 이내" tone="danger" onClick={() => navigate('/supplier/projects?extension=낮음')} />
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-headline text-[22px] font-bold">주간 공고 수집량</h2>
            <Badge tone="info">API/크롤링</Badge>
          </div>
          <div className="flex h-56 items-end justify-around border-b border-outline-variant px-4">
            {weeklyCollection.map((item) => (
              <div key={item.label} className="flex w-16 flex-col items-center gap-3">
                <div className="w-full rounded-t bg-primary" style={{ height: `${item.value * 4}px` }} />
                <strong className="text-primary">{item.value}</strong>
                <span className="text-sm text-on-surface-variant">{item.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-headline text-[22px] font-bold">사업 발굴 파이프라인</h2>
            <Badge tone="success">이번 주</Badge>
          </div>
          <div className="space-y-5">
            {pipeline.map((item) => (
              <button key={item.label} type="button" className="block w-full rounded text-left focus:outline-none focus:ring-2 focus:ring-primary/25" onClick={() => navigate(item.label === '검토' ? '/buyer/jobs?deadline=urgent' : '/buyer/jobs')}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-bold text-on-surface">{item.label}</span>
                  <span className="text-primary">{item.value}건</span>
                </div>
                <div className="h-3 rounded-full bg-surface-container">
                  <div className="h-3 rounded-full bg-primary" style={{ width: `${(item.value / 42) * 100}%` }} />
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-4">
        <Card className="p-6">
          <FileSearch className="mb-5 h-7 w-7 text-primary" />
          <h2 className="font-headline text-[22px] font-bold">사업 발굴</h2>
          <p className="mt-2 text-sm text-on-surface-variant">나라장터/API/크롤링 공고를 모아 당사 적합도를 판단합니다.</p>
        </Card>
        <Card className="p-6">
          <UserCheck className="mb-5 h-7 w-7 text-primary" />
          <h2 className="font-headline text-[22px] font-bold">인력 추천</h2>
          <p className="mt-2 text-sm text-on-surface-variant">요구기술, 이력, 가용일 기준으로 제안 후보를 추립니다.</p>
        </Card>
        <Card className="p-6">
          <Send className="mb-5 h-7 w-7 text-primary" />
          <h2 className="font-headline text-[22px] font-bold">제안 관리</h2>
          <p className="mt-2 text-sm text-on-surface-variant">고객사에 제출할 후보, 단가, 투입 일정을 관리합니다.</p>
        </Card>
        <Card className="p-6">
          <ClipboardCheck className="mb-5 h-7 w-7 text-primary" />
          <h2 className="font-headline text-[22px] font-bold">투입/연장</h2>
          <p className="mt-2 text-sm text-on-surface-variant">현재 투입처와 종료일, 연장 가능성, 교체 리스크를 봅니다.</p>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 font-headline text-headline-md text-on-surface">오늘 처리할 일</h2>
        <DataTable columns={columns} data={actions} getRowKey={(row) => row.id} />
      </Card>
    </section>
  );
}
