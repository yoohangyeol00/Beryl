import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/apiResponse';
import { getCompanyMemberInvitations, type CompanyMemberInvitationHistoryItem } from '../../../api/companyMembersApi';
import { EmptyState } from '../../../components/common/EmptyState';
import { PageTitle } from '../../../components/common/PageTitle';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';

type StatusTone = 'success' | 'danger' | 'neutral' | 'info';

const columns: DataTableColumn<CompanyMemberInvitationHistoryItem>[] = [
  { key: 'name', header: '이름', render: (row) => <strong>{row.name}</strong>, sortable: true },
  { key: 'email', header: '이메일', sortable: true },
  { key: 'department', header: '소속 부서', render: (row) => row.department || '-', sortable: true },
  {
    key: 'status',
    header: '상태',
    render: (row) => <InvitationStatus status={row.status} />,
    sortable: true,
    sortValue: (row) => getInvitationStatus(row.status).label
  }
];

export function BuyerCompanyMemberInvitationsPage() {
  const navigate = useNavigate();
  const [selectedInvitation, setSelectedInvitation] = useState<CompanyMemberInvitationHistoryItem | null>(null);
  const invitationsQuery = useQuery({
    queryKey: ['company-member-invitations'],
    queryFn: getCompanyMemberInvitations
  });

  return (
    <section>
      <PageTitle
        title="사용자 초대 내역"
        description="현재 기업에서 발송한 사용자 초대와 수락 상태를 확인합니다."
        actions={
          <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/buyer/company-members')}>
            목록으로
          </Button>
        }
      />

      <div className="mt-5">
        {invitationsQuery.isError ? (
          <EmptyState
            title="초대 내역을 불러오지 못했습니다."
            description={getApiErrorMessage(invitationsQuery.error, '잠시 후 다시 시도해주세요.')}
          />
        ) : (
          <DataTable
            columns={columns}
            data={invitationsQuery.data?.items ?? []}
            getRowKey={(row) => row.id}
            isLoading={invitationsQuery.isLoading}
            emptyMessage="발송된 사용자 초대 내역이 없습니다."
            onRowClick={(row) => setSelectedInvitation(row)}
          />
        )}
      </div>

      <Modal
        open={selectedInvitation !== null}
        title={selectedInvitation ? `${selectedInvitation.name} 초대 정보` : '초대 정보'}
        onClose={() => setSelectedInvitation(null)}
        footer={<div className="h-10" aria-hidden="true" />}
      >
        {selectedInvitation ? (
          <dl className="space-y-3 rounded-lg border border-outline-variant p-4">
            <DetailLine label="이름" value={selectedInvitation.name} />
            <DetailLine label="이메일" value={selectedInvitation.email} />
            <DetailLine label="소속 부서" value={selectedInvitation.department || '-'} />
            <DetailLine label="직책" value={selectedInvitation.position || '-'} />
            <DetailLine label="상태" value={<InvitationStatus status={selectedInvitation.status} />} />
            <DetailLine label="초대일" value={formatDate(selectedInvitation.sentAt ?? selectedInvitation.invitedAt)} />
            <DetailLine label="취소일" value={formatDate(selectedInvitation.canceledAt)} />
            <DetailLine label="수락일" value={formatDate(selectedInvitation.acceptedAt)} />
          </dl>
        ) : null}
      </Modal>
    </section>
  );
}

function InvitationStatus({ status }: { status: string }) {
  const displayStatus = getInvitationStatus(status);

  return <Badge tone={displayStatus.tone}>{displayStatus.label}</Badge>;
}

function getInvitationStatus(status: string): { label: string; tone: StatusTone } {
  if (status === 'accepted') return { label: '수락', tone: 'success' };
  if (status === 'pending') return { label: '대기', tone: 'neutral' };
  if (status === 'revoked') return { label: '취소', tone: 'neutral' };
  if (status === 'expired') return { label: '만료', tone: 'danger' };

  return { label: status, tone: 'info' };
}

function DetailLine({ label, value }: { label: string; value: string | ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-sm text-on-surface-variant">{label}</dt>
      <dd className="text-right font-semibold text-on-surface">{value}</dd>
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(value));
}
