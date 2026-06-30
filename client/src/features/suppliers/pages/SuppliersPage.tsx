import { Building2, PlusCircle, ShieldCheck, Star, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/apiResponse';
import { EmptyState } from '../../../components/common/EmptyState';
import { LoadingState } from '../../../components/common/LoadingState';
import { PageTitle } from '../../../components/common/PageTitle';
import { PageToolbar } from '../../../components/common/PageToolbar';
import { MetricCard } from '../../../components/common/MetricCard';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { useSupplierRelationships } from '../hooks/useSupplierRelationships';

type RoleMode = 'agency' | 'supplier';
type SupplierStatus = 'preferred' | 'active' | 'review' | 'watch';

type SupplierCompany = {
  id: string;
  name: string;
  specialty: string;
  contact: string;
  grade: string;
  proposalCount: number;
  winRate: number;
  evaluation: number;
  tags: string;
  status: SupplierStatus;
};

const ko = {
  agencyTitle: '\uACF5\uAE09\uAE30\uC5C5 \uD480',
  agencyDesc: '\uBC1C\uC8FC \uC0AC\uC5C5\uC5D0 \uCC38\uC5EC\uD560 \uC218 \uC788\uB294 \uACF5\uAE09\uAE30\uC5C5\uC758 \uC804\uBB38 \uC5ED\uB7C9, \uD3C9\uAC00 \uC774\uB825, \uB0B4\uBD80 \uAD00\uB9AC \uD0DC\uADF8\uB97C \uAD00\uB9AC\uD569\uB2C8\uB2E4.',
  supplierTitle: '\uAC70\uB798\uCC98 \uAD00\uB9AC',
  supplierDesc: '\uB2F9\uC0AC\uAC00 \uAC70\uB798\uD558\uB294 \uBC1C\uC8FC\uCC98\uC640 \uC218\uD589 \uC0AC\uC5C5, \uC5F0\uC7A5 \uAC00\uB2A5\uC131\uC744 \uAD00\uB9AC\uD569\uB2C8\uB2E4.',
  addAgency: '\uACF5\uAE09\uAE30\uC5C5 \uB4F1\uB85D',
  addSupplier: '\uAC70\uB798\uCC98 \uB4F1\uB85D',
  total: '\uB4F1\uB85D \uACF5\uAE09\uAE30\uC5C5',
  preferred: '\uC6B0\uC218 \uD611\uB825\uC0AC',
  watch: '\uC8FC\uC758 \uAD00\uB9AC',
  avgScore: '\uD3C9\uADE0 \uD3C9\uAC00\uC810\uC218',
  capabilityTitle: '\uD480 \uAD6C\uC131 \uC694\uC57D',
  capabilityDesc: '\uACC4\uC57D/\uC218\uD589 \uD654\uBA74\uC740 \uC0AC\uC5C5 \uC9C4\uD589\uC744 \uBCF4\uACE0, \uC774 \uD654\uBA74\uC740 \uC5C5\uCCB4\uBCC4 \uC5ED\uB7C9\uACFC \uD3C9\uAC00 \uAE30\uB85D\uC744 \uBCF4\uB294 \uACF3\uC785\uB2C8\uB2E4.',
  riskTitle: '\uAD00\uB9AC \uD0DC\uADF8',
  riskDesc: '\uC6B0\uC218, \uC8FC\uC758, \uAC80\uD1A0\uC911 \uD0DC\uADF8\uB85C \uC81C\uC548 \uC694\uCCAD\uC774\uB098 \uC6B0\uC120\uD611\uC0C1 \uC2DC \uCC38\uACE0\uD569\uB2C8\uB2E4.',
  supplierName: '\uACF5\uAE09\uAE30\uC5C5',
  clientName: '\uAC70\uB798\uCC98/\uBC1C\uC8FC\uCC98',
  specialty: '\uC804\uBB38 \uC5ED\uC5ED',
  contact: '\uB300\uD45C \uB2F4\uB2F9\uC790',
  grade: '\uB0B4\uBD80 \uB4F1\uAE09',
  proposalCount: '\uCC38\uC5EC \uC81C\uC548',
  winRate: '\uC120\uC815\uB960',
  evaluation: '\uCD5C\uADFC \uD3C9\uAC00',
  tags: '\uAD00\uB9AC \uD0DC\uADF8',
  status: '\uC0C1\uD0DC',
  searchAgency: '\uACF5\uAE09\uAE30\uC5C5\uBA85, \uC804\uBB38 \uC5ED\uC5ED, \uD0DC\uADF8 \uAC80\uC0C9',
  searchSupplier: '\uAC70\uB798\uCC98\uBA85, \uBD84\uC57C, \uB2F4\uB2F9\uC790 \uAC80\uC0C9',
  allSpecialty: '\uC804\uBB38 \uC5ED\uC5ED \uC804\uCCB4',
  allStatus: '\uC0C1\uD0DC \uC804\uCCB4',
  count: '\uAC1C\uC0AC',
  cases: '\uAC74',
  point: '\uC810',
  percent: '%',
  statusPreferred: '\uC6B0\uC218',
  statusActive: '\uC6B4\uC601\uC911',
  statusReview: '\uAC80\uD1A0\uC911',
  statusWatch: '\uC8FC\uC758',
  detailTitle: '\uC0C1\uC138 \uC815\uBCF4',
  projectHistory: '\uCC38\uC5EC/\uC218\uD589 \uC0AC\uC5C5',
  contactInfo: '\uB2F4\uB2F9\uC790/\uC5F0\uB77D',
  evaluationMemo: '\uD3C9\uAC00 \uBA54\uBAA8',
  close: '\uB2EB\uAE30'
};

const statusLabel: Record<SupplierStatus, string> = {
  preferred: ko.statusPreferred,
  active: ko.statusActive,
  review: ko.statusReview,
  watch: ko.statusWatch
};

function getInitialRole(): RoleMode {
  if (typeof window === 'undefined') return 'agency';
  return window.localStorage.getItem('beryl-role-mode') === 'supplier' ? 'supplier' : 'agency';
}

export function SuppliersPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<RoleMode>(getInitialRole);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierCompany | null>(null);
  const isAgency = role === 'agency';
  const { data, isLoading, isError, error } = useSupplierRelationships({ perspective: isAgency ? 'buyer' : 'supplier' });
  const suppliers = (data?.items ?? []).map((relationship) => ({
    id: relationship.id,
    name: relationship.targetCompany.name,
    specialty: relationship.capabilities.length ? relationship.capabilities.join(', ') : relationship.targetCompany.companyType ?? '-',
    contact: relationship.contact?.name ?? '-',
    grade: relationship.internalGrade ?? '-',
    proposalCount: 0,
    winRate: 0,
    evaluation: 0,
    tags: relationship.tags ?? '-',
    status: relationship.managementStatus ?? 'active'
  } satisfies SupplierCompany));

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

  const columns: DataTableColumn<SupplierCompany>[] = [
    { key: 'name', header: isAgency ? ko.supplierName : ko.clientName, render: (row) => <strong className="text-[18px]">{row.name}</strong>, sortable: true },
    { key: 'specialty', header: ko.specialty, sortable: true },
    { key: 'contact', header: ko.contact, sortable: true },
    { key: 'grade', header: ko.grade, align: 'center', sortable: true },
    { key: 'proposalCount', header: ko.proposalCount, align: 'right', sortable: true, render: (row) => `${row.proposalCount}${ko.cases}` },
    { key: 'winRate', header: ko.winRate, align: 'right', sortable: true, render: (row) => `${row.winRate}${ko.percent}` },
    { key: 'evaluation', header: ko.evaluation, align: 'right', sortable: true, render: (row) => `${row.evaluation}${ko.point}` },
    { key: 'tags', header: ko.tags, cellClassName: 'whitespace-normal min-w-[180px]' },
    { key: 'status', header: ko.status, render: (row) => <Badge tone={row.status === 'preferred' ? 'success' : row.status === 'watch' ? 'danger' : row.status === 'review' ? 'info' : 'neutral'}>{statusLabel[row.status]}</Badge> }
  ];

  return (
    <section>
      <PageTitle
        title={isAgency ? ko.agencyTitle : ko.supplierTitle}
        description={isAgency ? ko.agencyDesc : ko.supplierDesc}
        actions={
          <Button icon={<PlusCircle className="h-4 w-4" />} onClick={() => navigate('/suppliers/new')}>
            {isAgency ? ko.addAgency : ko.addSupplier}
          </Button>
        }
      />

      {isAgency ? (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <MetricCard label={ko.total} value={`${suppliers.length}${ko.count}`} />
            <MetricCard label={ko.preferred} value={`${suppliers.filter((supplier) => supplier.status === 'preferred').length}${ko.count}`} />
            <MetricCard label={ko.watch} value={`${suppliers.filter((supplier) => supplier.status === 'watch').length}${ko.count}`} tone="danger" />
            <MetricCard label={ko.avgScore} value={`-${ko.point}`} />
          </div>
          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="font-headline text-[22px] font-bold">{ko.capabilityTitle}</h2>
              </div>
              <p className="text-sm leading-6 text-on-surface-variant">{ko.capabilityDesc}</p>
            </Card>
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-3">
                <Star className="h-5 w-5 text-primary" />
                <h2 className="font-headline text-[22px] font-bold">{ko.riskTitle}</h2>
              </div>
              <p className="text-sm leading-6 text-on-surface-variant">{ko.riskDesc}</p>
            </Card>
          </div>
        </>
      ) : null}

      <PageToolbar searchPlaceholder={isAgency ? ko.searchAgency : ko.searchSupplier}>
        <Button variant="secondary" icon={<Building2 className="h-4 w-4" />}>{ko.allSpecialty}</Button>
        <Button variant="secondary" icon={<Users className="h-4 w-4" />}>{ko.allStatus}</Button>
      </PageToolbar>
      {isLoading ? <LoadingState /> : null}
      {isError ? (
        <Card className="p-6">
          <p className="font-semibold text-error">{getApiErrorMessage(error, '공급기업 목록을 불러오지 못했습니다.')}</p>
        </Card>
      ) : null}
      {!isLoading && !isError && suppliers.length === 0 ? (
        <EmptyState title="등록된 공급기업이 없습니다." description="공급기업 등록 버튼으로 협력사를 추가하세요." />
      ) : null}
      {!isLoading && !isError && suppliers.length > 0 ? (
        <DataTable columns={columns} data={suppliers} getRowKey={(row) => row.id} onRowClick={(row) => setSelectedSupplier(row)} tableClassName="min-w-[1180px] w-full" />
      ) : null}
      <Modal open={selectedSupplier !== null} title={selectedSupplier ? `${selectedSupplier.name} ${ko.detailTitle}` : ko.detailTitle} onClose={() => setSelectedSupplier(null)}>
        {selectedSupplier ? <SupplierDetailModal supplier={selectedSupplier} /> : null}
      </Modal>
    </section>
  );
}

function SupplierDetailModal({ supplier }: { supplier: SupplierCompany }) {
  const projectRows = [
    { label: '\uCC28\uC138\uB300 \uD1B5\uD569 \uC7AC\uB09C \uC548\uC804 \uAD00\uB9AC', value: '\uD3C9\uAC00\uC911 / 8.6\uC5B5\uC6D0' },
    { label: '\uD604\uC7A5 \uB300\uC751 \uBAA8\uBC14\uC77C \uAD00\uC81C', value: '\uC218\uD589\uC911 / 16.4\uC5B5\uC6D0' },
    { label: '\uC18C\uBC29 \uB370\uC774\uD130 \uD1B5\uD569 \uBD84\uC11D', value: '\uAC80\uC218\uB300\uAE30 / 21.8\uC5B5\uC6D0' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
          <p className="text-sm text-on-surface-variant">{ko.grade}</p>
          <p className="mt-2 font-headline text-[24px] font-bold text-primary">{supplier.grade}</p>
        </div>
        <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
          <p className="text-sm text-on-surface-variant">{ko.proposalCount}</p>
          <p className="mt-2 font-headline text-[24px] font-bold text-primary">{supplier.proposalCount}{ko.cases}</p>
        </div>
        <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
          <p className="text-sm text-on-surface-variant">{ko.evaluation}</p>
          <p className="mt-2 font-headline text-[24px] font-bold text-primary">{supplier.evaluation}{ko.point}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section>
          <h3 className="mb-3 font-headline text-[20px] font-bold">{ko.contactInfo}</h3>
          <dl className="space-y-3 rounded-lg border border-outline-variant p-4">
            <DetailLine label={ko.specialty} value={supplier.specialty} />
            <DetailLine label={ko.contact} value={supplier.contact} />
            <DetailLine label={ko.tags} value={supplier.tags} />
            <DetailLine label={ko.status} value={statusLabel[supplier.status]} />
          </dl>
        </section>
        <section>
          <h3 className="mb-3 font-headline text-[20px] font-bold">{ko.projectHistory}</h3>
          <div className="space-y-2">
            {projectRows.map((project) => (
              <div key={project.label} className="rounded-lg border border-outline-variant p-3">
                <p className="font-semibold">{project.label}</p>
                <p className="mt-1 text-sm text-on-surface-variant">{project.value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-lg bg-primary/5 p-4">
        <h3 className="mb-2 font-headline text-[20px] font-bold text-primary">{ko.evaluationMemo}</h3>
        <p className="text-sm leading-6 text-on-surface-variant">{supplier.name}은 {supplier.specialty} 영역의 수행 경험이 누적되어 있으며, 최근 평가 {supplier.evaluation}{ko.point}, 선정률 {supplier.winRate}{ko.percent} 기준으로 다음 공고 제안 요청 시 우선 검토할 수 있습니다.</p>
      </section>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4"><dt className="text-sm text-on-surface-variant">{label}</dt><dd className="text-right font-semibold text-on-surface">{value}</dd></div>;
}
