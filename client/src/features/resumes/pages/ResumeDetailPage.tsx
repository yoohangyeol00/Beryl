import { useParams } from 'react-router-dom';
import { PageTitle } from '../../../components/common/PageTitle';
import { MetricCard } from '../../../components/common/MetricCard';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type PersonProfile = {
  name: string;
  role: string;
  career: string;
  availableFrom: string;
  currentClient: string;
  skills: string[];
};

type History = { id: string; project: string; client: string; role: string; period: string; mm: number };

const profiles: Record<string, PersonProfile> = {
  'm-1': { name: '김도윤', role: 'PM/아키텍트', career: '14년', availableFrom: '2026-10-01', currentClient: '소방청', skills: ['공공 PM', 'MSA', 'Spring Boot', '아키텍처', '제안 리딩'] },
  'm-2': { name: '이서연', role: 'Frontend', career: '8년', availableFrom: '2026-08-16', currentClient: '조달청', skills: ['React', 'TypeScript', '대시보드', '포털 UX', '접근성'] },
  'm-3': { name: '박지훈', role: 'Backend', career: '9년', availableFrom: '2026-07-01', currentClient: '대기', skills: ['Spring Boot', 'API', 'PostgreSQL', '공공 데이터', '배치'] },
  'm-4': { name: '최민서', role: 'DevOps', career: '7년', availableFrom: '2026-08-01', currentClient: 'NIA', skills: ['Kubernetes', 'CI/CD', '클라우드 운영', '모니터링', '장애 대응'] },
  demo: { name: '김도윤', role: 'PM/아키텍트', career: '14년', availableFrom: '2026-10-01', currentClient: '소방청', skills: ['공공 PM', 'MSA', 'Spring Boot', '아키텍처', '제안 리딩'] }
};

const histories: Record<string, History[]> = {
  'm-1': [
    { id: 'h-1', project: '재난 안전 관리 시스템', client: '소방청', role: 'PM/아키텍트', period: '2026.01 - 2026.09', mm: 9 },
    { id: 'h-2', project: '전자조달 플랫폼 고도화', client: '조달청', role: 'PM', period: '2025.01 - 2025.12', mm: 12 },
    { id: 'h-3', project: '공공 데이터 표준화', client: '행정안전부', role: 'PL', period: '2024.02 - 2024.12', mm: 10 }
  ],
  'm-2': [
    { id: 'h-1', project: '전자조달 포털 개선', client: '조달청', role: 'Frontend', period: '2026.02 - 2026.08', mm: 4 },
    { id: 'h-2', project: '민원 대시보드 구축', client: '서울시', role: 'Frontend Lead', period: '2025.03 - 2025.12', mm: 9 }
  ],
  'm-3': [
    { id: 'h-1', project: '공공데이터 API 연계', client: '행정안전부', role: 'Backend', period: '2025.06 - 2026.02', mm: 8 },
    { id: 'h-2', project: '기관 연계 배치 고도화', client: '한국도로공사', role: 'Backend', period: '2024.01 - 2024.09', mm: 7 }
  ],
  'm-4': [
    { id: 'h-1', project: 'AI 교과서 클라우드 운영', client: 'NIA', role: 'DevOps', period: '2026.01 - 2026.07', mm: 7 },
    { id: 'h-2', project: '공공 클라우드 전환', client: '정보통신산업진흥원', role: 'DevOps', period: '2025.01 - 2025.10', mm: 10 }
  ],
  demo: []
};

const columns: DataTableColumn<History>[] = [
  { key: 'project', header: '사업명' },
  { key: 'client', header: '고객사/투입처' },
  { key: 'role', header: '역할' },
  { key: 'period', header: '기간' },
  { key: 'mm', header: 'M/M', align: 'right' }
];

export function ResumeDetailPage() {
  const { resumeId = 'demo' } = useParams();
  const profile = profiles[resumeId] ?? profiles.demo;
  const rows = histories[resumeId] ?? histories['m-1'];

  return (
    <section>
      <PageTitle title={`${profile.name} 인력 상세`} description="투입 이력, 보유 역량, 현재 투입처와 다음 가용 시점을 확인합니다." />
      <div className="mb-6 grid gap-4 md:grid-cols-5">
        <MetricCard label="이름" value={profile.name} />
        <MetricCard label="역할" value={profile.role} />
        <MetricCard label="경력" value={profile.career} />
        <MetricCard label="현재 투입처" value={profile.currentClient} />
        <MetricCard label="가용일" value={profile.availableFrom} />
      </div>
      <Card className="mb-6 p-6">
        <h2 className="mb-4 font-headline text-headline-md text-on-surface">보유 역량</h2>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill) => (
            <Badge key={skill} tone="info">
              {skill}
            </Badge>
          ))}
        </div>
      </Card>
      <DataTable columns={columns} data={rows} getRowKey={(row) => row.id} />
    </section>
  );
}
