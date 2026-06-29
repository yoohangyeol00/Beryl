import { Download, Printer, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageTitle } from '../../../components/common/PageTitle';
import { PageToolbar } from '../../../components/common/PageToolbar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type RoleMode = 'agency' | 'supplier';

type Opportunity = {
  id: string;
  title: string;
  client: string;
  ownerDept: string;
  category: string;
  budget: string;
  deadline: string;
  fitScore: number;
  proposals: number;
  agencyStatus: '공고중' | '평가중' | '계약준비' | '수행중' | '마감됨';
};

const ownAgency = '소방청';

const opportunities: Opportunity[] = [
  {
    id: '20261012345-00',
    title: '차세대 통합 재난 안전 관리 시스템 구축',
    client: '소방청',
    ownerDept: '디지털재난대응과',
    category: 'Java/Spring, MSA',
    budget: '₩8,900,000,000',
    deadline: '2026-07-03 14:00',
    fitScore: 91,
    proposals: 8,
    agencyStatus: '평가중'
  },
  {
    id: '20261055812-00',
    title: '현장 대응 모바일 관제 고도화',
    client: '소방청',
    ownerDept: '정보화담당관',
    category: 'Mobile, GIS, API',
    budget: '₩1,640,000,000',
    deadline: '2026-07-12 16:00',
    fitScore: 83,
    proposals: 3,
    agencyStatus: '공고중'
  },
  {
    id: '20260977441-00',
    title: '소방 데이터 통합 분석 플랫폼 구축',
    client: '소방청',
    ownerDept: '데이터정책팀',
    category: 'Data Lake, BI',
    budget: '₩2,180,000,000',
    deadline: '2026-06-25 10:00',
    fitScore: 79,
    proposals: 5,
    agencyStatus: '계약준비'
  },
  {
    id: '20260831990-00',
    title: 'AI 상황전파 시범 운영',
    client: '소방청',
    ownerDept: '재난상황실',
    category: 'AI, Monitoring',
    budget: '₩920,000,000',
    deadline: '2026-05-18 11:00',
    fitScore: 72,
    proposals: 0,
    agencyStatus: '수행중'
  },
  {
    id: '20261044219-00',
    title: '공공데이터 API 연계 플랫폼 고도화',
    client: '행정안전부',
    ownerDept: '공공데이터정책과',
    category: 'Backend, API',
    budget: '₩740,000,000',
    deadline: '2026-07-15 16:00',
    fitScore: 84,
    proposals: 0,
    agencyStatus: '공고중'
  },
  {
    id: '20260988031-00',
    title: 'AI 디지털 교과서 클라우드 운영',
    client: '한국지능정보사회진흥원',
    ownerDept: '교육디지털팀',
    category: 'Cloud, DevOps',
    budget: '₩4,250,000,000',
    deadline: '2026-06-28 10:00',
    fitScore: 78,
    proposals: 0,
    agencyStatus: '마감됨'
  },
  {
    id: '20260912077-00',
    title: '전자조달 사용자 포털 개선',
    client: '조달청',
    ownerDept: '조달정보화과',
    category: 'Frontend, UX',
    budget: '₩1,280,000,000',
    deadline: '2026-07-21 11:00',
    fitScore: 62,
    proposals: 0,
    agencyStatus: '공고중'
  }
];

const today = new Date('2026-06-29T00:00:00');

function getInitialRole(): RoleMode {
  if (typeof window === 'undefined') return 'agency';
  return window.localStorage.getItem('beryl-role-mode') === 'supplier' ? 'supplier' : 'agency';
}

function getDeadlineStatus(deadline: string) {
  const date = new Date(deadline.replace(' ', 'T'));
  const daysLeft = Math.ceil((date.getTime() - today.getTime()) / 86400000);

  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 7) return 'urgent';
  return 'open';
}

function TitleCell({ row, label = '공고번호' }: { row: Opportunity; label?: string }) {
  return (
    <div className="max-w-[520px]">
      <p className="font-headline text-[16px] font-bold leading-6">{row.title}</p>
      <p className="mt-1 text-xs leading-5 text-on-surface-variant">{label}: {row.id}</p>
    </div>
  );
}

export function JobListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [role, setRole] = useState<RoleMode>(getInitialRole);
  const [fitFilter, setFitFilter] = useState(searchParams.get('fit') ?? 'all');
  const [agencyStatusFilter, setAgencyStatusFilter] = useState(searchParams.get('status') ?? 'all');
  const [deadlineFilter, setDeadlineFilter] = useState(searchParams.get('deadline') ?? 'all');
  const query = searchParams.get('q') ?? '';
  const pageSize = 10;
  const isAgency = role === 'agency';

  useEffect(() => {
    const handleRoleChange = (event: Event) => {
      const nextRole = (event as CustomEvent<RoleMode>).detail;
      setRole(nextRole === 'supplier' ? 'supplier' : 'agency');
      setCurrentPage(1);
    };
    const handleStorage = () => setRole(getInitialRole());

    window.addEventListener('beryl-role-change', handleRoleChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('beryl-role-change', handleRoleChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const columns: DataTableColumn<Opportunity>[] = isAgency ? [
    {
      key: 'title',
      header: '발주 사업',
      sortable: true,
      headerClassName: 'w-[34%] min-w-[360px]',
      cellClassName: 'whitespace-normal align-top',
      render: (row) => <TitleCell row={row} />
    },
    { key: 'ownerDept', header: '담당 부서', sortable: true, headerClassName: 'min-w-[150px]' },
    { key: 'category', header: '요구 역량', sortable: true, headerClassName: 'min-w-[150px]' },
    { key: 'budget', header: '예산', align: 'right', headerClassName: 'min-w-[150px]' },
    { key: 'deadline', header: '마감/기준일', sortable: true, headerClassName: 'min-w-[160px]' },
    {
      key: 'agencyStatus',
      header: '접수/평가 상태',
      align: 'center',
      sortable: true,
      headerClassName: 'min-w-[150px]',
      render: (row) => (
        <div className="space-y-2">
          <Badge tone={row.agencyStatus === '평가중' ? 'danger' : row.agencyStatus === '수행중' ? 'success' : 'info'}>{row.agencyStatus}</Badge>
          <p className="text-sm text-on-surface-variant">제안 {row.proposals}건</p>
        </div>
      )
    }
  ] : [
    {
      key: 'title',
      header: '사업공고',
      sortable: true,
      headerClassName: 'w-[34%] min-w-[360px]',
      cellClassName: 'whitespace-normal align-top',
      render: (row) => <TitleCell row={row} />
    },
    { key: 'client', header: '고객사/발주처', sortable: true, headerClassName: 'min-w-[150px]' },
    { key: 'category', header: '필요 역량', sortable: true, headerClassName: 'min-w-[150px]' },
    { key: 'budget', header: '예산', align: 'right', headerClassName: 'min-w-[150px]' },
    { key: 'deadline', header: '마감', sortable: true, headerClassName: 'min-w-[160px]' },
    {
      key: 'fitScore',
      header: '당사 적합도',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.fitScore,
      headerClassName: 'min-w-[140px]',
      render: (row) => (
        <div className="min-w-28">
          <div className="mb-1 flex items-center justify-center gap-2">
            <span className="font-headline text-[24px] font-bold text-primary">{row.fitScore}</span>
            <span className="text-sm text-on-surface-variant">점</span>
          </div>
          <div className="h-2 rounded-full bg-surface-container">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${row.fitScore}%` }} />
          </div>
        </div>
      )
    }
  ];

  const filteredOpportunities = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return opportunities.filter((item) => {
      const scopeMatches = isAgency ? item.client === ownAgency : true;
      const matchesQuery = !normalizedQuery || [item.title, item.client, item.ownerDept, item.category, item.id].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
      const matchesPrimaryFilter = isAgency ? agencyStatusFilter === 'all' || item.agencyStatus === agencyStatusFilter : fitFilter === 'all' || item.fitScore >= Number(fitFilter);
      const matchesDeadline = deadlineFilter === 'all' || getDeadlineStatus(item.deadline) === deadlineFilter;

      return scopeMatches && matchesQuery && matchesPrimaryFilter && matchesDeadline;
    });
  }, [agencyStatusFilter, deadlineFilter, fitFilter, isAgency, query]);

  const handleQueryChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set('q', value);
    else next.delete('q');
    setCurrentPage(1);
    setSearchParams(next);
  };

  const handleFitChange = (value: string) => {
    setFitFilter(value);
    setCurrentPage(1);
    const next = new URLSearchParams(searchParams);
    if (value === 'all') next.delete('fit');
    else next.set('fit', value);
    setSearchParams(next);
  };

  const handleAgencyStatusChange = (value: string) => {
    setAgencyStatusFilter(value);
    setCurrentPage(1);
    const next = new URLSearchParams(searchParams);
    if (value === 'all') next.delete('status');
    else next.set('status', value);
    setSearchParams(next);
  };

  const handleDeadlineChange = (value: string) => {
    setDeadlineFilter(value);
    setCurrentPage(1);
    const next = new URLSearchParams(searchParams);
    if (value === 'all') next.delete('deadline');
    else next.set('deadline', value);
    setSearchParams(next);
  };

  const totalPages = Math.max(1, Math.ceil(filteredOpportunities.length / pageSize));

  return (
    <section>
      <PageTitle
        title={isAgency ? '발주 사업 관리' : '입찰공고 확인'}
        description={isAgency ? `${ownAgency}에서 발주한 사업의 공고, 제안 접수, 평가, 계약 전환 상태를 관리합니다.` : '외부 입찰공고를 API/크롤링으로 수집하고, 당사 인력으로 제안 가능한 사업을 선별합니다.'}
        actions={<Button icon={<RefreshCw className="h-4 w-4" />}>{isAgency ? '신규 공고 등록' : '공고 새로고침'}</Button>}
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {isAgency ? (
          <>
            <Card className="p-5">
              <p className="font-label text-label-sm uppercase text-on-surface-variant">내 기관 발주</p>
              <p className="mt-2 font-headline text-headline-md text-primary">18건</p>
            </Card>
            <Card className="p-5">
              <p className="font-label text-label-sm uppercase text-on-surface-variant">평가 필요</p>
              <p className="mt-2 font-headline text-headline-md text-error">8건</p>
            </Card>
            <Card className="p-5">
              <p className="font-label text-label-sm uppercase text-on-surface-variant">계약 준비</p>
              <p className="mt-2 font-headline text-headline-md text-primary">3건</p>
            </Card>
            <Card className="p-5">
              <p className="font-label text-label-sm uppercase text-on-surface-variant">수행 중</p>
              <p className="mt-2 font-headline text-headline-md text-primary">11건</p>
            </Card>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-outline-variant p-4">
          <PageToolbar
            searchPlaceholder={isAgency ? '공고명, 담당부서, 기술 검색' : '공고명, 고객사, 기술 검색'}
            searchValue={query}
            onSearchChange={handleQueryChange}
            resultCount={filteredOpportunities.length}
            actions={
              <>
                <Button variant="ghost" icon={<Download className="h-5 w-5" />} aria-label="다운로드" />
                <Button variant="ghost" icon={<Printer className="h-5 w-5" />} aria-label="인쇄" />
              </>
            }
            selects={isAgency ? [
              {
                label: '진행상태',
                value: agencyStatusFilter,
                onChange: handleAgencyStatusChange,
                options: [
                  { label: '진행상태 전체', value: 'all' },
                  { label: '공고중', value: '공고중' },
                  { label: '평가중', value: '평가중' },
                  { label: '계약준비', value: '계약준비' },
                  { label: '수행중', value: '수행중' }
                ]
              },
              {
                label: '마감 상태',
                value: deadlineFilter,
                onChange: handleDeadlineChange,
                options: [
                  { label: '마감 전체', value: 'all' },
                  { label: '7일 이내', value: 'urgent' },
                  { label: '진행중', value: 'open' },
                  { label: '마감됨', value: 'expired' }
                ]
              }
            ] : [
              {
                label: '적합도',
                value: fitFilter,
                onChange: handleFitChange,
                options: [
                  { label: '적합도 전체', value: 'all' },
                  { label: '70점 이상', value: '70' },
                  { label: '80점 이상', value: '80' },
                  { label: '90점 이상', value: '90' }
                ]
              },
              {
                label: '마감 상태',
                value: deadlineFilter,
                onChange: handleDeadlineChange,
                options: [
                  { label: '마감 전체', value: 'all' },
                  { label: '7일 이내', value: 'urgent' },
                  { label: '진행중', value: 'open' },
                  { label: '마감됨', value: 'expired' }
                ]
              }
            ]}
          />
        </div>
        <DataTable
          columns={columns}
          data={filteredOpportunities}
          getRowKey={(row) => row.id}
          onRowClick={(row) => navigate(`/jobs/${row.id}`)}
          emptyMessage={isAgency ? '내 기관에서 발주한 조건에 맞는 사업이 없습니다.' : '조건에 맞는 사업공고가 없습니다.'}
          density="compact"
          tableClassName="min-w-[1080px] w-full"
        />
        <div className="flex flex-col gap-3 border-t border-outline-variant px-7 py-5 text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
          <span>총 {filteredOpportunities.length.toLocaleString('ko-KR')}개 중 {filteredOpportunities.length ? '1-' + Math.min(pageSize, filteredOpportunities.length) : '0'} 표시 중</span>
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
                    'grid h-9 w-9 place-items-center rounded border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/25',
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
