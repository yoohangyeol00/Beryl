import { Building2, Landmark, PlusCircle, Search } from 'lucide-react';
import { PageTitle } from '../../../components/common/PageTitle';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import { Input } from '../../../components/ui/Input';

type Agency = { id: string; name: string; type: string; address: string; website: string; status: '정상' | '주의' | '휴면' };

const agencies: Agency[] = [
  { id: '1', name: '조달청', type: '중앙행정기관', address: '대전광역시 서구 청사로 189', website: 'www.pps.go.kr', status: '정상' },
  { id: '2', name: '한국전력공사', type: '공공기관 (공기업)', address: '전라남도 나주시 전력로 55', website: 'home.kepco.co.kr', status: '정상' },
  { id: '3', name: '서울특별시청', type: '지방자치단체', address: '서울특별시 중구 세종대로 110', website: 'www.seoul.go.kr', status: '정상' },
  { id: '4', name: '국방부', type: '중앙행정기관', address: '서울특별시 용산구 이태원로 22', website: 'www.mnd.go.kr', status: '주의' },
  { id: '5', name: '한국도로공사', type: '공공기관 (준정부기관)', address: '경상북도 김천시 혁신8로 77', website: 'www.ex.co.kr', status: '휴면' }
];

const columns: DataTableColumn<Agency>[] = [
  { key: 'name', header: '기관명', render: (row) => <strong className="text-[19px]">{row.name}</strong> },
  { key: 'type', header: '구분' },
  { key: 'address', header: '주소' },
  { key: 'website', header: '웹사이트', render: (row) => <span className="text-primary">{row.website}</span> },
  { key: 'status', header: '상태', render: (row) => <Badge tone={row.status === '주의' ? 'danger' : row.status === '휴면' ? 'info' : 'success'}>{row.status}</Badge> }
];

export function AgenciesPage() {
  return (
    <section>
      <div className="mb-4 text-on-surface-variant">대시보드 &gt; 시스템 관리</div>
      <PageTitle
        title="발주기관 관리"
        description="공공 및 민간 발주기관의 기본 정보와 상태를 관리합니다."
        actions={<Button icon={<Building2 className="h-4 w-4" />}>기관 등록</Button>}
      />
      <div className="mb-10 grid gap-6 xl:grid-cols-4">
        <AgencyStat label="총 발주기관" value="1,248" />
        <AgencyStat label="중앙행정기관" value="48" soft />
        <AgencyStat label="지방자치단체" value="243" soft />
        <AgencyStat label="공공기관/기타" value="957" soft />
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant p-7">
          <div className="flex gap-4">
            <Button variant="secondary">전체 구분</Button>
            <Button variant="secondary">상태 전체</Button>
          </div>
          <div className="w-full max-w-md">
            <Input icon={<Search className="h-5 w-5" />} placeholder="기관명 검색" />
          </div>
        </div>
        <DataTable columns={columns} data={agencies} getRowKey={(row) => row.id} />
        <div className="flex items-center justify-between border-t border-outline-variant px-7 py-6">
          <span>총 1,248건 중 1-5건 표시</span>
          <div className="flex items-center gap-5">
            <span className="grid h-11 w-11 place-items-center rounded bg-primary text-on-primary">1</span>
            <span>2</span>
            <span>3</span>
            <span>...</span>
          </div>
        </div>
      </Card>
    </section>
  );
}

function AgencyStat({ label, value, soft = false }: { label: string; value: string; soft?: boolean }) {
  return (
    <Card className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <p className="font-headline text-[20px] font-bold">{label}</p>
        <div className={`grid h-14 w-14 place-items-center rounded ${soft ? 'bg-tertiary-container/30 text-primary' : 'bg-primary text-on-primary'}`}>
          <Landmark className="h-6 w-6" />
        </div>
      </div>
      <p className="font-headline text-[52px] font-bold">{value}</p>
    </Card>
  );
}
