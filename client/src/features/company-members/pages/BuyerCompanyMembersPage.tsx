import { KeyRound, PlusCircle, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  status: '재직' | '대기';
};

const rows: Staff[] = [
  { id: 'staff-1', name: '김민준', department: '디지털전환팀', role: '공고 관리자', email: 'minjun@agency.go.kr', assignedJobs: 6, status: '재직' },
  { id: 'staff-2', name: '이서연', department: '정보보안실', role: '계약 관리자', email: 'seoyeon@agency.go.kr', assignedJobs: 4, status: '재직' },
  { id: 'staff-3', name: '박하늘', department: '조달운영팀', role: '입찰 담당자', email: 'haneul@agency.go.kr', assignedJobs: 2, status: '대기' }
];

const columns: DataTableColumn<Staff>[] = [
  { key: 'name', header: '사용자명', render: (row) => <strong>{row.name}</strong>, sortable: true },
  { key: 'department', header: '소속 부서', sortable: true },
  { key: 'role', header: '직책/역할', sortable: true },
  { key: 'email', header: '이메일' },
  { key: 'assignedJobs', header: '담당 공고', align: 'right', sortable: true, render: (row) => `${row.assignedJobs}건` },
  { key: 'status', header: '상태', render: (row) => <Badge tone={row.status === '재직' ? 'success' : 'neutral'}>{row.status}</Badge> }
];

export function BuyerCompanyMembersPage() {
  const navigate = useNavigate();

  return (
    <section>
      <PageTitle
        title="기관 사용자/권한"
        description="현재 기업의 사용자, 부서, 역할, 초대 상태를 관리합니다."
        actions={
          <Button icon={<PlusCircle className="h-4 w-4" />} onClick={() => navigate('/buyer/company-members/new')}>
            사용자 등록
          </Button>
        }
      />
      <PageToolbar searchPlaceholder="사용자명, 부서, 이메일 검색">
        <Button variant="secondary" icon={<KeyRound className="h-4 w-4" />}>
          권한 전체
        </Button>
        <Button variant="secondary" icon={<UserRound className="h-4 w-4" />}>
          상태 전체
        </Button>
      </PageToolbar>
      <DataTable columns={columns} data={rows} getRowKey={(row) => row.id} />
    </section>
  );
}
