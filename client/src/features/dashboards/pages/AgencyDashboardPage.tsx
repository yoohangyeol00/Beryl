import { useNavigate } from 'react-router-dom';
import { PageTitle } from '../../../components/common/PageTitle';
import { MetricCard } from '../../../components/common/MetricCard';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import { Badge } from '../../../components/ui/Badge';

type AgencyProjectRow = {
  id: string;
  project: string;
  status: 'open' | 'reviewing' | 'contracting' | 'running';
  proposals: number;
  closingAt: string;
  owner: string;
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
  proposalsColumn: '\uC811\uC218 \uC81C\uC548',
  dateColumn: '\uB9C8\uAC10/\uAE30\uC900\uC77C',
  ownerColumn: '\uB2F4\uB2F9 \uBD80\uC11C',
  nextActionColumn: '\uB2E4\uC74C \uC870\uCE58',
  count: '\uAC74'
};

const statusLabel: Record<AgencyProjectRow['status'], string> = {
  open: '\uACF5\uACE0\uC911',
  reviewing: '\uD3C9\uAC00\uC911',
  contracting: '\uACC4\uC57D\uC900\uBE44',
  running: '\uC218\uD589\uC911'
};

const rows: AgencyProjectRow[] = [
  { id: 'job-1', project: '\uCC28\uC138\uB300 \uD1B5\uD569 \uC7AC\uB09C \uC548\uC804 \uAD00\uB9AC \uC2DC\uC2A4\uD15C \uAD6C\uCD95', status: 'reviewing', proposals: 8, closingAt: '2026-07-03 14:00', owner: '\uB514\uC9C0\uD138\uC7AC\uB09C\uB300\uC751\uACFC', nextAction: '\uAE30\uC220\uD3C9\uAC00 \uC704\uC6D0 \uBC30\uC815' },
  { id: 'job-2', project: '\uD604\uC7A5 \uB300\uC751 \uBAA8\uBC14\uC77C \uAD00\uC81C \uACE0\uB3C4\uD654', status: 'open', proposals: 3, closingAt: '2026-07-12 16:00', owner: '\uC815\uBCF4\uD654\uB2F4\uB2F9\uAD00', nextAction: '\uC9C8\uC758 \uB2F5\uBCC0 \uACF5\uAC1C' },
  { id: 'job-3', project: '\uC18C\uBC29 \uB370\uC774\uD130 \uD1B5\uD569 \uBD84\uC11D \uD50C\uB7AB\uD3FC', status: 'contracting', proposals: 5, closingAt: '2026-06-25 10:00', owner: '\uB370\uC774\uD130\uC815\uCC45\uD300', nextAction: '\uC6B0\uC120\uD611\uC0C1 \uD1B5\uBCF4' },
  { id: 'job-4', project: 'AI \uC0C1\uD669\uC804\uD30C \uC2DC\uBC94 \uC6B4\uC601', status: 'running', proposals: 0, closingAt: '2026-05-18 11:00', owner: '\uC7AC\uB09C\uC0C1\uD669\uC2E4', nextAction: '\uC6D4\uAC04 \uC218\uD589 \uC810\uAC80' }
];

const columns: DataTableColumn<AgencyProjectRow>[] = [
  { key: 'project', header: t.projectColumn, sortable: true, render: (row) => <strong>{row.project}</strong> },
  {
    key: 'status',
    header: t.statusColumn,
    sortable: true,
    render: (row) => <Badge tone={row.status === 'open' ? 'info' : row.status === 'running' ? 'success' : row.status === 'reviewing' ? 'danger' : 'info'}>{statusLabel[row.status]}</Badge>
  },
  { key: 'proposals', header: t.proposalsColumn, align: 'right', sortable: true, sortValue: (row) => row.proposals, render: (row) => `${row.proposals}${t.count}` },
  { key: 'closingAt', header: t.dateColumn, sortable: true },
  { key: 'owner', header: t.ownerColumn, sortable: true },
  { key: 'nextAction', header: t.nextActionColumn, sortable: true }
];

export function AgencyDashboardPage() {
  const navigate = useNavigate();

  return (
    <section>
      <PageTitle title={t.title} description={t.description} />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard label={t.activeBid} value={`18${t.count}`} description={t.activeBidDesc} onClick={() => navigate('/jobs')} />
        <MetricCard label={t.reviewWaiting} value={`8${t.count}`} description={t.reviewWaitingDesc} tone="danger" onClick={() => navigate('/jobs?status=reviewing')} />
        <MetricCard label={t.contractReady} value={`3${t.count}`} description={t.contractReadyDesc} onClick={() => navigate('/projects/won')} />
        <MetricCard label={t.runningProjects} value={`11${t.count}`} description={t.runningProjectsDesc} onClick={() => navigate('/projects/won')} />
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
        <DataTable columns={columns} data={rows} getRowKey={(row) => row.id} onRowClick={(row) => navigate(`/jobs/${row.id}`)} />
      </Card>
    </section>
  );
}