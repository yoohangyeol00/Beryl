import { useParams } from 'react-router-dom';
import { PageTitle } from '../../../components/common/PageTitle';
import { MetricCard } from '../../../components/common/MetricCard';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type ProjectSummary = {
  id: string;
  name: string;
  agency: string;
  supplier: string;
  endDate: string;
  health: '정상' | '주의' | '위험';
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
  status: '투입중' | '교체협의' | '철수예정';
};

const projects: Record<string, ProjectSummary> = {
  'p-1': { id: 'p-1', name: '차세대 통합 재난 안전 관리 시스템 구축', agency: '소방청', supplier: '테크브릿지코리아', endDate: '2027-07-31', health: '주의', nextAction: '월간 수행 점검 회의 일정 확정' },
  'p-2': { id: 'p-2', name: '현장 대응 모바일 관제 고도화', agency: '소방청', supplier: '도시정보기술', endDate: '2026-12-15', health: '정상', nextAction: '착수 보고서 승인' },
  'p-3': { id: 'p-3', name: '소방 데이터 통합 분석 플랫폼', agency: '소방청', supplier: '넥스트소프트', endDate: '2026-11-30', health: '위험', nextAction: '산출물 보완 요청 및 재검수' }
};

const assignedPeople: Record<string, AssignedPerson[]> = {
  'p-1': [
    { id: 'm-1', name: '김도윤', role: 'PM/아키텍트', grade: '특급', mm: 1, startDate: '2026-08-01', endDate: '2027-07-31', status: '투입중' },
    { id: 'm-2', name: '이서연', role: 'Frontend', grade: '고급', mm: 1, startDate: '2026-08-01', endDate: '2027-07-31', status: '투입중' },
    { id: 'm-3', name: '박지훈', role: 'Backend', grade: '고급', mm: 1, startDate: '2026-08-01', endDate: '2027-07-31', status: '교체협의' }
  ],
  'p-2': [
    { id: 'm-4', name: '최민서', role: 'Mobile', grade: '중급', mm: 1, startDate: '2026-07-20', endDate: '2026-12-15', status: '투입중' },
    { id: 'm-5', name: '정하늘', role: 'GIS', grade: '고급', mm: 0.5, startDate: '2026-07-20', endDate: '2026-12-15', status: '투입중' }
  ],
  'p-3': [
    { id: 'm-6', name: '오지훈', role: 'Data Engineer', grade: '고급', mm: 1, startDate: '2026-07-01', endDate: '2026-11-30', status: '철수예정' }
  ]
};

const columns: DataTableColumn<AssignedPerson>[] = [
  { key: 'name', header: '투입 인력', render: (row) => <strong>{row.name}</strong>, sortable: true },
  { key: 'role', header: '역할', sortable: true },
  { key: 'grade', header: '등급', sortable: true },
  { key: 'mm', header: 'M/M', align: 'right', sortable: true },
  { key: 'startDate', header: '투입 시작일', sortable: true },
  { key: 'endDate', header: '투입 종료일', sortable: true },
  {
    key: 'status',
    header: '상태',
    render: (row) => <Badge tone={row.status === '철수예정' ? 'danger' : row.status === '교체협의' ? 'info' : 'success'}>{row.status}</Badge>
  }
];

export function ProjectDetailPage() {
  const { projectId = 'p-1' } = useParams();
  const project = projects[projectId] ?? projects['p-1'];
  const people = assignedPeople[project.id] ?? [];

  return (
    <section>
      <PageTitle title={project.name} description={`${project.supplier}의 투입 인력, 계약 기간, 검수 상태와 수행 리스크를 확인합니다.`} />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard label="공급기업" value={project.supplier} />
        <MetricCard label="투입 인력" value={`${people.length}명`} />
        <MetricCard label="계약 종료일" value={project.endDate} />
        <MetricCard label="수행 리스크" value={project.health} tone={project.health === '위험' ? 'danger' : 'primary'} />
      </div>
      <div className="mb-6 grid gap-4 xl:grid-cols-3">
        <Card className="p-6">
          <p className="font-label text-label-sm uppercase text-on-surface-variant">다음 조치</p>
          <p className="mt-2 text-[20px] font-bold text-on-surface">{project.nextAction}</p>
        </Card>
        <Card className="p-6">
          <p className="font-label text-label-sm uppercase text-on-surface-variant">산출물 검수</p>
          <p className="mt-2 text-[20px] font-bold text-primary">3건 대기</p>
        </Card>
        <Card className="p-6">
          <p className="font-label text-label-sm uppercase text-on-surface-variant">월간 M/M 실적</p>
          <p className="mt-2 text-[20px] font-bold text-primary">계획 대비 94%</p>
        </Card>
      </div>
      <DataTable columns={columns} data={people} getRowKey={(row) => row.id} />
    </section>
  );
}
