import { BarChart3, Check, Code2, Sparkles, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { PageTitle } from '../../../components/common/PageTitle';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type CompareRow = {
  id: string;
  item: string;
  requirement: string;
  capability: string;
  result: 'match' | 'partial';
};

const rows: CompareRow[] = [
  { id: '1', item: '프레임워크 / 아키텍처', requirement: 'Spring Boot 기반 MSA 전환 경험 필수', capability: '관세청 시스템 MSA 아키텍처 설계 및 전환 리딩 (2022)', result: 'match' },
  { id: '2', item: '데이터베이스', requirement: 'Oracle to PostgreSQL 마이그레이션', capability: 'PostgreSQL 기반 구축 경험 3회', result: 'partial' },
  { id: '3', item: '사업 관리 등급', requirement: '특급 기술자 (PL급 이상)', capability: '특급 기술자, 공공 PL 경험 5회', result: 'match' },
  { id: '4', item: '보안 / 규제', requirement: '국가정보원 보안 가이드라인 준수 경험', capability: '다수의 금융/공공 프로젝트 망분리 및 보안 가이드라인 숙지도 높음', result: 'match' }
];

const analyses = {
  'match-8f3a21': {
    name: '김도윤',
    title: 'PM/아키텍트',
    score: '92%',
    previousScore: '78%',
    delta: '+14%',
    summary: '공공기관의 대규모 시스템 구축 경험이 풍부하며 Java, Spring Boot 기반 MSA 전환에 90% 이상의 기술적 부합도를 보입니다.',
    availability: '현재 계약 종료 예정일이 2026-07-31이라 본 사업의 8월 착수 일정과도 맞아 제안 우선순위가 높습니다.',
    stack: '90%',
    publicExp: '85%',
    availabilityScore: '100%',
    similar: '80%'
  },
  'match-42c9e7': {
    name: '이서연',
    title: 'Frontend',
    score: '86%',
    previousScore: '72%',
    delta: '+14%',
    summary: '포털 UX와 대시보드 구축 경험이 강점이며, 사용자 권한/업무 흐름이 복잡한 공공 화면 설계에 적합합니다.',
    availability: '현재 0.5 M/M 투입 중이라 2026-08-16 이후 단계적 투입이 현실적입니다.',
    stack: '88%',
    publicExp: '76%',
    availabilityScore: '82%',
    similar: '78%'
  },
  'match-a71d04': {
    name: '박지훈',
    title: 'Backend',
    score: '81%',
    previousScore: '68%',
    delta: '+13%',
    summary: 'Spring Boot API 구축과 공공 데이터 연계 경험이 있어 백엔드 파트 후보로 적합합니다.',
    availability: '현재 대기 상태라 즉시 투입 가능하지만 대규모 PM 경험은 보완 후보가 필요합니다.',
    stack: '86%',
    publicExp: '72%',
    availabilityScore: '100%',
    similar: '66%'
  },
  'match-d03b88': {
    name: '최민서',
    title: 'DevOps',
    score: '74%',
    previousScore: '64%',
    delta: '+10%',
    summary: '클라우드 운영 경험은 적합하지만 본 사업의 MSA 설계 리딩보다는 DevOps 보조 포지션에 더 알맞습니다.',
    availability: '2026-08-01부터 가용 가능하나 현 프로젝트 철수 리스크 확인이 필요합니다.',
    stack: '74%',
    publicExp: '70%',
    availabilityScore: '85%',
    similar: '68%'
  }
} as const;

export function OfferAnalysisPage() {
  const { offerId = 'match-8f3a21' } = useParams();
  const analysis = analyses[offerId as keyof typeof analyses] ?? analyses['match-8f3a21'];
  const columns: DataTableColumn<CompareRow>[] = [
    { key: 'item', header: '평가 항목' },
    { key: 'requirement', header: 'RFP 핵심 요구사항' },
    { key: 'capability', header: `후보자 보유 역량 (${analysis.name})` },
    {
      key: 'result',
      header: '판정',
      render: (row) => (
        <span className={row.result === 'match' ? 'grid h-8 w-8 place-items-center rounded-full bg-primary-container text-on-primary' : 'grid h-8 w-8 place-items-center rounded-full bg-surface-container-high text-on-surface-variant'}>
          {row.result === 'match' ? <Check className="h-4 w-4" /> : '-'}
        </span>
      )
    }
  ];

  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <Badge tone="success">분석 완료</Badge>
        <span className="text-primary">ID: REQ-2023-089</span>
      </div>
      <PageTitle
        title="인력추천 분석"
        description={`대상 사업: 차세대 통합 재난 안전 관리 시스템 구축 / 추천 후보: ${analysis.name} ${analysis.title}`}
        actions={
          <>
            <Button variant="secondary">분석 리포트</Button>
            <Button>제안 후보로 추가</Button>
          </>
        }
      />

      <div className="mb-8 grid gap-8 xl:grid-cols-[380px_1fr]">
        <Card className="p-9">
          <h2 className="mb-8 font-headline text-[28px] font-bold">종합 매칭 점수</h2>
          <div className="mx-auto grid h-52 w-52 place-items-center rounded-full border-[22px] border-primary">
            <div className="text-center">
              <p className="font-headline text-[44px] font-bold text-primary">{analysis.score}</p>
              <Badge tone="success">Excellent Fit</Badge>
            </div>
          </div>
          <div className="mt-10 flex justify-between border-t border-outline-variant pt-7 text-primary">
            <span>기존 점수: {analysis.previousScore}</span>
            <strong>↗ 기준 대비 {analysis.delta}</strong>
          </div>
        </Card>

        <Card className="p-9">
          <div className="mb-8 flex items-center justify-between border-b border-outline-variant pb-7">
            <h2 className="flex items-center gap-3 font-headline text-[28px] font-bold">
              <Sparkles className="h-7 w-7 text-primary" />
              AI 추천 요약
            </h2>
            <span className="text-sm text-primary">Updated 10m ago</span>
          </div>
          <p className="text-[18px] leading-9 text-on-surface">
            <strong className="text-primary">{analysis.name}</strong> 후보는 {analysis.summary}
          </p>
          <p className="mt-7 text-[18px] leading-9 text-on-surface">
            {analysis.availability}
          </p>
        </Card>
      </div>

      <Card className="mb-8 p-8">
        <h2 className="mb-8 font-headline text-[28px] font-bold">상세 평가 지표</h2>
        <div className="grid gap-8 xl:grid-cols-4">
          <Score icon={<Code2 />} label="기술 스택 일치도" value={analysis.stack} note="핵심 기술 요구사항 기준" />
          <Score icon={<BarChart3 />} label="공공 사업 경험" value={analysis.publicExp} note="유사 고객사/도메인 이력" />
          <Score icon={<Check />} label="투입 가용성" value={analysis.availabilityScore} note="착수 예정일과 현재 계약 종료일 기준" />
          <Score icon={<TrendingUp />} label="유사 프로젝트 실적" value={analysis.similar} note="규모와 역할 유사도 기준" />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <h2 className="p-8 font-headline text-[28px] font-bold">요구사항 vs 보유역량 상세 비교</h2>
        <DataTable columns={columns} data={rows} getRowKey={(row) => row.id} />
      </Card>
    </section>
  );
}

function Score({ icon, label, value, note }: { icon: ReactNode; label: string; value: string; note: string }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 font-label text-primary">
        {icon}
        <span>{label}</span>
        <strong className="ml-auto text-[28px]">{value}</strong>
      </div>
      <div className="mb-3 h-3 rounded-full bg-surface-container">
        <div className="h-3 rounded-full bg-primary" style={{ width: value }} />
      </div>
      <p className="text-sm text-primary">{note}</p>
    </div>
  );
}
