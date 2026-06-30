import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/apiResponse';
import { deleteResume, getResume } from '../../../api/resumesApi';
import { PageTitle } from '../../../components/common/PageTitle';
import { MetricCard } from '../../../components/common/MetricCard';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import type { AvailabilityStatus, ResumeProject } from '../../../types/resume';

const statusLabels: Record<AvailabilityStatus, string> = {
  available: '가용',
  assigned: '투입중',
  partiallyAssigned: '부분투입',
  unavailable: '교체검토'
};

const columns: DataTableColumn<ResumeProject>[] = [
  { key: 'projectName', header: '사업명' },
  { key: 'clientName', header: '고객사/발주처', render: (row) => row.clientName || '-' },
  { key: 'role', header: '역할', render: (row) => row.role || '-' },
  {
    key: 'period',
    header: '기간',
    render: (row) => [row.startedAt || '-', row.endedAt || '-'].join(' ~ ')
  },
  { key: 'manMonths', header: 'M/M', align: 'right', render: (row) => row.manMonths.toFixed(1) }
];

export function ResumeDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { resumeId = '' } = useParams();
  const [errorMessage, setErrorMessage] = useState('');
  const resumeQuery = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: () => getResume(resumeId),
    enabled: Boolean(resumeId)
  });
  const profile = resumeQuery.data;
  const deleteMutation = useMutation({
    mutationFn: () => deleteResume(resumeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['resumes'] });
      navigate('/supplier/manpower');
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, '인력 정보를 삭제하지 못했습니다.'));
    }
  });

  const handleDelete = () => {
    if (!profile || !window.confirm(`${profile.name} 인력 정보를 삭제할까요?`)) {
      return;
    }

    setErrorMessage('');
    deleteMutation.mutate();
  };

  return (
    <section>
      <PageTitle
        title={profile ? `${profile.name} 인력 상세` : '인력 상세'}
        description="사업 이력, 보유 역량, 현재 투입처와 다음 가용 시점을 확인합니다."
        actions={
          profile ? (
            <>
              <Button variant="secondary" icon={<Pencil className="h-4 w-4" />} onClick={() => navigate(`/resumes/${profile.id}/edit`)}>
                수정
              </Button>
              <Button
                variant="secondary"
                className="!border-error !text-error hover:!bg-error/5"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                삭제
              </Button>
            </>
          ) : null
        }
      />

      {errorMessage ? <p className="mb-4 font-body text-[14px] text-error">{errorMessage}</p> : null}

      <div className="mb-6 grid gap-4 md:grid-cols-5">
        <MetricCard label="이름" value={profile?.name ?? '-'} />
        <MetricCard label="역할" value={profile?.role || '-'} />
        <MetricCard label="경력" value={profile ? `${profile.careerYears}년` : '-'} />
        <MetricCard label="현재 투입처" value={profile?.currentClient ?? '-'} />
        <MetricCard label="가용일" value={profile?.availableFrom || '-'} />
      </div>

      <Card className="mb-6 p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-headline text-headline-md text-on-surface">보유 역량</h2>
          {profile ? <Badge tone={profile.availabilityStatus === 'available' ? 'success' : profile.availabilityStatus === 'unavailable' ? 'danger' : 'info'}>{statusLabels[profile.availabilityStatus]}</Badge> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {profile?.skills.length ? (
            profile.skills.map((skill) => (
              <Badge key={skill} tone="info">
                {skill}
              </Badge>
            ))
          ) : (
            <span className="font-body text-[15px] text-on-surface-variant">등록된 기술이 없습니다.</span>
          )}
        </div>
      </Card>

      <DataTable
        columns={columns}
        data={profile?.projects ?? []}
        getRowKey={(row) => row.id}
        isLoading={resumeQuery.isLoading}
        emptyMessage={resumeQuery.isError ? '인력 정보를 불러오지 못했습니다.' : '등록된 수행 이력이 없습니다.'}
      />
    </section>
  );
}
