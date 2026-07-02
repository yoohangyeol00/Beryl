import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/apiResponse';
import { deleteResume, getResume, getResumes } from '../../../api/resumesApi';
import { PageTitle } from '../../../components/common/PageTitle';
import { MetricCard } from '../../../components/common/MetricCard';
import { PageToolbar } from '../../../components/common/PageToolbar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import type { AvailabilityStatus, Resume } from '../../../types/resume';
import { ResumeDetailContent } from '../../resumes/pages/ResumeDetailPage';

const statusLabels: Record<AvailabilityStatus, string> = {
  available: '가용',
  assigned: '투입중',
  partiallyAssigned: '부분투입',
  unavailable: '교체검토'
};

const columns: DataTableColumn<Resume>[] = [
  { key: 'name', header: '인력', sortable: true, render: (row) => <strong>{row.name}</strong> },
  {
    key: 'role',
    header: '역할/등급',
    sortable: true,
    render: (row) => row.role || '-'
  },
  { key: 'currentClient', header: '현재 투입처', sortable: true },
  { key: 'currentProject', header: '수행 사업', sortable: true },
  {
    key: 'currentManMonths',
    header: 'M/M',
    align: 'right',
    sortable: true,
    sortValue: (row) => row.currentManMonths,
    render: (row) => row.currentManMonths.toFixed(1)
  },
  { key: 'currentEndDate', header: '계약 종료일', sortable: true },
  { key: 'availableFrom', header: '다음 가용일', sortable: true, render: (row) => row.availableFrom || '-' },
  {
    key: 'availabilityStatus',
    header: '상태',
    sortable: true,
    render: (row) => (
      <Badge tone={row.availabilityStatus === 'available' ? 'success' : row.availabilityStatus === 'unavailable' ? 'danger' : 'info'}>
        {statusLabels[row.availabilityStatus]}
      </Badge>
    )
  }
];

function isAvailabilityStatus(value: string): value is AvailabilityStatus {
  return value === 'available' || value === 'assigned' || value === 'partiallyAssigned' || value === 'unavailable';
}

export function SupplierManpowerPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [detailErrorMessage, setDetailErrorMessage] = useState('');
  const status = searchParams.get('status') ?? 'all';
  const query = searchParams.get('q') ?? '';
  const availabilityStatus = isAvailabilityStatus(status) ? status : undefined;

  const resumesQuery = useQuery({
    queryKey: ['resumes', { q: query, availabilityStatus }],
    queryFn: () => getResumes({ q: query || undefined, availabilityStatus, pageSize: 100 })
  });

  const rows = resumesQuery.data?.items ?? [];
  const summary = resumesQuery.data?.summary;
  const selectedResumeQuery = useQuery({
    queryKey: ['resume', selectedResumeId],
    queryFn: () => getResume(selectedResumeId ?? ''),
    enabled: Boolean(selectedResumeId)
  });
  const selectedResume = selectedResumeQuery.data;
  const deleteMutation = useMutation({
    mutationFn: (resumeId: string) => deleteResume(resumeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setSelectedResumeId(null);
    },
    onError: (error) => {
      setDetailErrorMessage(getApiErrorMessage(error, '인력 정보를 삭제하지 못했습니다.'));
    }
  });

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

  const handleDeleteSelectedResume = () => {
    if (!selectedResume || !window.confirm(`${selectedResume.name} 인력 정보를 삭제할까요?`)) {
      return;
    }

    setDetailErrorMessage('');
    deleteMutation.mutate(selectedResume.id);
  };

  return (
    <section>
      <PageTitle
        title="투입현황 관리"
        description="당사 인력이 어느 고객사와 사업에 투입되어 있는지, 종료일과 다음 가용 시점을 관리합니다."
        actions={
          <Button icon={<UserPlus className="h-4 w-4" />} onClick={() => navigate('/resumes/new')}>
            인력 입력
          </Button>
        }
      />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard label="전체 인력" value={`${summary?.total ?? 0}명`} />
        <MetricCard label="투입중" value={`${summary?.assigned ?? 0}명`} />
        <MetricCard label="30일 내 가용" value={`${summary?.availableSoon ?? 0}명`} />
        <MetricCard label="교체/리스크" value={`${summary?.unavailable ?? 0}명`} tone="danger" />
      </div>
      <PageToolbar
        searchPlaceholder="이름, 역할, 기술 검색"
        searchValue={query}
        onSearchChange={handleQueryChange}
        resultCount={resumesQuery.data?.total ?? rows.length}
        selects={[
          {
            label: '상태',
            value: status,
            onChange: handleStatusChange,
            options: [
              { label: '상태 전체', value: 'all' },
              { label: '투입중', value: 'assigned' },
              { label: '부분투입', value: 'partiallyAssigned' },
              { label: '가용', value: 'available' },
              { label: '교체검토', value: 'unavailable' }
            ]
          },
          {
            label: '기간',
            value: 'all',
            onChange: () => undefined,
            options: [{ label: '기간 전체', value: 'all' }]
          }
        ]}
      />
      <DataTable
        columns={columns}
        data={rows}
        getRowKey={(row) => row.id}
        onRowClick={(row) => {
          setDetailErrorMessage('');
          setSelectedResumeId(row.id);
        }}
        emptyMessage={resumesQuery.isError ? '인력 정보를 불러오지 못했습니다.' : '조건에 맞는 인력이 없습니다.'}
        isLoading={resumesQuery.isLoading}
      />

      <Modal
        open={selectedResumeId !== null}
        title={selectedResume ? `${selectedResume.name} 인력 상세` : '인력 상세'}
        onClose={() => setSelectedResumeId(null)}
        actions={
          selectedResume ? (
            <div className="flex items-center gap-2">
              <Button variant="secondary" icon={<Pencil className="h-4 w-4" />} onClick={() => navigate(`/resumes/${selectedResume.id}/edit`)}>
                수정
              </Button>
              <Button
                variant="secondary"
                className="!border-error !text-error hover:!bg-error/5"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={handleDeleteSelectedResume}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? '삭제 중...' : '삭제'}
              </Button>
            </div>
          ) : undefined
        }
        footer={
          <Button variant="secondary" type="button" onClick={() => setSelectedResumeId(null)}>
            닫기
          </Button>
        }
      >
        <ResumeDetailContent
          profile={selectedResume}
          isLoading={selectedResumeQuery.isLoading}
          isError={selectedResumeQuery.isError}
          errorMessage={detailErrorMessage}
        />
      </Modal>
    </section>
  );
}
