import { Download, Filter, Printer, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTitle } from '../../../components/common/PageTitle';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type Opportunity = {
  id: string;
  title: string;
  client: string;
  category: string;
  budget: string;
  deadline: string;
  fitScore: number;
};

const opportunities: Opportunity[] = [
  {
    id: '20261012345-00',
    title: '차세대 통합 재난 안전 관리 시스템 구축',
    client: '소방청',
    category: 'Java/Spring, MSA',
    budget: '₩8,900,000,000',
    deadline: '2026-07-03 14:00',
    fitScore: 91
  },
  {
    id: '20261044219-00',
    title: '공공데이터 API 연계 플랫폼 고도화',
    client: '행정안전부',
    category: 'Backend, API',
    budget: '₩740,000,000',
    deadline: '2026-07-15 16:00',
    fitScore: 84
  },
  {
    id: '20260988031-00',
    title: 'AI 디지털 교과서 클라우드 운영',
    client: '한국지능정보사회진흥원',
    category: 'Cloud, DevOps',
    budget: '₩4,250,000,000',
    deadline: '2026-06-28 10:00',
    fitScore: 78
  },
  {
    id: '20260912077-00',
    title: '전자조달 사용자 포털 개선',
    client: '조달청',
    category: 'Frontend, UX',
    budget: '₩1,280,000,000',
    deadline: '2026-07-21 11:00',
    fitScore: 62
  }
];

const columns: DataTableColumn<Opportunity>[] = [
  {
    key: 'title',
    header: '사업공고',
    render: (row) => (
      <div className="max-w-[300px] whitespace-normal">
        <p className="font-headline text-[18px] font-bold leading-7">{row.title}</p>
        <p className="mt-1 text-xs text-on-surface-variant">공고번호: {row.id}</p>
      </div>
    )
  },
  { key: 'client', header: '고객사/발주처' },
  { key: 'category', header: '필요 역량' },
  { key: 'budget', header: '예산', align: 'right' },
  { key: 'deadline', header: '마감' },
  {
    key: 'fitScore',
    header: '당사 적합도',
    align: 'center',
    render: (row) => (
      <div className="min-w-32">
        <div className="mb-2 flex items-center justify-center gap-2">
          <span className="font-headline text-[28px] font-bold text-primary">{row.fitScore}</span>
          <span className="text-sm text-on-surface-variant">점</span>
        </div>
        <div className="h-2 rounded-full bg-surface-container">
          <div className="h-2 rounded-full bg-primary" style={{ width: `${row.fitScore}%` }} />
        </div>
      </div>
    )
  }
];

export function JobListPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  return (
    <section>
      <PageTitle
        title="사업공고 발굴"
        description="외부 입찰공고를 API/크롤링으로 수집하고, 당사 인력으로 제안 가능한 사업을 선별합니다."
        actions={
          <Button icon={<RefreshCw className="h-4 w-4" />} onClick={() => navigate('/jobs/new')}>
            공고 수집
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card className="p-5">
          <p className="font-label text-label-sm uppercase text-on-surface-variant">오늘 수집</p>
          <p className="mt-2 font-headline text-headline-md text-primary">42건</p>
        </Card>
        <Card className="p-5">
          <p className="font-label text-label-sm uppercase text-on-surface-variant">검토 필요</p>
          <p className="mt-2 font-headline text-headline-md text-error">17건</p>
        </Card>
        <Card className="p-5">
          <p className="font-label text-label-sm uppercase text-on-surface-variant">제안 가능</p>
          <p className="mt-2 font-headline text-headline-md text-primary">9건</p>
        </Card>
        <Card className="p-5">
          <p className="font-label text-label-sm uppercase text-on-surface-variant">평균 적합도</p>
          <p className="mt-2 font-headline text-headline-md text-primary">82점</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant p-5">
          <div className="flex gap-3">
            <Button variant="secondary" icon={<Filter className="h-4 w-4" />}>적합도 70점 이상</Button>
            <Button variant="secondary">역량 전체</Button>
          </div>
          <div className="flex gap-2 text-on-surface">
            <Button variant="ghost" icon={<Download className="h-5 w-5" />} aria-label="다운로드" />
            <Button variant="ghost" icon={<Printer className="h-5 w-5" />} aria-label="인쇄" />
          </div>
        </div>
        <DataTable columns={columns} data={opportunities} getRowKey={(row) => row.id} onRowClick={(row) => navigate(`/jobs/${row.id}`)} />
        <div className="flex items-center justify-between border-t border-outline-variant px-7 py-5 text-on-surface-variant">
          <span>총 412개 중 1-10 표시 중</span>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;
              const isActive = page === currentPage;

              return (
                <button
                  key={page}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'grid h-9 w-9 place-items-center rounded border text-sm transition-colors',
                    isActive
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
                  ].join(' ')}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}
          </div>
        </div>
      </Card>
    </section>
  );
}
