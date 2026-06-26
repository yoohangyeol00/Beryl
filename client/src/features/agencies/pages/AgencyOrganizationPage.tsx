import { Building2, PlusCircle } from 'lucide-react';
import { PageTitle } from '../../../components/common/PageTitle';
import { PageToolbar } from '../../../components/common/PageToolbar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type Organization = {
  id: string;
  agency: string;
  department: string;
  parent: string;
  manager: string;
  status: '운영중' | '검토중';
};

const rows: Organization[] = [
  { id: 'org-1', agency: '조달청', department: '디지털조달기획과', parent: '전자조달국', manager: '김민준', status: '운영중' },
  { id: 'org-2', agency: '행정안전부', department: '공공지능정책팀', parent: '디지털정부실', manager: '이서연', status: '운영중' },
  { id: 'org-3', agency: '한국도로공사', department: '정보서비스부', parent: '스마트건설본부', manager: '박도윤', status: '검토중' }
];

const columns: DataTableColumn<Organization>[] = [
  { key: 'agency', header: '발주기관' },
  { key: 'department', header: '조직명', render: (row) => <strong>{row.department}</strong> },
  { key: 'parent', header: '상위 조직' },
  { key: 'manager', header: '조직 책임자' },
  { key: 'status', header: '상태', render: (row) => <Badge tone={row.status === '운영중' ? 'success' : 'info'}>{row.status}</Badge> }
];

export function AgencyOrganizationPage() {
  return (
    <section>
      <PageTitle
        title="발주기관 조직관리"
        description="발주기관별 조직 체계, 상위 조직, 책임자를 관리합니다."
        actions={<Button icon={<PlusCircle className="h-4 w-4" />}>조직 등록</Button>}
      />
      <PageToolbar searchPlaceholder="기관명 또는 조직명 검색">
        <Button variant="secondary" icon={<Building2 className="h-4 w-4" />}>기관 전체</Button>
        <Button variant="secondary">상태 전체</Button>
      </PageToolbar>
      <DataTable columns={columns} data={rows} getRowKey={(row) => row.id} />
    </section>
  );
}
