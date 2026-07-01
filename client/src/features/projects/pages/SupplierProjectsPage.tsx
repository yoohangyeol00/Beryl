import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { createWonProject, getWonProjects } from '../../../api/wonProjectsApi';
import { EmptyState } from '../../../components/common/EmptyState';
import { LoadingState } from '../../../components/common/LoadingState';
import { MetricCard } from '../../../components/common/MetricCard';
import { PageTitle } from '../../../components/common/PageTitle';
import { PageToolbar } from '../../../components/common/PageToolbar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import type { ProjectHealthStatus, WonProject, WonProjectMutationPayload, WonProjectStatus } from '../../../types/wonProject';
import { getRoleMode, type RoleMode } from '../../modes/roleMode';

const ko = {
  agencyTitle: '계약/수행 관리',
  agencyDesc: '선정 이후 사업별 계약, 착수, 투입, 산출물, 검수와 리스크를 관리합니다.',
  supplierTitle: '참여 사업',
  supplierDesc: '당사가 인력을 투입해 수행 중인 사업과 종료/연장 가능성을 관리합니다.',
  activeProjects: '수행 사업',
  totalAmount: '총 계약금액',
  inspectionWaiting: '검수 대기',
  riskProjects: '리스크 사업',
  endingSoon: '종료 임박',
  project: '수행 사업',
  supplier: '공급기업',
  agency: '발주기관',
  stage: '수행 단계',
  assignedPeople: '투입 인력',
  amount: '계약금액',
  endDate: '계약 종료일',
  mmProgress: 'M/M 진척',
  health: '수행 리스크',
  nextAction: '다음 조치',
  searchAgency: '사업명, 공급기업, 발주기관 검색',
  searchSupplier: '사업명, 발주기관, 인력 검색',
  status: '상태',
  allStatus: '상태 전체',
  noData: '조건에 맞는 수행 사업이 없습니다.',
  cases: '건',
  won100m: '억원',
  addProject: '수행사업 등록',
  save: '저장',
  cancel: '취소'
};

const statusLabel: Record<WonProjectStatus, string> = {
  preparing: '계약준비',
  inProgress: '수행중',
  atRisk: '위험',
  completed: '완료',
  cancelled: '취소'
};

const healthLabel: Record<ProjectHealthStatus, string> = {
  normal: '정상',
  watch: '주의',
  risk: '위험'
};

const initialForm: WonProjectMutationPayload = {
  name: '',
  buyerName: '',
  contractAmount: '',
  startedAt: '',
  endedAt: '',
  status: 'inProgress',
  plannedManMonths: '',
  actualManMonths: '',
  progressRate: 0,
  healthStatus: 'normal',
  nextAction: '',
  logBody: ''
};

export function SupplierProjectsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [role, setRole] = useState<RoleMode>(() => getRoleMode(location.pathname));
  const [health, setHealth] = useState(searchParams.get('health') ?? 'all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<WonProjectMutationPayload>(initialForm);
  const query = searchParams.get('q') ?? '';
  const isAgency = role === 'agency';

  const projectsQuery = useQuery({
    queryKey: ['won-projects', query, health],
    queryFn: () => getWonProjects({ q: query || undefined, healthStatus: health === 'all' ? undefined : health as ProjectHealthStatus })
  });

  const createMutation = useMutation({
    mutationFn: createWonProject,
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ['won-projects'] });
      setIsCreateOpen(false);
      setForm(initialForm);
      navigate(`/supplier/projects/${created.id}`);
    }
  });

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
  }, [location.pathname]);

  useEffect(() => {
    setRole(getRoleMode(location.pathname));
  }, [location.pathname]);

  const rows = projectsQuery.data?.items ?? [];
  const summary = projectsQuery.data?.summary;
  const columns = useMemo<DataTableColumn<WonProject>[]>(() => [
    { key: 'name', header: isAgency ? ko.project : ko.supplierTitle, sortable: true, render: (row) => <strong>{row.name}</strong> },
    { key: isAgency ? 'supplierName' : 'buyerName', header: isAgency ? ko.supplier : ko.agency, sortable: true, render: (row) => isAgency ? row.supplierName : row.buyerName },
    { key: 'status', header: ko.stage, sortable: true, render: (row) => <Badge tone={row.status === 'atRisk' ? 'danger' : row.status === 'inProgress' ? 'success' : 'info'}>{statusLabel[row.status]}</Badge> },
    { key: 'assignmentCount', header: ko.assignedPeople, sortable: true, render: (row) => row.assignmentNames.length ? `${row.assignmentNames.slice(0, 2).join(', ')}${row.assignmentNames.length > 2 ? ` 외 ${row.assignmentNames.length - 2}명` : ''}` : `${row.assignmentCount}명` },
    { key: 'contractAmount', header: ko.amount, align: 'right', sortable: true, sortValue: (row) => row.contractAmount, render: (row) => `${Math.round(row.contractAmount / 100000000)}${ko.won100m}` },
    { key: 'endedAt', header: ko.endDate, sortable: true },
    { key: 'progressRate', header: ko.mmProgress, align: 'right', sortable: true, render: (row) => `${row.progressRate}%` },
    { key: 'healthStatus', header: ko.health, sortable: true, render: (row) => <Badge tone={row.healthStatus === 'risk' ? 'danger' : row.healthStatus === 'watch' ? 'info' : 'success'}>{healthLabel[row.healthStatus]}</Badge> },
    { key: 'nextAction', header: ko.nextAction, sortable: true, cellClassName: 'whitespace-normal min-w-[220px]' }
  ], [isAgency]);

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

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    createMutation.mutate({
      ...form,
      logTitle: '수행 사업 등록',
      logType: 'created'
    });
  };

  return (
    <section>
      <PageTitle
        title={isAgency ? ko.agencyTitle : ko.supplierTitle}
        description={isAgency ? ko.agencyDesc : ko.supplierDesc}
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setIsCreateOpen(true)}>{ko.addProject}</Button>}
      />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard label={isAgency ? ko.activeProjects : ko.supplierTitle} value={`${summary?.total ?? 0}${ko.cases}`} />
        <MetricCard label={ko.totalAmount} value={`${Math.round((summary?.totalAmount ?? 0) / 100000000)}${ko.won100m}`} />
        <MetricCard label={isAgency ? ko.inspectionWaiting : ko.endingSoon} value={`${isAgency ? summary?.inspectionWaiting ?? 0 : summary?.endingSoon ?? 0}${ko.cases}`} />
        <MetricCard label={ko.riskProjects} value={`${summary?.riskProjects ?? 0}${ko.cases}`} tone="danger" />
      </div>
      <PageToolbar
        searchPlaceholder={isAgency ? ko.searchAgency : ko.searchSupplier}
        searchValue={query}
        onSearchChange={handleQueryChange}
        resultCount={projectsQuery.data?.total ?? 0}
        selects={[{
          label: ko.status,
          value: health,
          onChange: handleHealthChange,
          options: [
            { label: ko.allStatus, value: 'all' },
            { label: healthLabel.normal, value: 'normal' },
            { label: healthLabel.watch, value: 'watch' },
            { label: healthLabel.risk, value: 'risk' }
          ]
        }]}
      />
      <div className="mt-6">
        {projectsQuery.isLoading ? <LoadingState /> : projectsQuery.isError ? (
          <EmptyState title="수행 사업을 불러오지 못했습니다." description="잠시 후 다시 시도하세요." />
        ) : (
          <DataTable columns={columns} data={rows} getRowKey={(row) => row.id} onRowClick={(row) => navigate(`/supplier/projects/${row.id}`)} emptyMessage={ko.noData} tableClassName="min-w-[1200px] w-full" />
        )}
      </div>
      <Modal
        open={isCreateOpen}
        title={ko.addProject}
        onClose={() => setIsCreateOpen(false)}
        footer={
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>{ko.cancel}</Button>
            <Button type="submit" form="won-project-create-form" disabled={createMutation.isPending}>{createMutation.isPending ? '저장 중...' : ko.save}</Button>
          </div>
        }
      >
        <ProjectForm id="won-project-create-form" form={form} setForm={setForm} onSubmit={handleCreate} />
      </Modal>
    </section>
  );
}

function ProjectForm({
  id,
  form,
  setForm,
  onSubmit
}: {
  id: string;
  form: WonProjectMutationPayload;
  setForm: (form: WonProjectMutationPayload) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  const update = (key: keyof WonProjectMutationPayload, value: string) => setForm({ ...form, [key]: value });

  return (
    <form id={id} className="grid gap-4 pb-6 md:grid-cols-2" onSubmit={onSubmit}>
      <Input label="사업명" value={form.name ?? ''} onChange={(event) => update('name', event.target.value)} required />
      <Input label="발주기관" value={form.buyerName ?? ''} onChange={(event) => update('buyerName', event.target.value)} required />
      <Input label="계약금액" type="number" value={form.contractAmount ?? ''} onChange={(event) => update('contractAmount', event.target.value)} />
      <Input label="진행률(%)" type="number" min={0} max={100} value={form.progressRate ?? ''} onChange={(event) => update('progressRate', event.target.value)} />
      <Input label="시작일" type="date" value={form.startedAt ?? ''} onChange={(event) => update('startedAt', event.target.value)} />
      <Input label="종료일" type="date" value={form.endedAt ?? ''} onChange={(event) => update('endedAt', event.target.value)} />
      <Input label="계획 M/M" type="number" value={form.plannedManMonths ?? ''} onChange={(event) => update('plannedManMonths', event.target.value)} />
      <Input label="실적 M/M" type="number" value={form.actualManMonths ?? ''} onChange={(event) => update('actualManMonths', event.target.value)} />
      <label className="block">
        <span className="mb-2 block font-label text-label-sm text-on-surface-variant">수행 단계</span>
        <select className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4" value={form.status ?? 'inProgress'} onChange={(event) => update('status', event.target.value)}>
          {Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block font-label text-label-sm text-on-surface-variant">수행 리스크</span>
        <select className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4" value={form.healthStatus ?? 'normal'} onChange={(event) => update('healthStatus', event.target.value)}>
          {Object.entries(healthLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="md:col-span-2">
        <span className="mb-2 block font-label text-label-sm text-on-surface-variant">다음 조치</span>
        <textarea className="min-h-24 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3" value={form.nextAction ?? ''} onChange={(event) => update('nextAction', event.target.value)} />
      </label>
      <label className="md:col-span-2">
        <span className="mb-2 block font-label text-label-sm text-on-surface-variant">등록 로그 메모</span>
        <textarea className="min-h-24 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3" value={form.logBody ?? ''} onChange={(event) => update('logBody', event.target.value)} />
      </label>
    </form>
  );
}
