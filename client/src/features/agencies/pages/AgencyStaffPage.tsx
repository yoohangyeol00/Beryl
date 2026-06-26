import { PlusCircle, UserRound } from 'lucide-react';
import { PageTitle } from '../../../components/common/PageTitle';
import { PageToolbar } from '../../../components/common/PageToolbar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type Staff = {
  id: string;
  name: string;
  agency: string;
  department: string;
  role: string;
  email: string;
  status: '재직' | '휴면';
};

const rows: Staff[] = [
  { id: 'staff-1', name: '김민준', agency: '조달청', department: '디지털조달기획과', role: '공고 관리자', email: 'minjun@pps.go.kr', status: '재직' },
  { id: 'staff-2', name: '이서연', agency: '행정안전부', department: '공공지능정책팀', role: 'RFP 검토자', email: 'seoyeon@mois.go.kr', status: '재직' },
  { id: 'staff-3', name: '정하늘', agency: '한국도로공사', department: '정보서비스부', role: '계약 담당자', email: 'haneul@ex.co.kr', status: '휴면' }
];

const columns: DataTableColumn<Staff>[] = [
  { key: 'name', header: '직원명', render: (row) => <strong>{row.name}</strong> },
  { key: 'agency', header: '발주기관' },
  { key: 'department', header: '소속 조직' },
  { key: 'role', header: '권한/역할' },
  { key: 'email', header: '이메일' },
  { key: 'status', header: '상태', render: (row) => <Badge tone={row.status === '재직' ? 'success' : 'neutral'}>{row.status}</Badge> }
];

export function AgencyStaffPage() {
  return (
    <section>
      <PageTitle
        title="발주기관 직원관리"
        description="발주기관 담당자, 소속 조직, 공고/RFP 권한을 관리합니다."
        actions={<Button icon={<PlusCircle className="h-4 w-4" />}>직원 등록</Button>}
      />
      <PageToolbar searchPlaceholder="직원명, 기관명, 이메일 검색">
        <Button variant="secondary" icon={<UserRound className="h-4 w-4" />}>권한 전체</Button>
        <Button variant="secondary">상태 전체</Button>
      </PageToolbar>
      <DataTable columns={columns} data={rows} getRowKey={(row) => row.id} />
    </section>
  );
}
