import { useParams } from 'react-router-dom';
import { PageTitle } from '../../../components/common/PageTitle';
import { MetricCard } from '../../../components/common/MetricCard';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type ProjectSummary = {
  id: string;
  name: string;
  client: string;
  endDate: string;
  extension: '높음' | '검토' | '낮음';
  nextAction: string;
};

type AssignedPerson = {
  id: string;
  name: string;
  role: string;
  grade: string;
  mm: number;
  startDate: string;
  endDate: string;
  status: '투입중' | '연장협의' | '철수예정';
};

const projects: Record<string, ProjectSummary> = {
  'p-1': { id: 'p-1', name: '전자조달 플랫폼 고도화', client: '조달청', endDate: '2026-09-30', extension: '높음', nextAction: '연장 견적 준비' },
  'p-2': { id: 'p-2', name: '공공데이터 API 연계', client: '행정안전부', endDate: '2026-08-15', extension: '검토', nextAction: '고객 미팅 필요' },
  'p-3': { id: 'p-3', name: 'AI 교과서 클라우드 운영', client: 'NIA', endDate: '2026-07-31', extension: '낮음', nextAction: '철수 계획 수립' }
};

const assignedPeople: Record<string, AssignedPerson[]> = {
  'p-1': [
    { id: 'm-1', name: '김도윤', role: 'PM/아키텍트', grade: '특급', mm: 1, startDate: '2026-01-01', endDate: '2026-09-30', status: '연장협의' },
    { id: 'm-2', name: '이서연', role: 'Frontend', grade: '고급', mm: 1, startDate: '2026-02-01', endDate: '2026-09-30', status: '투입중' },
    { id: 'm-3', name: '박지훈', role: 'Backend', grade: '고급', mm: 1, startDate: '2026-03-01', endDate: '2026-09-30', status: '투입중' }
  ],
  'p-2': [
    { id: 'm-3', name: '박지훈', role: 'Backend', grade: '고급', mm: 1, startDate: '2026-04-01', endDate: '2026-08-15', status: '연장협의' },
    { id: 'm-4', name: '최민서', role: 'DevOps', grade: '중급', mm: 0.5, startDate: '2026-05-01', endDate: '2026-08-15', status: '투입중' }
  ],
  'p-3': [
    { id: 'm-4', name: '최민서', role: 'DevOps', grade: '중급', mm: 1, startDate: '2026-01-15', endDate: '2026-07-31', status: '철수예정' }
  ]
};

const columns: DataTableColumn<AssignedPerson>[] = [
  { key: 'name', header: '투입 인력', render: (row) => <strong>{row.name}</strong> },
  { key: 'role', header: '역할' },
  { key: 'grade', header: '등급' },
  { key: 'mm', header: 'M/M', align: 'right' },
  { key: 'startDate', header: '투입 시작일' },
  { key: 'endDate', header: '투입 종료일' },
  {
    key: 'status',
    header: '상태',
    render: (row) => <Badge tone={row.status === '철수예정' ? 'danger' : row.status === '연장협의' ? 'info' : 'success'}>{row.status}</Badge>
  }
];

export function ProjectDetailPage() {
  const { projectId = 'p-1' } = useParams();
  const project = projects[projectId] ?? projects['p-1'];
  const people = assignedPeople[project.id] ?? [];

  return (
    <section>
      <PageTitle title={project.name} description={`${project.client}에 투입된 당사 인력과 종료/연장 상황을 확인합니다.`} />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard label="고객사/투입처" value={project.client} />
        <MetricCard label="투입 인력" value={`${people.length}명`} />
        <MetricCard label="계약 종료일" value={project.endDate} />
        <MetricCard label="연장 가능성" value={project.extension} tone={project.extension === '낮음' ? 'danger' : 'primary'} />
      </div>
      <Card className="mb-6 p-6">
        <p className="font-label text-label-sm uppercase text-on-surface-variant">다음 조치</p>
        <p className="mt-2 text-[20px] font-bold text-on-surface">{project.nextAction}</p>
      </Card>
      <DataTable columns={columns} data={people} getRowKey={(row) => row.id} />
    </section>
  );
}
