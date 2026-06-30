import { KeyRound, PlusCircle, UserRound } from 'lucide-react';
import { PageTitle } from '../../../components/common/PageTitle';
import { PageToolbar } from '../../../components/common/PageToolbar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type Staff = {
  id: string;
  name: string;
  department: string;
  role: string;
  email: string;
  assignedJobs: number;
  status: '재직' | '휴면';
};

const rows: Staff[] = [
  { id: 'staff-1', name: '김민준', department: '디지털재난대응과', role: '공고 관리자', email: 'minjun@agency.go.kr', assignedJobs: 6, status: '재직' },
  { id: 'staff-2', name: '이서연', department: '정보화담당관', role: '평가 관리자', email: 'seoyeon@agency.go.kr', assignedJobs: 4, status: '재직' },
  { id: 'staff-3', name: '정하늘', department: '계약운영팀', role: '계약 관리자', email: 'haneul@agency.go.kr', assignedJobs: 2, status: '휴면' }
];

const columns: DataTableColumn<Staff>[] = [
  { key: 'name', header: '사용자', render: (row) => <strong>{row.name}</strong>, sortable: true },
  { key: 'department', header: '소속 부서', sortable: true },
  { key: 'role', header: '권한/역할', sortable: true },
  { key: 'email', header: '업무 이메일' },
  { key: 'assignedJobs', header: '담당 공고', align: 'right', sortable: true, render: (row) => `${row.assignedJobs}건` },
  { key: 'status', header: '계정 상태', render: (row) => <Badge tone={row.status === '재직' ? 'success' : 'neutral'}>{row.status}</Badge> }
];

export function BuyerCompanyMembersPage() {
  return (
    <section>
      <PageTitle
        title="기관 사용자/권한"
        description="기관 담당자의 부서, 역할, 공고별 접근 권한과 평가/계약 권한을 관리합니다."
        actions={<Button icon={<PlusCircle className="h-4 w-4" />}>사용자 등록</Button>}
      />
      <PageToolbar searchPlaceholder="사용자명, 부서, 이메일 검색">
        <Button variant="secondary" icon={<KeyRound className="h-4 w-4" />}>권한 전체</Button>
        <Button variant="secondary" icon={<UserRound className="h-4 w-4" />}>상태 전체</Button>
      </PageToolbar>
      <DataTable columns={columns} data={rows} getRowKey={(row) => row.id} />
    </section>
  );
}
