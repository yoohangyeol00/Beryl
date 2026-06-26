import { Building2, PlusCircle } from 'lucide-react';
import { PageTitle } from '../../../components/common/PageTitle';
import { PageToolbar } from '../../../components/common/PageToolbar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type ClientCompany = {
  id: string;
  name: string;
  sector: string;
  manager: string;
  activePeople: number;
  activeProjects: number;
  nextEndDate: string;
  status: '운영중' | '연장협의' | '휴면';
};

const clients: ClientCompany[] = [
  { id: 'client-1', name: '소방청', sector: '공공/재난안전', manager: '김민준', activePeople: 6, activeProjects: 2, nextEndDate: '2026-09-30', status: '운영중' },
  { id: 'client-2', name: '행정안전부', sector: '공공/디지털정부', manager: '이서연', activePeople: 4, activeProjects: 1, nextEndDate: '2026-08-15', status: '연장협의' },
  { id: 'client-3', name: '한국지능정보사회진흥원', sector: '공공/클라우드', manager: '정하늘', activePeople: 5, activeProjects: 2, nextEndDate: '2026-07-31', status: '연장협의' },
  { id: 'client-4', name: '조달청', sector: '공공/조달', manager: '오지훈', activePeople: 3, activeProjects: 1, nextEndDate: '2026-11-30', status: '운영중' }
];

const columns: DataTableColumn<ClientCompany>[] = [
  { key: 'name', header: '고객사/투입처', render: (row) => <strong className="text-[18px]">{row.name}</strong> },
  { key: 'sector', header: '분야' },
  { key: 'manager', header: '당사 담당자' },
  { key: 'activePeople', header: '투입 인력', align: 'right', render: (row) => `${row.activePeople}명` },
  { key: 'activeProjects', header: '수행 사업', align: 'right', render: (row) => `${row.activeProjects}건` },
  { key: 'nextEndDate', header: '최근 종료 예정일' },
  {
    key: 'status',
    header: '관계 상태',
    render: (row) => <Badge tone={row.status === '운영중' ? 'success' : row.status === '연장협의' ? 'info' : 'neutral'}>{row.status}</Badge>
  }
];

export function SuppliersPage() {
  return (
    <section>
      <PageTitle
        title="고객사 관리"
        description="당사 인력이 투입된 고객사와 발주처, 수행 사업, 연장 협의 상태를 관리합니다."
        actions={<Button icon={<PlusCircle className="h-4 w-4" />}>고객사 등록</Button>}
      />
      <PageToolbar searchPlaceholder="고객사, 분야, 담당자 검색">
        <Button variant="secondary" icon={<Building2 className="h-4 w-4" />}>분야 전체</Button>
        <Button variant="secondary">관계 상태 전체</Button>
      </PageToolbar>
      <DataTable columns={columns} data={clients} getRowKey={(row) => row.id} />
    </section>
  );
}
