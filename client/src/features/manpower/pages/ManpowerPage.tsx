import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageTitle } from '../../../components/common/PageTitle';
import { MetricCard } from '../../../components/common/MetricCard';
import { PageToolbar } from '../../../components/common/PageToolbar';
import { Badge } from '../../../components/ui/Badge';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type Manpower = {
  id: string;
  name: string;
  role: string;
  client: string;
  project: string;
  mm: number;
  endDate: string;
  availableFrom: string;
  status: '투입중' | '부분투입' | '가용' | '교체검토';
};

const rows: Manpower[] = [
  { id: 'm-1', name: '김도윤', role: 'PM/아키텍트', client: '소방청', project: '재난 안전 관리 시스템', mm: 1.0, endDate: '2026-09-30', availableFrom: '2026-10-01', status: '투입중' },
  { id: 'm-2', name: '이서연', role: 'Frontend', client: '조달청', project: '전자조달 포털 개선', mm: 0.5, endDate: '2026-08-15', availableFrom: '2026-08-16', status: '부분투입' },
  { id: 'm-3', name: '박지훈', role: 'Backend', client: '-', project: '대기', mm: 0, endDate: '-', availableFrom: '2026-07-01', status: '가용' },
  { id: 'm-4', name: '최민서', role: 'DevOps', client: 'NIA', project: 'AI 교과서 클라우드 운영', mm: 1.0, endDate: '2026-07-31', availableFrom: '2026-08-01', status: '교체검토' }
];

const columns: DataTableColumn<Manpower>[] = [
  { key: 'name', header: '인력', sortable: true, render: (row) => <strong>{row.name}</strong> },
  { key: 'role', header: '역할/등급', sortable: true },
  { key: 'client', header: '현재 투입처', sortable: true },
  { key: 'project', header: '수행 사업', sortable: true },
  { key: 'mm', header: 'M/M', align: 'right', sortable: true, sortValue: (row) => row.mm },
  { key: 'endDate', header: '계약 종료일', sortable: true },
  { key: 'availableFrom', header: '다음 가용일', sortable: true },
  {
    key: 'status',
    header: '상태',
    sortable: true,
    render: (row) => <Badge tone={row.status === '가용' ? 'success' : row.status === '교체검토' ? 'danger' : 'info'}>{row.status}</Badge>
  }
];

export function ManpowerPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState(searchParams.get('status') ?? 'all');
  const query = searchParams.get('q') ?? '';

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return rows.filter((row) => {
      const matchesQuery = !normalizedQuery || [row.name, row.role, row.client, row.project, row.status].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
      const matchesStatus = status === 'all' || row.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  const handleQueryChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set('q', value);
    else next.delete('q');
    setSearchParams(next);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    const next = new URLSearchParams(searchParams);
    if (value === 'all') next.delete('status');
    else next.set('status', value);
    setSearchParams(next);
  };

  return (
    <section>
      <PageTitle title="투입현황 관리" description="당사 인력이 어느 고객사와 사업에 투입되어 있는지, 종료일과 다음 가용 시점을 관리합니다." />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard label="전체 인력" value="124명" />
        <MetricCard label="투입중" value="86명" />
        <MetricCard label="30일 내 가용" value="18명" />
        <MetricCard label="교체/리스크" value="4명" tone="danger" />
      </div>
      <PageToolbar
        searchPlaceholder="이름, 고객사, 사업명 검색"
        searchValue={query}
        onSearchChange={handleQueryChange}
        resultCount={filteredRows.length}
        selects={[
          {
            label: '상태',
            value: status,
            onChange: handleStatusChange,
            options: [
              { label: '상태 전체', value: 'all' },
              { label: '투입중', value: '투입중' },
              { label: '부분투입', value: '부분투입' },
              { label: '가용', value: '가용' },
              { label: '교체검토', value: '교체검토' }
            ]
          },
          {
            label: '기간',
            value: 'all',
            onChange: () => undefined,
            options: [{ label: '기간 전체', value: 'all' }]
          }
        ]}
      />
      <DataTable columns={columns} data={filteredRows} getRowKey={(row) => row.id} onRowClick={(row) => navigate(`/resumes/${row.id}`)} emptyMessage="조건에 맞는 인력이 없습니다." />
    </section>
  );
}
