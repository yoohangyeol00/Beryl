import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/apiResponse';
import { EmptyState } from '../../../components/common/EmptyState';
import { LoadingState } from '../../../components/common/LoadingState';
import { PageTitle } from '../../../components/common/PageTitle';
import { MetricCard } from '../../../components/common/MetricCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import type { Job, JobStatus } from '../../../types/job';
import { useJobs } from '../../jobs/hooks/useJobs';
import { getJobDetailPath } from '../../modes/roleMode';

type AgencyProjectRow = {
  id: string;
  project: string;
  status: JobStatus;
  recommendedPeople: number;
  closingAt: string;
  budget: number;
  category: string;
  nextAction: string;
};

const t = {
  title: '\uB0B4 \uBC1C\uC8FC \uB300\uC2DC\uBCF4\uB4DC',
  description: '\uC6B0\uB9AC \uAE30\uAD00\uC774 \uBC1C\uC8FC\uD55C \uC0AC\uC5C5\uC758 \uACF5\uACE0, \uC811\uC218, \uD3C9\uAC00, \uACC4\uC57D \uBC0F \uC218\uD589 \uC0C1\uD0DC\uB97C \uAD00\uB9AC\uD569\uB2C8\uB2E4.',
  activeBid: '\uC9C4\uD589 \uC911 \uBC1C\uC8FC',
  activeBidDesc: '\uACF5\uACE0/\uD3C9\uAC00/\uACC4\uC57D \uD3EC\uD568',
  reviewWaiting: '\uD3C9\uAC00 \uB300\uAE30',
  reviewWaitingDesc: '\uBC1C\uC8FC \uC0AC\uC5C5\uC5D0\uC11C \uD655\uC778',
  contractReady: '\uACC4\uC57D \uC900\uBE44',
  contractReadyDesc: '\uC6B0\uC120\uD611\uC0C1/\uACC4\uC57D \uAC80\uD1A0',
  runningProjects: '\uC218\uD589 \uC911 \uC0AC\uC5C5',
  runningProjectsDesc: '\uC810\uAC80/\uAC80\uC218 \uC9C4\uD589',
  noticeOps: '\uACF5\uACE0 \uC6B4\uC601',
  noticeOpsDesc: '\uC2E0\uADDC \uACF5\uACE0 \uB4F1\uB85D, \uC9C8\uC758 \uB2F5\uBCC0, \uB9C8\uAC10 \uC77C\uC815\uACFC \uCCA8\uBD80\uD30C\uC77C \uACF5\uAC1C \uC0C1\uD0DC\uB97C \uAD00\uB9AC\uD569\uB2C8\uB2E4.',
  proposalCompare: '\uC811\uC218 \uC81C\uC548 \uBE44\uAD50',
  proposalCompareDesc: '\uACF5\uAE09\uAE30\uC5C5\uBCC4 \uC81C\uC548\uC11C, \uD6C4\uBCF4 \uC778\uB825, \uB2E8\uAC00, \uD3C9\uAC00\uC704\uC6D0 \uBC30\uC815 \uC0C1\uD0DC\uB97C \uBC1C\uC8FC \uC0AC\uC5C5 \uC0C1\uC138\uC5D0\uC11C \uD655\uC778\uD569\uB2C8\uB2E4.',
  executionMgmt: '\uACC4\uC57D/\uC218\uD589 \uAD00\uB9AC',
  executionMgmtDesc: '\uC120\uC815 \uC774\uD6C4 \uACC4\uC57D, \uCC29\uC218, \uC6D4\uAC04 \uC810\uAC80, \uAC80\uC218\uC640 \uC885\uB8CC \uB9AC\uC2A4\uD06C\uB97C \uCD94\uC801\uD569\uB2C8\uB2E4.',
  projectStatusTitle: '\uC6B0\uB9AC \uAE30\uAD00 \uBC1C\uC8FC \uC0AC\uC5C5 \uD604\uD669',
  projectColumn: '\uBC1C\uC8FC \uC0AC\uC5C5',
  statusColumn: '\uC9C4\uD589\uC0C1\uD0DC',
  recommendedPeopleColumn: '\uCD94\uCC9C \uC778\uB825',
  dateColumn: '\uB9C8\uAC10/\uAE30\uC900\uC77C',
  budgetColumn: '\uC608\uC0B0',
  categoryColumn: '\uC694\uAD6C \uC5ED\uB7C9',
  nextActionColumn: '\uB2E4\uC74C \uC870\uCE58',
  count: '\uAC74'
};

const columns: DataTableColumn<AgencyProjectRow>[] = [
  { key: 'project', header: t.projectColumn, sortable: true, render: (row) => <strong>{row.project}</strong> },
  {
    key: 'status',
    header: t.statusColumn,
    sortable: true,
    render: (row) => <StatusBadge status={row.status} />
  },
  {
    key: 'recommendedPeople',
    header: t.recommendedPeopleColumn,
    align: 'right',
    sortable: true,
    sortValue: (row) => row.recommendedPeople,
    render: (row) => `${row.recommendedPeople}\uBA85`
  },
  { key: 'closingAt', header: t.dateColumn, sortable: true },
  { key: 'budget', header: t.budgetColumn, align: 'right', sortable: true, sortValue: (row) => row.budget, render: (row) => formatCurrency(row.budget) },
  { key: 'category', header: t.categoryColumn, sortable: true },
  { key: 'nextAction', header: t.nextActionColumn, sortable: true }
];

export function BuyerDashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useJobs({ perspective: 'buyer' });
  const jobs = data?.items ?? [];
  const summary = data?.summary;
  const rows = jobs.map(toAgencyProjectRow).slice(0, 8);
  const activeBidCount = jobs.filter((job) => job.status !== 'closed' && job.status !== 'awarded').length;

  return (
    <section>
      <PageTitle title={t.title} description={t.description} />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard label={t.activeBid} value={`${activeBidCount}${t.count}`} description={t.activeBidDesc} onClick={() => navigate('/buyer/jobs')} />
        <MetricCard label={t.reviewWaiting} value={`${summary?.closingSoon ?? 0}${t.count}`} description={t.reviewWaitingDesc} tone="danger" onClick={() => navigate('/buyer/jobs?status=closingSoon')} />
        <MetricCard label={t.contractReady} value={`${summary?.awarded ?? 0}${t.count}`} description={t.contractReadyDesc} onClick={() => navigate('/supplier/projects')} />
        <MetricCard label={t.runningProjects} value={`0${t.count}`} description={t.runningProjectsDesc} onClick={() => navigate('/supplier/projects')} />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-3">
        <Card className="p-5">
          <h2 className="font-headline text-[22px] font-bold">{t.noticeOps}</h2>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">{t.noticeOpsDesc}</p>
        </Card>
        <Card className="p-5">
          <h2 className="font-headline text-[22px] font-bold">{t.proposalCompare}</h2>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">{t.proposalCompareDesc}</p>
        </Card>
        <Card className="p-5">
          <h2 className="font-headline text-[22px] font-bold">{t.executionMgmt}</h2>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">{t.executionMgmtDesc}</p>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 font-headline text-headline-md text-on-surface">{t.projectStatusTitle}</h2>
        {isError ? (
          <EmptyState title="발주 사업 현황을 불러오지 못했습니다." description={getApiErrorMessage(error, '잠시 후 다시 시도해주세요.')} />
        ) : isLoading ? (
          <LoadingState />
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            getRowKey={(row) => row.id}
            onRowClick={(row) => navigate(getJobDetailPath('agency', row.id))}
            emptyMessage="등록된 발주 공고가 없습니다."
            density="compact"
            tableClassName="min-w-[1080px] w-full"
          />
        )}
      </Card>
    </section>
  );
}

function toAgencyProjectRow(job: Job): AgencyProjectRow {
  return {
    id: job.id,
    project: job.title,
    status: job.status,
    recommendedPeople: job.recommendedPeople,
    closingAt: formatDate(job.deadline),
    budget: job.budget,
    category: job.category || '-',
    nextAction: getNextAction(job)
  };
}

function getNextAction(job: Job) {
  if (job.status === 'draft') return '공고 정보 검토';
  if (job.status === 'open') return '질의/참여 현황 확인';
  if (job.status === 'closingSoon') return '마감 전 제안 확인';
  if (job.status === 'closed') return '평가 및 선정 검토';
  if (job.status === 'awarded') return '계약/수행 전환 확인';

  return '-';
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
