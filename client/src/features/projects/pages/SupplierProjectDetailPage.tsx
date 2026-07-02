import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getWonProject, updateWonProject } from '../../../api/wonProjectsApi';
import { EmptyState } from '../../../components/common/EmptyState';
import { LoadingState } from '../../../components/common/LoadingState';
import { MetricCard } from '../../../components/common/MetricCard';
import { PageTitle } from '../../../components/common/PageTitle';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import type { ProjectAssignment, ProjectHealthStatus, WonProjectDetail, WonProjectMutationPayload, WonProjectStatus } from '../../../types/wonProject';

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

const assignmentColumns: DataTableColumn<ProjectAssignment>[] = [
  { key: 'name', header: '투입 인력', render: (row) => <strong>{row.name}</strong>, sortable: true },
  { key: 'role', header: '역할', sortable: true },
  { key: 'allocationRate', header: '투입률', align: 'right', sortable: true, render: (row) => `${Math.round(row.allocationRate * 100)}%` },
  { key: 'plannedManMonths', header: '계획 M/M', align: 'right', sortable: true },
  { key: 'actualManMonths', header: '실적 M/M', align: 'right', sortable: true },
  { key: 'assignedFrom', header: '투입 시작일', sortable: true },
  { key: 'assignedTo', header: '투입 종료일', sortable: true },
  { key: 'status', header: '상태', render: (row) => <Badge tone={row.status === 'cancelled' ? 'danger' : row.status === 'completed' ? 'info' : 'success'}>{formatAssignmentStatus(row.status)}</Badge> }
];

export function SupplierProjectDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { projectId = '' } = useParams();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const projectQuery = useQuery({
    queryKey: ['won-project', projectId],
    queryFn: () => getWonProject(projectId),
    enabled: !!projectId
  });
  const project = projectQuery.data;
  const [editForm, setEditForm] = useState<WonProjectMutationPayload>({ name: '' });

  useEffect(() => {
    if (!project) return;
    setEditForm(toEditForm(project));
  }, [project]);

  const updateMutation = useMutation({
    mutationFn: (payload: WonProjectMutationPayload) => updateWonProject(projectId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['won-project', projectId] });
      await queryClient.invalidateQueries({ queryKey: ['won-projects'] });
      setIsEditOpen(false);
    }
  });

  if (projectQuery.isLoading) return <LoadingState />;
  if (projectQuery.isError || !project) {
    return <EmptyState title="수행 사업을 불러오지 못했습니다." description="사업이 삭제되었거나 접근 권한이 없을 수 있습니다." />;
  }

  const riskTone = project.healthStatus === 'risk' ? 'danger' : 'primary';

  const handleEditSubmit = (event: FormEvent) => {
    event.preventDefault();
    updateMutation.mutate({
      ...editForm,
      logType: 'progress',
      logTitle: '진행 상태 수정'
    });
  };

  return (
    <section>
      <PageTitle
        title={project.name}
        description={`${project.supplierName}의 투입 인력, 계약 기간, 진행 상태와 수행 리스크를 확인합니다.`}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/supplier/projects')}>목록</Button>
            <Button icon={<Pencil className="h-4 w-4" />} onClick={() => setIsEditOpen(true)}>진행 수정</Button>
          </>
        }
      />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard label="발주기관" value={project.buyerName} />
        <MetricCard label="투입 인력" value={`${project.assignments.length}명`} />
        <MetricCard label="진행률" value={`${project.progressRate}%`} />
        <MetricCard label="수행 리스크" value={healthLabel[project.healthStatus]} tone={riskTone} />
      </div>
      <div className="mb-6 grid gap-4 xl:grid-cols-3">
        <Card className="p-6">
          <p className="font-label text-label-sm uppercase text-on-surface-variant">다음 조치</p>
          <p className="mt-2 text-[20px] font-bold text-on-surface">{project.nextAction || '-'}</p>
        </Card>
        <Card className="p-6">
          <p className="font-label text-label-sm uppercase text-on-surface-variant">계약 금액</p>
          <p className="mt-2 text-[20px] font-bold text-primary">{formatCurrency(project.contractAmount)}</p>
        </Card>
        <Card className="p-6">
          <p className="font-label text-label-sm uppercase text-on-surface-variant">M/M 실적</p>
          <p className="mt-2 text-[20px] font-bold text-primary">{project.actualManMonths} / {project.plannedManMonths}</p>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <div className="border-b border-outline-variant p-6">
            <h2 className="font-headline text-[24px] font-bold">투입 인력</h2>
          </div>
          <DataTable columns={assignmentColumns} data={project.assignments} getRowKey={(row) => row.id} emptyMessage="등록된 투입 인력이 없습니다." tableClassName="min-w-[900px] w-full" />
        </Card>
        <Card className="p-6">
          <div className="mb-5 border-b border-outline-variant pb-4">
            <h2 className="font-headline text-[24px] font-bold">진행 로그</h2>
          </div>
          <div className="space-y-4">
            {project.logs.length ? project.logs.map((log) => (
              <div key={log.id} className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <strong>{log.title}</strong>
                  <Badge tone={log.healthStatus === 'risk' ? 'danger' : log.healthStatus === 'watch' ? 'info' : 'success'}>{log.progressRate ?? '-'}%</Badge>
                </div>
                {log.body ? <p className="text-sm leading-6 text-on-surface-variant">{log.body}</p> : null}
                {log.nextAction ? <p className="mt-2 text-sm text-primary">다음 조치: {log.nextAction}</p> : null}
                <p className="mt-3 text-xs text-on-surface-variant">{formatDateTime(log.createdAt)} · {log.authorName || '시스템'}</p>
              </div>
            )) : <p className="text-sm text-on-surface-variant">아직 저장된 로그가 없습니다.</p>}
          </div>
        </Card>
      </div>
      <Modal
        open={isEditOpen}
        title="진행 상태 수정"
        onClose={() => setIsEditOpen(false)}
        footer={
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>취소</Button>
            <Button type="submit" form="won-project-edit-form" disabled={updateMutation.isPending}>{updateMutation.isPending ? '저장 중...' : '저장'}</Button>
          </div>
        }
      >
        <ProjectEditForm id="won-project-edit-form" form={editForm} setForm={setEditForm} onSubmit={handleEditSubmit} />
      </Modal>
    </section>
  );
}

function ProjectEditForm({ id, form, setForm, onSubmit }: { id: string; form: WonProjectMutationPayload; setForm: (form: WonProjectMutationPayload) => void; onSubmit: (event: FormEvent) => void }) {
  const update = (key: keyof WonProjectMutationPayload, value: string) => setForm({ ...form, [key]: value });
  return (
    <form id={id} className="grid gap-4 pb-6 md:grid-cols-2" onSubmit={onSubmit}>
      <Input label="사업명" value={form.name ?? ''} onChange={(event) => update('name', event.target.value)} required />
      <Input label="계약금액" type="number" value={form.contractAmount ?? ''} onChange={(event) => update('contractAmount', event.target.value)} />
      <Input label="시작일" type="date" value={form.startedAt ?? ''} onChange={(event) => update('startedAt', event.target.value)} />
      <Input label="종료일" type="date" value={form.endedAt ?? ''} onChange={(event) => update('endedAt', event.target.value)} />
      <Input label="계획 M/M" type="number" value={form.plannedManMonths ?? ''} onChange={(event) => update('plannedManMonths', event.target.value)} />
      <Input label="실적 M/M" type="number" value={form.actualManMonths ?? ''} onChange={(event) => update('actualManMonths', event.target.value)} />
      <Input label="진행률(%)" type="number" min={0} max={100} value={form.progressRate ?? ''} onChange={(event) => update('progressRate', event.target.value)} />
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
        <span className="mb-2 block font-label text-label-sm text-on-surface-variant">수정 로그 메모</span>
        <textarea className="min-h-24 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3" value={form.logBody ?? ''} onChange={(event) => update('logBody', event.target.value)} />
      </label>
    </form>
  );
}

function toEditForm(project: WonProjectDetail): WonProjectMutationPayload {
  return {
    name: project.name,
    contractAmount: project.contractAmount,
    startedAt: project.startedAt,
    endedAt: project.endedAt,
    status: project.status,
    plannedManMonths: project.plannedManMonths,
    actualManMonths: project.actualManMonths,
    progressRate: project.progressRate,
    healthStatus: project.healthStatus,
    nextAction: project.nextAction,
    logBody: ''
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(value);
}

function formatDateTime(value: string) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function formatAssignmentStatus(value: string) {
  const labels: Record<string, string> = {
    planned: '계획',
    assigned: '투입중',
    completed: '완료',
    cancelled: '취소'
  };
  return labels[value] ?? value;
}
