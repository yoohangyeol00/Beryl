import { useNavigate } from 'react-router-dom';
import { PageTitle } from '../../../components/common/PageTitle';
import { MetricCard } from '../../../components/common/MetricCard';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import { Badge } from '../../../components/ui/Badge';

type ProjectStage = 'proposal' | 'contract' | 'running' | 'inspection';
type ProjectRisk = 'normal' | 'watch' | 'risk';

type SupplierProjectRow = {
  id: string;
  project: string;
  agency: string;
  stage: ProjectStage;
  contractAmount: number;
  period: string;
  assignedPeople: string;
  mmProgress: number;
  nextAction: string;
  risk: ProjectRisk;
};

type AgencySummaryRow = {
  id: string;
  agency: string;
  projects: number;
  activePeople: number;
  contractAmount: number;
  nextMilestone: string;
  risk: ProjectRisk;
};

const ko = {
  title: '\uB0B4 \uC0AC\uC5C5 \uB300\uC2DC\uBCF4\uB4DC',
  description: '\uC6B0\uB9AC \uD68C\uC0AC\uAC00 \uBC1C\uC8FC\uAE30\uAD00\uBCC4\uB85C \uC218\uD589 \uC911\uC778 \uC0AC\uC5C5, \uD22C\uC785 \uC778\uB825, \uACC4\uC57D, \uAC80\uC218, \uB9AC\uC2A4\uD06C\uB97C \uD655\uC778\uD569\uB2C8\uB2E4.',
  activeProjects: '\uC218\uD589 \uC911 \uC0AC\uC5C5',
  activePeople: '\uD22C\uC785 \uC778\uB825',
  inspectionWaiting: '\uAC80\uC218 \uB300\uAE30',
  riskProjects: '\uB9AC\uC2A4\uD06C \uC0AC\uC5C5',
  multiProjectTitle: '\uBC1C\uC8FC\uAE30\uAD00\uBCC4 \uC218\uD589 \uC694\uC57D',
  multiProjectDesc: '\uD558\uB098\uC758 \uBC1C\uC8FC\uAE30\uAD00\uACFC \uC5EC\uB7EC \uC0AC\uC5C5\uC744 \uC9C4\uD589\uD558\uAC70\uB098, \uC5EC\uB7EC \uBC1C\uC8FC\uAE30\uAD00\uC758 \uC0AC\uC5C5\uC744 \uB3D9\uC2DC\uC5D0 \uC218\uD589\uD558\uB294 \uC0C1\uD669\uC744 \uD55C\uB208\uC5D0 \uBCFC \uC218 \uC788\uAC8C \uAD6C\uC131\uD588\uC2B5\uB2C8\uB2E4.',
  nextWorkTitle: '\uC624\uB298 \uD655\uC778\uD560 \uC77C',
  nextWorkDesc: '\uC0B0\uCD9C\uBB3C \uC81C\uCD9C, \uAC80\uC218 \uB300\uAE30, \uC778\uB825 \uAD50\uCCB4 \uD611\uC758\uCC98\uB7FC \uC0AC\uC5C5\uBCC4 \uB2E4\uC74C \uC870\uCE58\uB97C \uC6B0\uC120 \uD655\uC778\uD569\uB2C8\uB2E4.',
  projectStatus: '\uC218\uD589 \uC0AC\uC5C5 \uD604\uD669',
  agencyStatus: '\uBC1C\uC8FC\uAE30\uAD00\uBCC4 \uACC4\uC57D \uD604\uD669',
  project: '\uC0AC\uC5C5\uBA85',
  agency: '\uBC1C\uC8FC\uAE30\uAD00',
  stage: '\uC9C4\uD589 \uB2E8\uACC4',
  amount: '\uACC4\uC57D\uAE08\uC561',
  period: '\uACC4\uC57D \uAE30\uAC04',
  people: '\uD22C\uC785 \uC778\uB825',
  progress: 'M/M \uC9C4\uCC99',
  nextAction: '\uB2E4\uC74C \uC870\uCE58',
  risk: '\uB9AC\uC2A4\uD06C',
  projects: '\uC0AC\uC5C5 \uC218',
  nextMilestone: '\uB2E4\uC74C \uB9C8\uC77C\uC2A4\uD1A4',
  cases: '\uAC74',
  peopleUnit: '\uBA85',
  won100m: '\uC5B5\uC6D0',
  proposal: '\uC81C\uC548\uC911',
  contract: '\uACC4\uC57D\uC900\uBE44',
  running: '\uC218\uD589\uC911',
  inspection: '\uAC80\uC218',
  normal: '\uC815\uC0C1',
  watch: '\uC8FC\uC758',
  riskLabel: '\uC704\uD5D8'
};

const stageLabel: Record<ProjectStage, string> = {
  proposal: ko.proposal,
  contract: ko.contract,
  running: ko.running,
  inspection: ko.inspection
};

const riskLabel: Record<ProjectRisk, string> = {
  normal: ko.normal,
  watch: ko.watch,
  risk: ko.riskLabel
};

const projects: SupplierProjectRow[] = [
  { id: 'p-1', project: '\uCC28\uC138\uB300 \uD1B5\uD569 \uC7AC\uB09C \uC548\uC804 \uAD00\uB9AC \uC2DC\uC2A4\uD15C \uAD6C\uCD95', agency: '\uC18C\uBC29\uCCAD', stage: 'running', contractAmount: 8900000000, period: '2026.08 - 2027.07', assignedPeople: '\uAE40\uB3C4\uC724 \uC678 4\uBA85', mmProgress: 94, nextAction: '\uC6D4\uAC04\uBCF4\uACE0 \uC81C\uCD9C', risk: 'watch' },
  { id: 'p-2', project: '\uD604\uC7A5 \uB300\uC751 \uBAA8\uBC14\uC77C \uAD00\uC81C \uACE0\uB3C4\uD654', agency: '\uC18C\uBC29\uCCAD', stage: 'inspection', contractAmount: 1640000000, period: '2026.07 - 2026.12', assignedPeople: '\uC774\uC11C\uC5F0 \uC678 2\uBA85', mmProgress: 38, nextAction: '\uCC29\uC218\uACC4 \uC2B9\uC778 \uD655\uC778', risk: 'normal' },
  { id: 'p-3', project: '\uACF5\uACF5\uB370\uC774\uD130 API \uC5F0\uACC4 \uD50C\uB7AB\uD3FC', agency: '\uD589\uC815\uC548\uC804\uBD80', stage: 'running', contractAmount: 740000000, period: '2026.05 - 2026.11', assignedPeople: '\uBC15\uC9C0\uD6C8 \uC678 2\uBA85', mmProgress: 72, nextAction: '\uC778\uC218\uD14C\uC2A4\uD2B8 \uC77C\uC815 \uD655\uC815', risk: 'normal' },
  { id: 'p-4', project: 'AI \uC0C1\uD669\uC804\uD30C \uC2DC\uBC94 \uC6B4\uC601', agency: '\uC18C\uBC29\uCCAD', stage: 'contract', contractAmount: 920000000, period: '2026.09 - 2027.02', assignedPeople: '\uC815\uD558\uB298 \uC678 3\uBA85', mmProgress: 12, nextAction: '\uACC4\uC57D \uC11C\uB958 \uBCF4\uC644', risk: 'risk' }
];

const agencies: AgencySummaryRow[] = [
  { id: 'agency-1', agency: '\uC18C\uBC29\uCCAD', projects: 3, activePeople: 12, contractAmount: 11460000000, nextMilestone: '\uC6D4\uAC04\uBCF4\uACE0 / \uACC4\uC57D \uBCF4\uC644', risk: 'watch' },
  { id: 'agency-2', agency: '\uD589\uC815\uC548\uC804\uBD80', projects: 1, activePeople: 3, contractAmount: 740000000, nextMilestone: '\uC778\uC218\uD14C\uC2A4\uD2B8 \uC77C\uC815 \uD655\uC815', risk: 'normal' }
];

const projectColumns: DataTableColumn<SupplierProjectRow>[] = [
  { key: 'project', header: ko.project, sortable: true, cellClassName: 'whitespace-normal min-w-[320px]', render: (row) => <strong>{row.project}</strong> },
  { key: 'agency', header: ko.agency, sortable: true },
  { key: 'stage', header: ko.stage, sortable: true, render: (row) => <Badge tone={row.stage === 'inspection' ? 'info' : row.stage === 'running' ? 'success' : 'neutral'}>{stageLabel[row.stage]}</Badge> },
  { key: 'contractAmount', header: ko.amount, align: 'right', sortable: true, sortValue: (row) => row.contractAmount, render: (row) => `${Math.round(row.contractAmount / 100000000)}${ko.won100m}` },
  { key: 'period', header: ko.period, sortable: true },
  { key: 'assignedPeople', header: ko.people, sortable: true },
  { key: 'mmProgress', header: ko.progress, align: 'right', sortable: true, render: (row) => `${row.mmProgress}%` },
  { key: 'nextAction', header: ko.nextAction, cellClassName: 'whitespace-normal min-w-[180px]' },
  { key: 'risk', header: ko.risk, render: (row) => <Badge tone={row.risk === 'risk' ? 'danger' : row.risk === 'watch' ? 'info' : 'success'}>{riskLabel[row.risk]}</Badge> }
];

const agencyColumns: DataTableColumn<AgencySummaryRow>[] = [
  { key: 'agency', header: ko.agency, sortable: true, render: (row) => <strong>{row.agency}</strong> },
  { key: 'projects', header: ko.projects, align: 'right', sortable: true, render: (row) => `${row.projects}${ko.cases}` },
  { key: 'activePeople', header: ko.people, align: 'right', sortable: true, render: (row) => `${row.activePeople}${ko.peopleUnit}` },
  { key: 'contractAmount', header: ko.amount, align: 'right', sortable: true, sortValue: (row) => row.contractAmount, render: (row) => `${Math.round(row.contractAmount / 100000000)}${ko.won100m}` },
  { key: 'nextMilestone', header: ko.nextMilestone, cellClassName: 'whitespace-normal min-w-[220px]' },
  { key: 'risk', header: ko.risk, render: (row) => <Badge tone={row.risk === 'risk' ? 'danger' : row.risk === 'watch' ? 'info' : 'success'}>{riskLabel[row.risk]}</Badge> }
];

export function SupplierDashboardPage() {
  const navigate = useNavigate();

  return (
    <section>
      <PageTitle title={ko.title} description={ko.description} />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard label={ko.activeProjects} value={`4${ko.cases}`} onClick={() => navigate('/supplier/projects')} />
        <MetricCard label={ko.activePeople} value={`15${ko.peopleUnit}`} onClick={() => navigate('/supplier/manpower')} />
        <MetricCard label={ko.inspectionWaiting} value={`2${ko.cases}`} onClick={() => navigate('/supplier/projects')} />
        <MetricCard label={ko.riskProjects} value={`1${ko.cases}`} tone="danger" onClick={() => navigate('/supplier/projects?health=risk')} />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-headline text-[22px] font-bold">{ko.multiProjectTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">{ko.multiProjectDesc}</p>
        </Card>
        <Card className="p-5">
          <h2 className="font-headline text-[22px] font-bold">{ko.nextWorkTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">{ko.nextWorkDesc}</p>
        </Card>
      </div>

      <Card className="mb-6 overflow-hidden">
        <div className="border-b border-outline-variant p-6">
          <h2 className="font-headline text-[26px] font-bold">{ko.projectStatus}</h2>
        </div>
        <DataTable columns={projectColumns} data={projects} getRowKey={(row) => row.id} onRowClick={(row) => navigate(`/supplier/projects/${row.id}`)} tableClassName="min-w-[1320px] w-full" />
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-outline-variant p-6">
          <h2 className="font-headline text-[26px] font-bold">{ko.agencyStatus}</h2>
        </div>
        <DataTable columns={agencyColumns} data={agencies} getRowKey={(row) => row.id} tableClassName="min-w-[980px] w-full" />
      </Card>
    </section>
  );
}
