import { Building2, PlusCircle } from 'lucide-react';
import { PageTitle } from '../../../components/common/PageTitle';
import { PageToolbar } from '../../../components/common/PageToolbar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type Organization = {
  id: string;
  department: string;
  parent: string;
  manager: string;
  activeJobs: number;
  status: '운영중' | '검토중';
};

const rows: Organization[] = [
  { id: 'org-1', department: '디지털재난대응과', parent: '재난안전본부', manager: '김민준', activeJobs: 7, status: '운영중' },
  { id: 'org-2', department: '정보화담당관', parent: '기획조정실', manager: '이서연', activeJobs: 4, status: '운영중' },
  { id: 'org-3', department: '계약운영팀', parent: '운영지원국', manager: '정하늘', activeJobs: 2, status: '검토중' }
];

const columns: DataTableColumn<Organization>[] = [
  { key: 'department', header: '조직명', render: (row) => <strong>{row.department}</strong>, sortable: true },
  { key: 'parent', header: '상위 조직', sortable: true },
  { key: 'manager', header: '조직 책임자', sortable: true },
  { key: 'activeJobs', header: '진행 공고', align: 'right', sortable: true, render: (row) => `${row.activeJobs}건` },
  { key: 'status', header: '상태', render: (row) => <Badge tone={row.status === '운영중' ? 'success' : 'info'}>{row.status}</Badge> }
];

export function AgencyOrganizationPage() {
  return (
    <section>
      <PageTitle
        title="기관 조직 관리"
        description="발주 사업을 담당하는 부서 체계, 상위 조직, 책임자와 공고 연결 상태를 관리합니다."
        actions={<Button icon={<PlusCircle className="h-4 w-4" />}>조직 등록</Button>}
      />
      <PageToolbar searchPlaceholder="조직명, 책임자 검색">
        <Button variant="secondary" icon={<Building2 className="h-4 w-4" />}>조직 전체</Button>
        <Button variant="secondary">상태 전체</Button>
      </PageToolbar>
      <DataTable columns={columns} data={rows} getRowKey={(row) => row.id} />
    </section>
  );
}
