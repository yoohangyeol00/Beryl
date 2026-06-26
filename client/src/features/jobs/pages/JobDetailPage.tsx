import { Calendar, Download, Info, Send, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageTitle } from '../../../components/common/PageTitle';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type RecommendedPerson = {
  id: string;
  name: string;
  role: string;
  currentProject: string;
  availableFrom: string;
  fitScore: number;
  reason: string;
};

const recommendedPeople: RecommendedPerson[] = [
  { id: 'match-8f3a21', name: '김도윤', role: 'PM/아키텍트', currentProject: '전자조달 플랫폼 고도화', availableFrom: '2026-08-01', fitScore: 92, reason: 'MSA 전환과 공공 PM 경험 보유' },
  { id: 'match-42c9e7', name: '이서연', role: 'Frontend', currentProject: '전자조달 포털 개선', availableFrom: '2026-08-16', fitScore: 86, reason: '대시보드/포털 UX 구축 경험' },
  { id: 'match-a71d04', name: '박지훈', role: 'Backend', currentProject: '대기', availableFrom: '2026-07-01', fitScore: 81, reason: 'Spring Boot API 구축 경험' },
  { id: 'match-d03b88', name: '최민서', role: 'DevOps', currentProject: 'AI 교과서 클라우드 운영', availableFrom: '2026-08-01', fitScore: 74, reason: '클라우드 운영 경험, 일정 조율 필요' }
];

const recommendedColumns: DataTableColumn<RecommendedPerson>[] = [
  { key: 'name', header: '추천 인력', render: (row) => <strong>{row.name}</strong> },
  { key: 'role', header: '역할' },
  { key: 'currentProject', header: '현재 투입/상태' },
  { key: 'availableFrom', header: '가용일' },
  {
    key: 'fitScore',
    header: '적합도',
    align: 'right',
    render: (row) => <span className="rounded bg-primary px-3 py-1 font-bold text-on-primary">{row.fitScore}점</span>
  },
  { key: 'reason', header: '추천 사유' }
];

export function JobDetailPage() {
  const navigate = useNavigate();

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge tone="success">진행중</Badge>
        <Badge tone="danger">D-15</Badge>
        <span className="text-on-surface-variant">공고번호: 20231012345-00</span>
      </div>

      <PageTitle
        title="차세대 통합 재난 안전 관리 시스템 구축"
        actions={
          <>
            <Button variant="secondary" icon={<Download className="h-4 w-4" />}>RFP 다운로드</Button>
            <Button icon={<Send className="h-4 w-4" />}>후보 제안 만들기</Button>
          </>
        }
      />

      <div className="mb-8 grid gap-8 xl:grid-cols-[1fr_360px]">
        <Card className="min-h-[720px] p-9">
          <div className="mb-9 flex items-center gap-3 border-b border-outline-variant pb-7">
            <Info className="h-6 w-6 text-primary" />
            <h2 className="font-headline text-[28px] font-bold">기본 정보</h2>
          </div>
          <dl className="grid gap-x-20 gap-y-14 md:grid-cols-2">
            <InfoBlock label="고객사/발주처" value="소방청" />
            <InfoBlock label="추정 예산" value="8,900,000,000 KRW (VAT 포함)" strong />
            <InfoBlock label="수집 경로" value="나라장터 API" />
            <InfoBlock label="제안 마감일시" value="2026-07-03 14:00" danger />
            <InfoBlock label="필요 인력" value="PM, Backend, Frontend, DevOps" />
            <InfoBlock label="예상 투입 기간" value="2026.08 - 2027.07" />
          </dl>
        </Card>

        <Card className="p-8">
          <div className="mb-8 flex items-start justify-between border-b border-outline-variant pb-7">
            <div className="flex gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="font-headline text-[28px] font-bold leading-tight">AI 사업 분석<br />요약</h2>
            </div>
            <div className="grid h-16 w-16 place-items-center rounded bg-secondary-container text-xs font-bold text-primary">Vertex<br />AI</div>
          </div>

          <AnalysisSection
            title="핵심 요구사항"
            items={['Cloud-native 아키텍처 전환', 'MSA (Microservices Architecture) 구현', '대용량 트랜잭션 처리 최적화']}
          />
          <AnalysisSection
            title="당사 제안 포인트"
            items={['김도윤 PM의 유사 공공 시스템 구축 경험', '이서연 Frontend 가용일이 착수일과 부합', 'DevOps 후보 1명 추가 확보 필요']}
          />
          <div>
            <div className="mb-4 flex items-center gap-2 font-label text-primary">
              <Calendar className="h-5 w-5" />
              주요 일정
            </div>
            <div className="space-y-3 rounded border border-outline-variant bg-surface-container-low p-5">
              <Schedule label="제안 마감" value="2026년 7월" />
              <Schedule label="투입 예정" value="2026년 8월" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-outline-variant p-8">
          <h2 className="font-headline text-[28px] font-bold">추천 인력</h2>
          <p className="mt-2 text-on-surface-variant">추천 후보를 클릭하면 내부 매칭 ID 기준의 분석 화면으로 이동합니다.</p>
        </div>
        <DataTable
          columns={recommendedColumns}
          data={recommendedPeople}
          getRowKey={(row) => row.id}
          onRowClick={(row) => navigate(`/offers/${row.id}/analysis`)}
        />
      </Card>
    </section>
  );
}

function InfoBlock({ label, value, strong = false, danger = false }: { label: string; value: string; strong?: boolean; danger?: boolean }) {
  return (
    <div>
      <dt className="mb-3 text-sm text-on-surface-variant">{label}</dt>
      <dd className={[strong ? 'font-bold text-primary' : '', danger ? 'font-bold text-error' : '', 'text-[19px] leading-8'].join(' ')}>
        {value}
      </dd>
    </div>
  );
}

function AnalysisSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-8 border-b border-outline-variant pb-7">
      <h3 className="mb-4 font-label text-[16px] font-bold text-primary">{title}</h3>
      <ul className="space-y-3 text-[16px] leading-7 text-on-surface">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-3 h-1.5 w-1.5 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Schedule({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[16px]">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
