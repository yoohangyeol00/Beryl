import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { PageTitle } from '../../../components/common/PageTitle';
import { MetricCard } from '../../../components/common/MetricCard';
import { PageToolbar } from '../../../components/common/PageToolbar';
import { Badge } from '../../../components/ui/Badge';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import { getRoleMode, type RoleMode } from '../../modes/roleMode';

type ProjectHealth = 'normal' | 'watch' | 'risk';
type ProjectStage = 'contract' | 'kickoff' | 'running' | 'inspection';

type ContractProject = {
  id: string;
  name: string;
  agency: string;
  supplier: string;
  stage: ProjectStage;
  assignedPeople: string;
  amount: number;
  endDate: string;
  deliverables: string;
  mmProgress: number;
  health: ProjectHealth;
  nextAction: string;
};

const ko = {
  agencyTitle: '\uACC4\uC57D/\uC218\uD589 \uAD00\uB9AC',
  agencyDesc: '\uC120\uC815 \uC774\uD6C4 \uC0AC\uC5C5\uBCC4 \uACC4\uC57D, \uCC29\uC218, \uD22C\uC785, \uC0B0\uCD9C\uBB3C, \uAC80\uC218\uC640 \uB9AC\uC2A4\uD06C\uB97C \uAD00\uB9AC\uD569\uB2C8\uB2E4.',
  supplierTitle: '\uCC38\uC5EC \uC0AC\uC5C5',
  supplierDesc: '\uB2F9\uC0AC\uAC00 \uC778\uB825\uC744 \uD22C\uC785\uD574 \uC218\uD589 \uC911\uC778 \uC0AC\uC5C5\uACFC \uC885\uB8CC/\uC5F0\uC7A5 \uAC00\uB2A5\uC131\uC744 \uAD00\uB9AC\uD569\uB2C8\uB2E4.',
  activeProjects: '\uC218\uD589 \uC0AC\uC5C5',
  totalAmount: '\uCD1D \uACC4\uC57D\uAE08\uC561',
  inspectionWaiting: '\uAC80\uC218 \uB300\uAE30',
  riskProjects: '\uB9AC\uC2A4\uD06C \uC0AC\uC5C5',
  extensionReady: '\uC5F0\uC7A5 \uAC00\uB2A5',
  endingSoon: '\uC885\uB8CC \uC784\uBC15',
  project: '\uC218\uD589 \uC0AC\uC5C5',
  supplier: '\uACF5\uAE09\uAE30\uC5C5',
  agency: '\uBC1C\uC8FC\uAE30\uAD00',
  stage: '\uC218\uD589 \uB2E8\uACC4',
  assignedPeople: '\uD22C\uC785 \uC778\uB825',
  amount: '\uACC4\uC57D\uAE08\uC561',
  endDate: '\uACC4\uC57D \uC885\uB8CC\uC77C',
  deliverables: '\uC0B0\uCD9C\uBB3C/\uAC80\uC218',
  mmProgress: 'M/M \uC9C4\uCC99',
  health: '\uC218\uD589 \uB9AC\uC2A4\uD06C',
  nextAction: '\uB2E4\uC74C \uC870\uCE58',
  searchAgency: '\uC0AC\uC5C5\uBA85, \uACF5\uAE09\uAE30\uC5C5, \uC0B0\uCD9C\uBB3C \uAC80\uC0C9',
  searchSupplier: '\uC0AC\uC5C5\uBA85, \uBC1C\uC8FC\uAE30\uAD00, \uC778\uB825 \uAC80\uC0C9',
  status: '\uC0C1\uD0DC',
  allStatus: '\uC0C1\uD0DC \uC804\uCCB4',
  period: '\uAE30\uAC04',
  allPeriod: '\uAE30\uAC04 \uC804\uCCB4',
  noData: '\uC870\uAC74\uC5D0 \uB9DE\uB294 \uC218\uD589 \uC0AC\uC5C5\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.',
  cases: '\uAC74',
  won100m: '\uC5B5\uC6D0',
  stageContract: '\uACC4\uC57D\uC900\uBE44',
  stageKickoff: '\uCC29\uC218',
  stageRunning: '\uC218\uD589\uC911',
  stageInspection: '\uAC80\uC218',
  normal: '\uC815\uC0C1',
  watch: '\uC8FC\uC758',
  risk: '\uC704\uD5D8'
};

const stageLabel: Record<ProjectStage, string> = {
  contract: ko.stageContract,
  kickoff: ko.stageKickoff,
  running: ko.stageRunning,
  inspection: ko.stageInspection
};

const healthLabel: Record<ProjectHealth, string> = {
  normal: ko.normal,
  watch: ko.watch,
  risk: ko.risk
};

const rows: ContractProject[] = [
  { id: 'p-1', name: '\uCC28\uC138\uB300 \uD1B5\uD569 \uC7AC\uB09C \uC548\uC804 \uAD00\uB9AC \uC2DC\uC2A4\uD15C \uAD6C\uCD95', agency: '\uC18C\uBC29\uCCAD', supplier: '\uD14C\uD06C\uBE0C\uB9AC\uC9C0\uCF54\uB9AC\uC544', stage: 'running', assignedPeople: '\uAE40\uB3C4\uC724 \uC678 4\uBA85', amount: 8900000000, endDate: '2027-07-31', deliverables: '\uC6D4\uAC04\uBCF4\uACE0 1\uAC74 \uB300\uAE30', mmProgress: 94, health: 'watch', nextAction: '\uC6D4\uAC04 \uC218\uD589 \uC810\uAC80' },
  { id: 'p-2', name: '\uD604\uC7A5 \uB300\uC751 \uBAA8\uBC14\uC77C \uAD00\uC81C \uACE0\uB3C4\uD654', agency: '\uC18C\uBC29\uCCAD', supplier: '\uB3C4\uC2DC\uC815\uBCF4\uAE30\uC220', stage: 'kickoff', assignedPeople: '\uC774\uC11C\uC5F0 \uC678 2\uBA85', amount: 1640000000, endDate: '2026-12-15', deliverables: '\uCC29\uC218\uACC4 1\uAC74 \uC2B9\uC778\uD544\uC694', mmProgress: 38, health: 'normal', nextAction: '\uCC29\uC218 \uBCF4\uACE0 \uC2B9\uC778' },
  { id: 'p-3', name: '\uC18C\uBC29 \uB370\uC774\uD130 \uD1B5\uD569 \uBD84\uC11D \uD50C\uB7AB\uD3FC', agency: '\uC18C\uBC29\uCCAD', supplier: '\uB125\uC2A4\uD2B8\uC18C\uD504\uD2B8', stage: 'inspection', assignedPeople: '\uBC15\uC9C0\uD6C8 \uC678 3\uBA85', amount: 2180000000, endDate: '2026-11-30', deliverables: '\uC0B0\uCD9C\uBB3C \uBCF4\uC644\uC694\uCCAD', mmProgress: 81, health: 'risk', nextAction: '\uC0B0\uCD9C\uBB3C \uC7AC\uAC80\uC218' }
];

export function WonProjectsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [role, setRole] = useState<RoleMode>(() => getRoleMode(location.pathname));
  const [health, setHealth] = useState(searchParams.get('health') ?? 'all');
  const query = searchParams.get('q') ?? '';
  const isAgency = role === 'agency';

  useEffect(() => {
    const handleRoleChange = (event: Event) => {
      const nextRole = (event as CustomEvent<RoleMode>).detail;
      setRole(nextRole === 'supplier' ? 'supplier' : 'agency');
    };
    const handleStorage = () => setRole(getRoleMode(location.pathname));

    window.addEventListener('beryl-role-change', handleRoleChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('beryl-role-change', handleRoleChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    setRole(getRoleMode(location.pathname));
  }, [location.pathname]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return rows.filter((row) => {
      const matchesQuery = !normalizedQuery || [row.name, row.agency, row.supplier, row.assignedPeople, row.deliverables, row.nextAction].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
      const matchesHealth = health === 'all' || row.health === health;
      return matchesQuery && matchesHealth;
    });
  }, [health, query]);

  const columns: DataTableColumn<ContractProject>[] = [
    { key: 'name', header: isAgency ? ko.project : ko.supplierTitle, sortable: true, render: (row) => <strong>{row.name}</strong> },
    { key: isAgency ? 'supplier' : 'agency', header: isAgency ? ko.supplier : ko.agency, sortable: true, render: (row) => isAgency ? row.supplier : row.agency },
    { key: 'stage', header: ko.stage, sortable: true, render: (row) => <Badge tone={row.stage === 'inspection' ? 'info' : row.stage === 'running' ? 'success' : 'neutral'}>{stageLabel[row.stage]}</Badge> },
    { key: 'assignedPeople', header: ko.assignedPeople, sortable: true },
    { key: 'amount', header: ko.amount, align: 'right', sortable: true, sortValue: (row) => row.amount, render: (row) => `${Math.round(row.amount / 100000000)}${ko.won100m}` },
    { key: 'endDate', header: ko.endDate, sortable: true },
    { key: 'deliverables', header: ko.deliverables, cellClassName: 'whitespace-normal min-w-[180px]' },
    { key: 'mmProgress', header: ko.mmProgress, align: 'right', sortable: true, render: (row) => `${row.mmProgress}%` },
    { key: 'health', header: ko.health, sortable: true, render: (row) => <Badge tone={row.health === 'risk' ? 'danger' : row.health === 'watch' ? 'info' : 'success'}>{healthLabel[row.health]}</Badge> },
    { key: 'nextAction', header: ko.nextAction, sortable: true }
  ];

  const handleQueryChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set('q', value);
    else next.delete('q');
    setSearchParams(next);
  };

  const handleHealthChange = (value: string) => {
    setHealth(value);
    const next = new URLSearchParams(searchParams);
    if (value === 'all') next.delete('health');
    else next.set('health', value);
    setSearchParams(next);
  };

  return (
    <section>
      <PageTitle title={isAgency ? ko.agencyTitle : ko.supplierTitle} description={isAgency ? ko.agencyDesc : ko.supplierDesc} />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard label={isAgency ? ko.activeProjects : ko.supplierTitle} value={`36${ko.cases}`} />
        <MetricCard label={ko.totalAmount} value={`248${ko.won100m}`} />
        <MetricCard label={isAgency ? ko.inspectionWaiting : ko.extensionReady} value={`11${ko.cases}`} />
        <MetricCard label={isAgency ? ko.riskProjects : ko.endingSoon} value={`6${ko.cases}`} tone="danger" />
      </div>
      <PageToolbar
        searchPlaceholder={isAgency ? ko.searchAgency : ko.searchSupplier}
        searchValue={query}
        onSearchChange={handleQueryChange}
        resultCount={filteredRows.length}
        selects={[
          { label: ko.status, value: health, onChange: handleHealthChange, options: [
            { label: ko.allStatus, value: 'all' },
            { label: ko.normal, value: 'normal' },
            { label: ko.watch, value: 'watch' },
            { label: ko.risk, value: 'risk' }
          ] },
          { label: ko.period, value: 'all', onChange: () => undefined, options: [{ label: ko.allPeriod, value: 'all' }] }
        ]}
      />
      <DataTable columns={columns} data={filteredRows} getRowKey={(row) => row.id} onRowClick={(row) => navigate(`/supplier/projects/${row.id}`)} emptyMessage={ko.noData} tableClassName="min-w-[1320px] w-full" />
    </section>
  );
}
