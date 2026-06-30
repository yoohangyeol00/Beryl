import { useQuery } from '@tanstack/react-query';
import { ClipboardCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getOffers } from '../../../api/offersApi';
import { PageTitle } from '../../../components/common/PageTitle';
import { PageToolbar } from '../../../components/common/PageToolbar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import type { Offer, OfferStatus } from '../../../types/offer';

type RoleMode = 'agency' | 'supplier';

const statusLabels: Record<OfferStatus, string> = {
  draft: '후보선정',
  submitted: '제안완료',
  awarded: '선정',
  rejected: '보완필요'
};

const submissionChannelLabels = {
  nara: '나라장터',
  email: '이메일',
  portal: '발주처 포털',
  visit: '방문 제출',
  other: '기타'
} as const;

const columns: DataTableColumn<Offer>[] = [
  { key: 'jobTitle', header: '대상 사업', sortable: true, render: (row) => <strong>{row.proposalTitle || row.jobTitle}</strong> },
  { key: 'buyerName', header: '발주처', sortable: true },
  { key: 'supplierName', header: '공급기업', sortable: true },
  {
    key: 'proposedPeople',
    header: '제안 인력',
    sortable: true,
    render: (row) => (row.proposedPeople.length ? row.proposedPeople.join(', ') : '-')
  },
  { key: 'expectedStartDate', header: '예상 투입일', sortable: true, render: (row) => row.expectedStartDate || '-' },
  {
    key: 'proposalAmount',
    header: '제안 금액',
    align: 'right',
    sortable: true,
    sortValue: (row) => row.proposalAmount,
    render: (row) => (row.proposalAmount ? `${row.proposalAmount.toLocaleString('ko-KR')}원` : '-')
  },
  {
    key: 'totalMatchScore',
    header: '적합도',
    align: 'right',
    sortable: true,
    sortValue: (row) => row.totalMatchScore,
    render: (row) => (row.totalMatchScore ? `${Math.round(row.totalMatchScore)}점` : '-')
  },
  {
    key: 'status',
    header: '진행상태',
    sortable: true,
    render: (row) => <Badge tone={row.status === 'rejected' ? 'danger' : row.status === 'submitted' || row.status === 'awarded' ? 'success' : 'info'}>{statusLabels[row.status]}</Badge>
  },
  {
    key: 'latestSubmission',
    header: '제출 기록',
    render: (row) =>
      row.latestSubmission ? (
        <div className="text-sm leading-6">
          <strong>{submissionChannelLabels[row.latestSubmission.channel]}</strong>
          <span className="ml-2 text-on-surface-variant">{formatDate(row.latestSubmission.submittedAt)}</span>
          <div className="text-on-surface-variant">
            {row.latestSubmission.submittedByName || '-'} / {row.latestSubmission.receiptNo || '접수번호 없음'}
          </div>
        </div>
      ) : (
        '-'
      )
  }
];

function getInitialRole(): RoleMode {
  if (typeof window === 'undefined') return 'agency';
  return window.localStorage.getItem('beryl-role-mode') === 'supplier' ? 'supplier' : 'agency';
}

function isOfferStatus(value: string): value is OfferStatus {
  return value === 'draft' || value === 'submitted' || value === 'awarded' || value === 'rejected';
}

export function BidParticipationPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [role, setRole] = useState<RoleMode>(getInitialRole);
  const isAgency = role === 'agency';
  const query = searchParams.get('q') ?? '';
  const status = searchParams.get('status') ?? 'all';
  const offerStatus = isOfferStatus(status) ? status : undefined;
  const offersQuery = useQuery({
    queryKey: ['offers', { perspective: isAgency ? 'buyer' : 'supplier', q: query, status: offerStatus }],
    queryFn: () => getOffers({ perspective: isAgency ? 'buyer' : 'supplier', q: query || undefined, status: offerStatus, pageSize: 100 })
  });
  const rows = offersQuery.data?.items ?? [];
  const summary = offersQuery.data?.summary;

  useEffect(() => {
    const handleRoleChange = (event: Event) => {
      const nextRole = (event as CustomEvent<RoleMode>).detail;
      setRole(nextRole === 'supplier' ? 'supplier' : 'agency');
    };

    const handleStorage = () => setRole(getInitialRole());

    window.addEventListener('beryl-role-change', handleRoleChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('beryl-role-change', handleRoleChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleQueryChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set('q', value);
    else next.delete('q');
    setSearchParams(next);
  };

  const handleStatusChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') next.delete('status');
    else next.set('status', value);
    setSearchParams(next);
  };

  return (
    <section>
      <PageTitle
        title={isAgency ? '접수 제안 평가' : '제출 제안 관리'}
        description={isAgency ? '우리 기관 공고에 공급기업이 제출한 제안서, 후보 인력, 단가, 평가 상태를 관리합니다.' : '입찰공고를 보고 작성·제출한 제안서의 상태, 보완 요청, 선정 이후 계약 전환을 관리합니다.'}
        actions={isAgency ? <Button icon={<ClipboardCheck className="h-4 w-4" />}>평가표 열기</Button> : null}
      />

      {isAgency ? (
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card className="p-5">
            <p className="font-label text-label-sm uppercase text-on-surface-variant">접수 제안</p>
            <p className="mt-2 font-headline text-headline-md text-primary">{summary?.total ?? 0}건</p>
          </Card>
          <Card className="p-5">
            <p className="font-label text-label-sm uppercase text-on-surface-variant">평가 대기</p>
            <p className="mt-2 font-headline text-headline-md text-error">{summary?.submitted ?? 0}건</p>
          </Card>
          <Card className="p-5">
            <p className="font-label text-label-sm uppercase text-on-surface-variant">우선협상</p>
            <p className="mt-2 font-headline text-headline-md text-primary">{summary?.awarded ?? 0}건</p>
          </Card>
          <Card className="p-5">
            <p className="font-label text-label-sm uppercase text-on-surface-variant">보완 요청</p>
            <p className="mt-2 font-headline text-headline-md text-error">{summary?.rejected ?? 0}건</p>
          </Card>
        </div>
      ) : (
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card className="p-5">
            <p className="font-label text-label-sm uppercase text-on-surface-variant">전체 제안</p>
            <p className="mt-2 font-headline text-headline-md text-primary">{summary?.total ?? 0}건</p>
          </Card>
          <Card className="p-5">
            <p className="font-label text-label-sm uppercase text-on-surface-variant">작성중</p>
            <p className="mt-2 font-headline text-headline-md text-primary">{summary?.draft ?? 0}건</p>
          </Card>
          <Card className="p-5">
            <p className="font-label text-label-sm uppercase text-on-surface-variant">제출완료</p>
            <p className="mt-2 font-headline text-headline-md text-primary">{summary?.submitted ?? 0}건</p>
          </Card>
          <Card className="p-5">
            <p className="font-label text-label-sm uppercase text-on-surface-variant">선정/보완</p>
            <p className="mt-2 font-headline text-headline-md text-error">{(summary?.awarded ?? 0) + (summary?.rejected ?? 0)}건</p>
          </Card>
        </div>
      )}

      <PageToolbar
        searchPlaceholder={isAgency ? '사업명, 공급기업, 후보 인력 검색' : '사업명, 발주기관, 인력명 검색'}
        searchValue={query}
        onSearchChange={handleQueryChange}
        resultCount={offersQuery.data?.total ?? rows.length}
        selects={[
          {
            label: '상태',
            value: status,
            onChange: handleStatusChange,
            options: [
              { label: '상태 전체', value: 'all' },
              { label: '후보선정', value: 'draft' },
              { label: '제안완료', value: 'submitted' },
              { label: '선정', value: 'awarded' },
              { label: '보완필요', value: 'rejected' }
            ]
          }
        ]}
      />
      <DataTable
        columns={columns}
        data={rows}
        getRowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/offers/${row.id}`)}
        emptyMessage={offersQuery.isError ? '제안 목록을 불러오지 못했습니다.' : '조건에 맞는 제안서가 없습니다.'}
        isLoading={offersQuery.isLoading}
      />
    </section>
  );
}

function formatDate(value: string) {
  if (!value) return '-';
  return value.slice(0, 10);
}
