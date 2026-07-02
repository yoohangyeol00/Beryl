import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, MailCheck, Pencil, PlusCircle, Power, PowerOff, RotateCcw, Save, Trash2, UserRound, X } from 'lucide-react';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/apiResponse';
import {
  activateCompanyMember,
  cancelCompanyMemberInvitation,
  deactivateCompanyMember,
  getCompanyMembers,
  updateCompanyMember,
  type CompanyMemberListItem
} from '../../../api/companyMembersApi';
import { EmptyState } from '../../../components/common/EmptyState';
import { PageTitle } from '../../../components/common/PageTitle';
import { PageToolbar } from '../../../components/common/PageToolbar';
import { ActionMenu, type ActionMenuItem } from '../../../components/ui/ActionMenu';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';

type StatusTone = 'success' | 'info' | 'danger' | 'neutral';
type MemberStatusAction = 'cancelInvitation' | 'deactivate' | 'activate';

const statusOptions = [
  { label: '상태 전체', value: '' },
  { label: '대기', value: 'invited' },
  { label: '활성', value: 'active' },
  { label: '비활성', value: 'inactive' }
];

const columns: DataTableColumn<CompanyMemberListItem>[] = [
  {
    key: 'name',
    header: '사용자명',
    render: (row) => (
      <div>
        <strong className="block">{row.name}</strong>
        <span className="mt-1 block text-sm text-on-surface-variant">{getMemberTypeLabel(row.memberType)}</span>
      </div>
    ),
    sortable: true
  },
  { key: 'department', header: '소속 부서', render: (row) => row.department || '-', sortable: true },
  { key: 'position', header: '직책', render: (row) => row.position || '-', sortable: true },
  { key: 'email', header: '이메일', render: (row) => row.email || '-' },
  { key: 'assignedJobs', header: '담당 공고', align: 'right', sortable: true, render: (row) => `${row.assignedJobs}건` },
  {
    key: 'invitation',
    header: '상태',
    render: (row) => <MemberStatus member={row} />,
    sortable: true,
    sortValue: (row) => getDisplayStatus(row).label
  },
  { key: 'invitedBy', header: '초대자', render: (row) => row.invitation?.invitedBy?.name ?? row.invitation?.invitedBy?.email ?? '-' },
  { key: 'sentAt', header: '초대일', render: (row) => formatDate(row.invitation?.sentAt ?? row.invitation?.invitedAt) }
];

export function BuyerCompanyMembersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const basePath = location.pathname.startsWith('/supplier') ? '/supplier/company-members' : '/buyer/company-members';
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [selectedMember, setSelectedMember] = useState<CompanyMemberListItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editMemberType, setEditMemberType] = useState<'employee' | 'reviewer' | 'manager'>('employee');
  const [editErrorMessage, setEditErrorMessage] = useState('');
  const membersQuery = useQuery({
    queryKey: ['company-members', { q: query, status }],
    queryFn: () => getCompanyMembers({ q: query || undefined, status: status || undefined })
  });
  const updateMutation = useMutation({
    mutationFn: () =>
      selectedMember
        ? updateCompanyMember(selectedMember.id, {
            phone: editPhone || undefined,
            department: editDepartment || undefined,
            position: editPosition || undefined,
            memberType: editMemberType
          })
        : Promise.reject(new Error('선택된 사용자가 없습니다.')),
    onSuccess: async () => {
      if (selectedMember) {
        setSelectedMember({
          ...selectedMember,
          phone: editPhone || null,
          department: editDepartment || null,
          position: editPosition || null,
          memberType: editMemberType
        });
      }

      setIsEditing(false);
      await queryClient.invalidateQueries({ queryKey: ['company-members'] });
    },
    onError: (error) => {
      setEditErrorMessage(getApiErrorMessage(error, '사용자 정보를 수정하지 못했습니다.'));
    }
  });
  const statusMutation = useMutation({
    mutationFn: ({ member, action }: { member: CompanyMemberListItem; action: MemberStatusAction }) =>
      action === 'cancelInvitation'
        ? cancelCompanyMemberInvitation(member.id)
        : action === 'activate'
          ? activateCompanyMember(member.id)
          : deactivateCompanyMember(member.id),
    onSuccess: async (_result, { action }) => {
      if (selectedMember) {
        setSelectedMember({
          ...selectedMember,
          status: action === 'activate' ? 'active' : 'inactive',
          invitation:
            action === 'cancelInvitation' && selectedMember.invitation
              ? {
                  ...selectedMember.invitation,
                  status: 'revoked'
                }
              : selectedMember.invitation
        });
      }

      setIsEditing(false);
      await queryClient.invalidateQueries({ queryKey: ['company-members'] });
    },
    onError: (error) => {
      window.alert(getApiErrorMessage(error, '사용자 상태를 변경하지 못했습니다.'));
    }
  });

  useEffect(() => {
    if (!selectedMember) return;

    setEditPhone(formatPhoneNumber(selectedMember.phone ?? ''));
    setEditDepartment(selectedMember.department ?? '');
    setEditPosition(selectedMember.position ?? '');
    setEditMemberType(getEditableMemberType(selectedMember.memberType));
    setEditErrorMessage('');
    setIsEditing(false);
  }, [selectedMember]);

  function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEditErrorMessage('');
    updateMutation.mutate();
  }

  function handleEditPhoneChange(value: string) {
    setEditPhone(formatPhoneNumber(value));
  }

  function handleResetFilters() {
    setQuery('');
    setStatus('');
  }

  function handleCloseModal() {
    setSelectedMember(null);
    setIsEditing(false);
    setEditErrorMessage('');
  }

  function handleMemberStatusAction(member: CompanyMemberListItem, action: MemberStatusAction) {
    const message =
      action === 'cancelInvitation'
        ? `${member.name}님의 초대를 취소할까요?`
        : action === 'activate'
          ? `${member.name}님을 다시 활성화할까요?`
          : `${member.name}님을 비활성화할까요?`;

    if (!window.confirm(message)) return;

    statusMutation.mutate({ member, action });
  }

  const selectedStatusAction = selectedMember ? getMemberStatusAction(selectedMember) : null;
  const actionMenuItems: ActionMenuItem[] = selectedMember
    ? [
        {
          label: '수정',
          icon: <Pencil className="h-4 w-4" />,
          onClick: () => setIsEditing(true)
        },
        ...(selectedStatusAction
          ? [
              {
                label:
                  selectedStatusAction === 'cancelInvitation'
                    ? '초대 취소'
                    : selectedStatusAction === 'activate'
                      ? '활성화'
                      : '비활성화',
                icon:
                  selectedStatusAction === 'cancelInvitation' ? (
                    <Trash2 className="h-4 w-4" />
                  ) : selectedStatusAction === 'activate' ? (
                    <Power className="h-4 w-4" />
                  ) : (
                    <PowerOff className="h-4 w-4" />
                  ),
                tone:
                  selectedStatusAction === 'cancelInvitation'
                    ? ('danger' as const)
                    : selectedStatusAction === 'activate'
                      ? ('success' as const)
                      : ('info' as const),
                onClick: () => handleMemberStatusAction(selectedMember, selectedStatusAction)
              }
            ]
          : [])
      ]
    : [];

  return (
    <section>
      <PageTitle
        title="기관 사용자/권한"
        description="현재 기업의 사용자, 부서, 역할, 초대 상태를 관리합니다."
        actions={
          <>
            <Button
              variant="secondary"
              icon={<MailCheck className="h-4 w-4" />}
              onClick={() => navigate(`${basePath}/invitations`)}
            >
              초대 내역
            </Button>
            <Button icon={<PlusCircle className="h-4 w-4" />} onClick={() => navigate(`${basePath}/new`)}>
              사용자 초대
            </Button>
          </>
        }
      />
      <PageToolbar
        searchPlaceholder="사용자명, 부서, 이메일 검색"
        searchValue={query}
        onSearchChange={setQuery}
        resultCount={membersQuery.data?.total}
        selects={[{ label: '상태', value: status, options: statusOptions, onChange: setStatus }]}
        filterAction={{
          label: '필터 초기화',
          icon: <RotateCcw className="h-4 w-4" />,
          onClick: handleResetFilters,
          disabled: !query && !status
        }}
      />

      <div className="mt-5">
        {membersQuery.isError ? (
          <EmptyState
            title="사용자 목록을 불러오지 못했습니다."
            description={getApiErrorMessage(membersQuery.error, '잠시 후 다시 시도해주세요.')}
          />
        ) : (
          <DataTable
            columns={columns}
            data={membersQuery.data?.items ?? []}
            getRowKey={(row) => row.id}
            isLoading={membersQuery.isLoading}
            emptyMessage="등록된 사용자 또는 초대 대기 사용자가 없습니다."
            onRowClick={(row) => setSelectedMember(row)}
          />
        )}
      </div>

      <Modal
        open={selectedMember !== null}
        title={selectedMember ? `${selectedMember.name} 상세 정보` : '사용자 상세 정보'}
        onClose={handleCloseModal}
        actions={
          selectedMember ? (
            <ActionMenu
              label="사용자 관리"
              items={actionMenuItems}
            />
          ) : null
        }
        footer={
          isEditing ? (
            <div className="flex gap-2">
              <Button variant="secondary" type="button" icon={<X className="h-4 w-4" />} onClick={() => setIsEditing(false)}>
                취소
              </Button>
              <Button type="submit" form="company-member-edit-form" icon={<Save className="h-4 w-4" />} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? '저장 중...' : '저장'}
              </Button>
            </div>
          ) : (
            <Button variant="secondary" type="button" onClick={handleCloseModal}>
              닫기
            </Button>
          )
        }
      >
        {selectedMember ? (
          <CompanyMemberDetail
            member={selectedMember}
            isEditing={isEditing}
            editPhone={editPhone}
            editDepartment={editDepartment}
            editPosition={editPosition}
            editMemberType={editMemberType}
            errorMessage={editErrorMessage}
            onPhoneChange={handleEditPhoneChange}
            onDepartmentChange={setEditDepartment}
            onPositionChange={setEditPosition}
            onMemberTypeChange={setEditMemberType}
            onSubmit={handleEditSubmit}
          />
        ) : null}
      </Modal>
    </section>
  );
}

function CompanyMemberDetail({
  member,
  isEditing,
  editPhone,
  editDepartment,
  editPosition,
  editMemberType,
  errorMessage,
  onPhoneChange,
  onDepartmentChange,
  onPositionChange,
  onMemberTypeChange,
  onSubmit
}: {
  member: CompanyMemberListItem;
  isEditing: boolean;
  editPhone: string;
  editDepartment: string;
  editPosition: string;
  editMemberType: 'employee' | 'reviewer' | 'manager';
  errorMessage: string;
  onPhoneChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onPositionChange: (value: string) => void;
  onMemberTypeChange: (value: 'employee' | 'reviewer' | 'manager') => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form id="company-member-edit-form" className="space-y-6 pb-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryBox label="상태" value={<MemberStatus member={member} />} />
        <SummaryBox label="담당 공고" value={`${member.assignedJobs}건`} />
        <SummaryBox label="구성원 유형" value={getMemberTypeLabel(member.memberType)} />
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-error/30 bg-error-container px-5 py-4 font-semibold text-on-error-container">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <section>
          <h3 className="mb-3 font-headline text-[20px] font-bold">기본 정보</h3>
          <dl className="space-y-3 rounded-lg border border-outline-variant p-4">
            {isEditing ? (
              <>
                <DetailLine label="이름" value={member.name} />
                <DetailLine label="이메일" value={member.email ?? '-'} />
                <EditableDetailInput label="연락처" value={editPhone} onChange={onPhoneChange} inputMode="numeric" />
                <EditableDetailInput label="소속 부서" value={editDepartment} onChange={onDepartmentChange} />
                <EditableDetailInput label="직책" value={editPosition} onChange={onPositionChange} />
                <EditableDetailSelect label="권한 레벨" value={editMemberType} onChange={onMemberTypeChange} />
              </>
            ) : (
              <>
                <DetailLine label="이름" value={member.name} />
                <DetailLine label="이메일" value={member.email ?? '-'} />
                <DetailLine label="연락처" value={formatPhoneNumber(member.phone ?? '') || '-'} />
                <DetailLine label="소속 부서" value={member.department ?? '-'} />
                <DetailLine label="직책" value={member.position ?? '-'} />
                <DetailLine label="권한 레벨" value={getMemberTypeLabel(member.memberType)} />
              </>
            )}
          </dl>
        </section>

        <section>
          <h3 className="mb-3 font-headline text-[20px] font-bold">초대 정보</h3>
          <dl className="space-y-3 rounded-lg border border-outline-variant p-4">
            <DetailLine label="초대 상태" value={<MemberStatus member={member} />} />
            <DetailLine label="초대자" value={member.invitation?.invitedBy?.name ?? member.invitation?.invitedBy?.email ?? '-'} />
            <DetailLine label="초대일" value={formatDate(member.invitation?.sentAt ?? member.invitation?.invitedAt)} />
            <DetailLine label="만료일" value={formatDate(member.invitation?.expiresAt)} />
            <DetailLine label="수락일" value={formatDate(member.invitation?.acceptedAt)} />
          </dl>
        </section>
      </div>

      <Card className="bg-primary/5 p-4">
        <h3 className="mb-2 font-headline text-[20px] font-bold text-primary">관리 메모</h3>
        <p className="text-sm leading-6 text-on-surface-variant">
          이 사용자는 현재 기업의 내부 구성원입니다. 초대 이력이 있는 경우 초대 수락 상태를 기준으로 계정 사용 가능 여부를 확인할 수 있습니다.
        </p>
      </Card>
    </form>
  );
}

function SummaryBox({ label, value }: { label: string; value: string | ReactNode }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
      <p className="text-sm text-on-surface-variant">{label}</p>
      <div className="mt-2 font-headline text-[24px] font-bold text-primary">{value}</div>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string | ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-sm text-on-surface-variant">{label}</dt>
      <dd className="text-right font-semibold text-on-surface">{value}</dd>
    </div>
  );
}

function EditableDetailInput({
  label,
  value,
  onChange,
  inputMode
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputMode?: 'text' | 'numeric';
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm text-on-surface-variant">{label}</label>
      <input
        className="h-12 w-[70%] min-w-0 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-right font-semibold text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/25"
        value={value}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function EditableDetailSelect({
  label,
  value,
  onChange
}: {
  label: string;
  value: 'employee' | 'reviewer' | 'manager';
  onChange: (value: 'employee' | 'reviewer' | 'manager') => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm text-on-surface-variant">{label}</label>
      <select
        className="h-12 w-[70%] min-w-0 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-right font-semibold text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
        value={value}
        onChange={(event) => onChange(event.target.value as 'employee' | 'reviewer' | 'manager')}
      >
        <option value="employee">실무자</option>
        <option value="reviewer">검토자/상급자</option>
        <option value="manager">관리자</option>
      </select>
    </div>
  );
}

function MemberStatus({ member }: { member: CompanyMemberListItem }) {
  const status = getDisplayStatus(member);

  return status.tone ? <Badge tone={status.tone}>{status.label}</Badge> : status.label;
}

function getEditableMemberType(memberType: string): 'employee' | 'reviewer' | 'manager' {
  if (memberType === 'manager' || memberType === 'reviewer' || memberType === 'employee') return memberType;
  return 'employee';
}

function getMemberTypeLabel(memberType: string) {
  if (memberType === 'manager') return '관리자';
  if (memberType === 'reviewer') return '검토자/상급자';
  if (memberType === 'employee') return '실무자';
  return memberType;
}

function getDisplayStatus(row: CompanyMemberListItem): { label: string; tone: StatusTone | null } {
  if (row.invitation?.status === 'revoked') return { label: '취소', tone: 'neutral' };
  if (row.status === 'inactive') return { label: '비활성', tone: 'danger' };
  if (row.invitation?.status === 'pending' || row.status === 'invited') return { label: '대기', tone: 'neutral' };
  if (row.invitation?.status === 'accepted' || row.invitation?.acceptedAt || row.status === 'active' || row.userId) {
    return { label: '활성', tone: 'success' };
  }
  if (row.invitation?.status === 'expired') return { label: '만료', tone: 'danger' };
  return { label: row.status, tone: 'neutral' };
}

function getMemberStatusAction(member: CompanyMemberListItem): MemberStatusAction | null {
  if (member.status === 'inactive') return member.userId ? 'activate' : null;
  if (member.invitation?.status === 'pending' || member.status === 'invited') return 'cancelInvitation';
  if (member.invitation?.status === 'accepted' || member.invitation?.acceptedAt || member.status === 'active') {
    return 'deactivate';
  }

  return null;
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(value));
}

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}
