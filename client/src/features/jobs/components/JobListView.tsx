import { Download, FilePlus2, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/apiResponse';
import { EmptyState } from '../../../components/common/EmptyState';
import { LoadingState } from '../../../components/common/LoadingState';
import { PageTitle } from '../../../components/common/PageTitle';
import { PageToolbar } from '../../../components/common/PageToolbar';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import { getJobDetailPath, type RoleMode } from '../../modes/roleMode';
import type { Job } from '../../../types/job';
import { useJobs } from '../hooks/useJobs';

type ProcurementFilter = 'all' | 'public' | 'private';

function isJobStatus(value: string): value is Job['status'] {
  return value === 'draft' || value === 'open' || value === 'closingSoon' || value === 'closed' || value === 'awarded';
}

function isDeadlineStatus(value: string): value is 'urgent' | 'open' | 'expired' {
  return value === 'urgent' || value === 'open' || value === 'expired';
}

function TitleCell({ row, label = '공고번호' }: { row: Job; label?: string }) {
  return (
    <div className="max-w-[520px]">
      <p className="font-headline text-[16px] font-bold leading-6">{row.title}</p>
      <p className="mt-1 text-xs leading-5 text-on-surface-variant">
        {label}: {row.noticeNumber || '-'}
      </p>
    </div>
  );
}

type JobListViewProps = {
  mode?: RoleMode;
};

export function JobListView({ mode }: JobListViewProps = {}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [role, setRole] = useState<RoleMode>(mode ?? 'agency');
  const [scoreFilter, setScoreFilter] = useState(searchParams.get('score') ?? 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? 'all');
  const [deadlineFilter, setDeadlineFilter] = useState(searchParams.get('deadline') ?? 'all');
  const [procurementFilter, setProcurementFilter] = useState<ProcurementFilter>(
    searchParams.get('procurementType') === 'private' ? 'private' : searchParams.get('procurementType') === 'public' ? 'public' : 'all'
  );
  const query = searchParams.get('q') ?? '';
  const pageSize = 10;
  const isAgency = role === 'agency';
  const apiParams = useMemo(
    () => ({
      perspective: 'accessible' as const,
      q: query.trim() || undefined,
      status: isJobStatus(statusFilter) ? statusFilter : undefined,
      procurementType: procurementFilter === 'all' ? undefined : procurementFilter,
      deadlineStatus: isDeadlineStatus(deadlineFilter) ? deadlineFilter : undefined,
      minRfpScore: scoreFilter === 'all' ? undefined : Number(scoreFilter),
      page: currentPage,
      pageSize,
      sort: 'deadline' as const,
      order: 'asc' as const
    }),
    [currentPage, deadlineFilter, pageSize, procurementFilter, query, scoreFilter, statusFilter]
  );
  const { data, isLoading, isError, error } = useJobs(apiParams);
  const jobs = data?.items ?? [];
  const summary = data?.summary;

  useEffect(() => {
    if (mode) {
      setRole(mode);
      return;
    }

    const handleRoleChange = (event: Event) => {
      const nextRole = (event as CustomEvent<RoleMode>).detail;
      setRole(nextRole === 'supplier' ? 'supplier' : 'agency');
      setCurrentPage(1);
    };
    const handleStorage = () => setRole(window.localStorage.getItem('beryl-role-mode') === 'supplier' ? 'supplier' : 'agency');

    window.addEventListener('beryl-role-change', handleRoleChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('beryl-role-change', handleRoleChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [mode]);

  const totalCount = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const agencyColumns: DataTableColumn<Job>[] = [
    {
      key: 'title',
      header: '발주 사업',
      sortable: true,
      headerClassName: 'w-[34%] min-w-[360px]',
      cellClassName: 'whitespace-normal align-top',
      render: (row) => <TitleCell row={row} />
    },
    { key: 'agency', header: '발주기관', sortable: true, headerClassName: 'min-w-[150px]' },
    { key: 'procurementType', header: '구분', headerClassName: 'min-w-[110px]', render: (row) => formatProcurementType(row.procurementType) },
    { key: 'category', header: '요구 역량', sortable: true, headerClassName: 'min-w-[150px]' },
    { key: 'budget', header: '예산', align: 'right', headerClassName: 'min-w-[150px]', render: (row) => formatCurrency(row.budget) },
    { key: 'deadline', header: '마감/기준일', sortable: true, headerClassName: 'min-w-[160px]', render: (row) => formatDate(row.deadline) },
    {
      key: 'status',
      header: '접수/평가 상태',
      align: 'center',
      sortable: true,
      headerClassName: 'min-w-[150px]',
      render: (row) => (
        <div className="space-y-2">
          <StatusBadge status={row.status} />
          <p className="text-sm text-on-surface-variant">추천 {row.recommendedPeople}명</p>
        </div>
      )
    }
  ];

  const supplierColumns: DataTableColumn<Job>[] = [
    {
      key: 'title',
      header: '사업공고',
      sortable: true,
      headerClassName: 'w-[34%] min-w-[360px]',
      cellClassName: 'whitespace-normal align-top',
      render: (row) => <TitleCell row={row} />
    },
    { key: 'agency', header: '고객사/발주처', sortable: true, headerClassName: 'min-w-[150px]' },
    { key: 'procurementType', header: '구분', headerClassName: 'min-w-[110px]', render: (row) => formatProcurementType(row.procurementType) },
    { key: 'category', header: '필요 역량', sortable: true, headerClassName: 'min-w-[150px]' },
    { key: 'budget', header: '예산', align: 'right', headerClassName: 'min-w-[150px]', render: (row) => formatCurrency(row.budget) },
    { key: 'deadline', header: '마감', sortable: true, headerClassName: 'min-w-[160px]', render: (row) => formatDate(row.deadline) },
    {
      key: 'rfpScore',
      header: '분석 점수',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.rfpScore,
      headerClassName: 'min-w-[140px]',
      render: (row) => (
        <div className="min-w-28">
          <div className="mb-1 flex items-center justify-center gap-2">
            <span className="font-headline text-[24px] font-bold text-primary">{row.rfpScore}</span>
            <span className="text-sm text-on-surface-variant">점</span>
          </div>
          <div className="h-2 rounded-full bg-surface-container">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(row.rfpScore, 100)}%` }} />
          </div>
        </div>
      )
    }
  ];

  const handleQueryChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set('q', value);
    else next.delete('q');
    setCurrentPage(1);
    setSearchParams(next);
  };

  const updateSearchFilter = (key: string, value: string, setter: (next: string) => void) => {
    setter(value);
    setCurrentPage(1);
    const next = new URLSearchParams(searchParams);
    if (value === 'all') next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  return (
    <section>
      <PageTitle
        title={isAgency ? '발주 사업 관리' : '입찰공고 확인'}
        description={
          isAgency
            ? '내 기업이 발주 관점에서 관리하는 공고, 제안 접수, 평가, 계약 전환 상태를 확인합니다.'
            : '수집한 입찰 공고를 확인하고 RFP 분석과 인력 추천 대상으로 관리합니다.'
        }
        actions={
          <Button icon={<FilePlus2 className="h-4 w-4" />} onClick={() => navigate('/buyer/jobs/new')}>
            {isAgency ? '신규 공고 등록' : '수동 공고 입력'}
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {isAgency ? (
          <>
            <MetricCard label="전체 공고" value={`${data?.total ?? 0}건`} />
            <MetricCard label="진행 중" value={`${summary?.open ?? 0}건`} />
            <MetricCard label="마감 임박" value={`${summary?.closingSoon ?? 0}건`} tone="error" />
            <MetricCard label="낙찰/선정" value={`${summary?.awarded ?? 0}건`} />
          </>
        ) : (
          <>
            <MetricCard label="수집 공고" value={`${data?.total ?? 0}건`} />
            <MetricCard label="검토 필요" value={`${summary?.closingSoon ?? 0}건`} tone="error" />
            <MetricCard label="제안 가능" value={`${summary?.open ?? 0}건`} />
            <MetricCard label="평균 분석 점수" value={`${summary?.avgRfpScore ?? 0}점`} />
          </>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-outline-variant p-4">
          <PageToolbar
            searchPlaceholder={isAgency ? '공고명, 발주기관, 기술 검색' : '공고명, 고객사, 기술 검색'}
            searchValue={query}
            onSearchChange={handleQueryChange}
            resultCount={totalCount}
            actions={
              <>
                <Button variant="ghost" icon={<FilePlus2 className="h-5 w-5" />} aria-label="수동 공고 입력" onClick={() => navigate('/buyer/jobs/new')} />
                <Button variant="ghost" icon={<Download className="h-5 w-5" />} aria-label="다운로드" />
                <Button variant="ghost" icon={<Printer className="h-5 w-5" />} aria-label="인쇄" />
              </>
            }
            selects={[
              {
                label: '진행상태',
                value: statusFilter,
                onChange: (value) => updateSearchFilter('status', value, setStatusFilter),
                options: [
                  { label: '진행상태 전체', value: 'all' },
                  { label: '작성 중', value: 'draft' },
                  { label: '진행 중', value: 'open' },
                  { label: '마감 임박', value: 'closingSoon' },
                  { label: '마감', value: 'closed' },
                  { label: '낙찰', value: 'awarded' }
                ]
              },
              {
                label: isAgency ? '마감 상태' : '분석 점수',
                value: isAgency ? deadlineFilter : scoreFilter,
                onChange: (value) =>
                  isAgency
                    ? updateSearchFilter('deadline', value, setDeadlineFilter)
                    : updateSearchFilter('score', value, setScoreFilter),
                options: isAgency
                  ? [
                      { label: '마감 전체', value: 'all' },
                      { label: '7일 이내', value: 'urgent' },
                      { label: '진행 중', value: 'open' },
                      { label: '마감됨', value: 'expired' }
                    ]
                  : [
                      { label: '분석 점수 전체', value: 'all' },
                      { label: '70점 이상', value: '70' },
                      { label: '80점 이상', value: '80' },
                      { label: '90점 이상', value: '90' }
                    ]
              },
              {
                label: '공고 구분',
                value: procurementFilter,
                onChange: (value) =>
                  updateSearchFilter('procurementType', value, (next) =>
                    setProcurementFilter(next === 'public' || next === 'private' ? next : 'all')
                  ),
                options: [
                  { label: '공공/민간 전체', value: 'all' },
                  { label: '공공', value: 'public' },
                  { label: '민간', value: 'private' }
                ]
              }
            ]}
          />
        </div>

        {isLoading ? <LoadingState /> : null}

        {isError ? (
          <div className="p-6">
            <EmptyState title="공고 목록을 불러오지 못했습니다" description={getApiErrorMessage(error, '잠시 후 다시 시도해주세요.')} />
          </div>
        ) : null}

        {!isLoading && !isError ? (
          <>
            <DataTable
              columns={isAgency ? agencyColumns : supplierColumns}
              data={jobs}
              getRowKey={(row) => row.id}
              onRowClick={(row) => navigate(getJobDetailPath(role, row.id))}
              emptyMessage={isAgency ? '조건에 맞는 발주 공고가 없습니다.' : '조건에 맞는 입찰 공고가 없습니다.'}
              density="compact"
              tableClassName="min-w-[960px] w-full"
            />
            <div className="flex flex-col gap-3 border-t border-outline-variant px-7 py-5 text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
              <span>
                총 {totalCount.toLocaleString('ko-KR')}건 중{' '}
                {totalCount ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalCount)}` : '0'} 표시 중
              </span>
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
          </>
        ) : null}
      </Card>
    </section>
  );
}

function MetricCard({ label, value, tone = 'primary' }: { label: string; value: string; tone?: 'primary' | 'error' }) {
  return (
    <Card className="p-5">
      <p className="font-label text-label-sm uppercase text-on-surface-variant">{label}</p>
      <p className={['mt-2 font-headline text-headline-md', tone === 'error' ? 'text-error' : 'text-primary'].join(' ')}>
        {value}
      </p>
    </Card>
  );
}

function formatCurrency(value: number) {
  if (!value) return '-';

  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0
  }).format(value);
}

function formatDate(value: string) {
  if (!value) return '-';

  return value.slice(0, 10);
}

function formatProcurementType(value: Job['procurementType']) {
  if (value === 'private') return '민간';
  if (value === 'public') return '공공';
  return '-';
}
