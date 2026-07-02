import { useQueryClient } from '@tanstack/react-query';
import { Building2, Download, FileText, Pencil, PlusCircle, ShieldCheck, Star, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/apiResponse';
import { deleteSupplierRelationship } from '../../../api/suppliersApi';
import { EmptyState } from '../../../components/common/EmptyState';
import { LoadingState } from '../../../components/common/LoadingState';
import { MetricCard } from '../../../components/common/MetricCard';
import { PageTitle } from '../../../components/common/PageTitle';
import { PageToolbar } from '../../../components/common/PageToolbar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { getSupplierClientFormPath, getSupplierFormPath, type RoleMode } from '../../modes/roleMode';
import { useSupplierRelationships } from '../hooks/useSupplierRelationships';
import { supplierLabels, supplierStatusLabel } from '../labels';
import type { SupplierAttachment, SupplierCompany } from '../types';
import { mapSupplierRelationshipToCompany } from '../utils/supplierMappers';

type CompanyRelationshipListViewProps = {
  mode?: RoleMode;
};

export function CompanyRelationshipListView({ mode }: CompanyRelationshipListViewProps = {}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [role, setRole] = useState<RoleMode>(mode ?? 'agency');
  const [searchValue, setSearchValue] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierCompany | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const isAgency = role === 'agency';
  const { data, isLoading, isError, error } = useSupplierRelationships({
    perspective: isAgency ? 'buyer' : 'supplier',
    q: searchValue.trim() || undefined
  });
  const suppliers = (data?.items ?? []).map(mapSupplierRelationshipToCompany);
  const getRelationshipFormPath = (relationshipId?: string) => (isAgency ? getSupplierFormPath(relationshipId) : getSupplierClientFormPath(relationshipId));

  useEffect(() => {
    if (mode) {
      setRole(mode);
      return;
    }

    const handleRoleChange = (event: Event) => {
      const nextRole = (event as CustomEvent<RoleMode>).detail;
      setRole(nextRole === 'supplier' ? 'supplier' : 'agency');
    };
    const handleStorage = () => setRole(window.localStorage.getItem('beryl-role-mode') === 'supplier' ? 'supplier' : 'agency');

    window.addEventListener('beryl-role-change', handleRoleChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('beryl-role-change', handleRoleChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [mode]);

  async function handleDeleteSupplier(supplier: SupplierCompany) {
    if (!window.confirm(`${supplier.name} ${isAgency ? '공급기업 관계' : '거래처 관계'}를 삭제하시겠습니까?`)) return;

    setDeleteErrorMessage('');
    setIsDeleting(true);

    try {
      await deleteSupplierRelationship(supplier.id, { perspective: isAgency ? 'buyer' : 'supplier' });
      await queryClient.invalidateQueries({ queryKey: ['supplier-relationships'] });
      setSelectedSupplier(null);
    } catch (deleteError) {
      setDeleteErrorMessage(getApiErrorMessage(deleteError, isAgency ? '공급기업 삭제 중 오류가 발생했습니다.' : '거래처 삭제 중 오류가 발생했습니다.'));
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: DataTableColumn<SupplierCompany>[] = [
    {
      key: 'name',
      header: isAgency ? supplierLabels.supplierName : supplierLabels.clientName,
      render: (row) => <strong className="text-[18px]">{row.name}</strong>,
      sortable: true
    },
    { key: 'specialty', header: supplierLabels.specialty, sortable: true },
    { key: 'contact', header: supplierLabels.contact, sortable: true },
    { key: 'grade', header: supplierLabels.grade, align: 'center', sortable: true },
    {
      key: 'proposalCount',
      header: isAgency ? supplierLabels.proposalCount : '수행 사업',
      align: 'right',
      sortable: true,
      sortValue: (row) => isAgency ? row.proposalCount : row.projectCount,
      render: (row) => `${isAgency ? row.proposalCount : row.projectCount}${supplierLabels.cases}`
    },
    {
      key: 'winRate',
      header: isAgency ? supplierLabels.winRate : '진행 사업',
      align: 'right',
      sortable: true,
      sortValue: (row) => isAgency ? row.winRate : row.activeProjectCount,
      render: (row) => isAgency ? `${row.winRate}${supplierLabels.percent}` : `${row.activeProjectCount}${supplierLabels.cases}`
    },
    {
      key: 'evaluation',
      header: isAgency ? supplierLabels.evaluation : '계약 합계',
      align: 'right',
      sortable: true,
      sortValue: (row) => isAgency ? row.evaluation : row.totalContractAmount,
      render: (row) => isAgency ? `${row.evaluation}${supplierLabels.point}` : formatCurrency(row.totalContractAmount)
    },
    { key: 'tags', header: supplierLabels.tags, cellClassName: 'whitespace-normal min-w-[180px]' },
    {
      key: 'updatedAt',
      header: '갱신일',
      sortable: true,
      render: (row) => formatDate(row.updatedAt)
    },
    {
      key: 'status',
      header: supplierLabels.status,
      render: (row) => (
        <Badge tone={row.status === 'preferred' ? 'success' : row.status === 'watch' ? 'danger' : row.status === 'review' ? 'info' : 'neutral'}>
          {supplierStatusLabel[row.status]}
        </Badge>
      )
    }
  ];

  return (
    <section>
      <PageTitle
        title={isAgency ? supplierLabels.agencyTitle : supplierLabels.supplierTitle}
        description={isAgency ? supplierLabels.agencyDesc : supplierLabels.supplierDesc}
        actions={
          <Button icon={<PlusCircle className="h-4 w-4" />} onClick={() => navigate(getRelationshipFormPath())}>
            {isAgency ? supplierLabels.addAgency : supplierLabels.addSupplier}
          </Button>
        }
      />

      {isAgency ? (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <MetricCard label={supplierLabels.total} value={`${suppliers.length}${supplierLabels.count}`} />
            <MetricCard
              label={supplierLabels.preferred}
              value={`${suppliers.filter((supplier) => supplier.status === 'preferred').length}${supplierLabels.count}`}
            />
            <MetricCard
              label={supplierLabels.watch}
              value={`${suppliers.filter((supplier) => supplier.status === 'watch').length}${supplierLabels.count}`}
              tone="danger"
            />
            <MetricCard label={supplierLabels.avgScore} value={`-${supplierLabels.point}`} />
          </div>
          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="font-headline text-[22px] font-bold">{supplierLabels.capabilityTitle}</h2>
              </div>
              <p className="text-sm leading-6 text-on-surface-variant">{supplierLabels.capabilityDesc}</p>
            </Card>
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-3">
                <Star className="h-5 w-5 text-primary" />
                <h2 className="font-headline text-[22px] font-bold">{supplierLabels.riskTitle}</h2>
              </div>
              <p className="text-sm leading-6 text-on-surface-variant">{supplierLabels.riskDesc}</p>
            </Card>
          </div>
        </>
      ) : null}

      <PageToolbar
        searchPlaceholder={isAgency ? supplierLabels.searchAgency : supplierLabels.searchSupplier}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        resultCount={suppliers.length}
      >
        <Button variant="secondary" icon={<Building2 className="h-4 w-4" />}>
          {supplierLabels.allSpecialty}
        </Button>
        <Button variant="secondary" icon={<Users className="h-4 w-4" />}>
          {supplierLabels.allStatus}
        </Button>
      </PageToolbar>

      {isLoading ? <LoadingState /> : null}
      {deleteErrorMessage ? (
        <div className="mb-6 rounded-lg border border-error/30 bg-error-container px-5 py-4 font-semibold text-on-error-container">
          {deleteErrorMessage}
        </div>
      ) : null}
      {isError ? (
        <Card className="p-6">
          <p className="font-semibold text-error">{getApiErrorMessage(error, '공급기업 목록을 불러오지 못했습니다.')}</p>
        </Card>
      ) : null}
      {!isLoading && !isError && suppliers.length === 0 ? (
        <EmptyState title="등록된 공급기업이 없습니다." description="공급기업 등록 버튼으로 협력사를 추가하세요." />
      ) : null}
      {!isLoading && !isError && suppliers.length > 0 ? (
        <DataTable
          columns={columns}
          data={suppliers}
          getRowKey={(row) => row.id}
          onRowClick={(row) => setSelectedSupplier(row)}
          tableClassName="min-w-[1180px] w-full"
        />
      ) : null}

      <Modal
        open={selectedSupplier !== null}
        title={selectedSupplier ? `${selectedSupplier.name} ${supplierLabels.detailTitle}` : supplierLabels.detailTitle}
        onClose={() => setSelectedSupplier(null)}
        actions={
          selectedSupplier ? (
            <div className="flex items-center gap-2">
              <Button variant="secondary" icon={<Pencil className="h-4 w-4" />} onClick={() => navigate(getRelationshipFormPath(selectedSupplier.id))}>
                수정
              </Button>
              <Button
                variant="secondary"
                className="!border-error !text-error hover:!bg-error/5"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={() => handleDeleteSupplier(selectedSupplier)}
                disabled={isDeleting}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </Button>
            </div>
          ) : null
        }
        footer={
          <Button variant="secondary" type="button" onClick={() => setSelectedSupplier(null)}>
            닫기
          </Button>
        }
      >
        {selectedSupplier ? <SupplierDetailContent supplier={selectedSupplier} /> : null}
      </Modal>
    </section>
  );
}


function SupplierDetailContent({ supplier }: { supplier: SupplierCompany }) {
  const projectRows = getSupplierProjectRows(supplier);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryBox label={supplierLabels.grade} value={supplier.grade} />
        <SummaryBox label="수행 사업" value={`${supplier.projectCount}${supplierLabels.cases}`} />
        <SummaryBox label="계약 합계" value={formatCurrency(supplier.totalContractAmount)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section>
          <h3 className="mb-3 font-headline text-[20px] font-bold">{supplierLabels.contactInfo}</h3>
          <dl className="space-y-3 rounded-lg border border-outline-variant p-4">
            <DetailLine label={supplierLabels.specialty} value={supplier.specialty} />
            <DetailLine label={supplierLabels.contact} value={supplier.contact} />
            <DetailLine label={supplierLabels.tags} value={supplier.tags} />
            <DetailLine label={supplierLabels.status} value={supplierStatusLabel[supplier.status]} />
            <DetailLine label="갱신일" value={formatDateTime(supplier.updatedAt)} />
          </dl>
          <h4 className="mb-3 mt-3 font-headline text-[18px] font-bold">첨부 파일</h4>
          <SupplierAttachmentList files={supplier.certificationFiles} />
        </section>

        <section>
          <h3 className="mb-3 font-headline text-[20px] font-bold">{supplierLabels.projectHistory}</h3>
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
        <h3 className="mb-2 font-headline text-[20px] font-bold text-primary">{supplierLabels.evaluationMemo}</h3>
        <p className="text-sm leading-6 text-on-surface-variant">
          {supplier.name}은 {supplier.specialty} 영역의 수행 경험이 누적되어 있으며, 최근 평가 {supplier.evaluation}
          {supplierLabels.point}, 선정률 {supplier.winRate}
          {supplierLabels.percent} 기준으로 다음 공고 제안 요청 시 우선 검토할 수 있습니다.
        </p>
      </section>
    </div>
  );
}

function SupplierAttachmentList({ files }: { files: SupplierAttachment[] }) {
  if (files.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-outline-variant p-4 text-sm text-on-surface-variant">
        등록된 첨부 파일이 없습니다.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {files.map((file) => (
        <li key={file.id}>
          <a
            href={file.url ?? '#'}
            download={file.fileName ?? file.name}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant p-3 transition hover:bg-surface-container-low"
          >
            <span className="flex min-w-0 items-center gap-2">
              <FileText className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate font-semibold text-on-surface">{file.fileName ?? file.name}</span>
            </span>
            <Download className="h-4 w-4 shrink-0 text-on-surface-variant" />
          </a>
        </li>
      ))}
    </ul>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
      <p className="text-sm text-on-surface-variant">{label}</p>
      <p className="mt-2 font-headline text-[24px] font-bold text-primary">{value}</p>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-sm text-on-surface-variant">{label}</dt>
      <dd className="text-right font-semibold text-on-surface">{value}</dd>
    </div>
  );
}

function getSupplierProjectRows(supplier: SupplierCompany) {
  if (supplier.projectCount === 0) {
    return [
      {
        label: '연결된 수행사업 없음',
        value: '수행사업이 등록되면 거래처와 자동으로 연결됩니다.'
      }
    ];
  }

  return [
    {
      label: supplier.latestProjectName || '최근 수행사업',
      value: `${formatProjectStatus(supplier.latestProjectStatus)} / ${formatCurrency(supplier.totalContractAmount)}`
    },
    {
      label: '수행사업 요약',
      value: `총 ${supplier.projectCount}건 · 진행 ${supplier.activeProjectCount}건`
    }
  ];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10) || '-';

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

function formatDateTime(value: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || '-';

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatProjectStatus(value: string) {
  const labels: Record<string, string> = {
    preparing: '계약준비',
    inProgress: '수행중',
    atRisk: '위험',
    completed: '완료',
    cancelled: '취소'
  };

  return (labels[value] ?? value) || '-';
}
