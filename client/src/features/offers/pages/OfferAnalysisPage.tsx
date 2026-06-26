import { BarChart3, Check, Code2, Sparkles, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';
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

const columns: DataTableColumn<CompareRow>[] = [
  { key: 'item', header: '평가 항목' },
  { key: 'requirement', header: 'RFP 핵심 요구사항' },
  { key: 'capability', header: '후보자 보유 역량 (김도윤)' },
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

export function OfferAnalysisPage() {
  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <Badge tone="success">분석 완료</Badge>
        <span className="text-primary">ID: REQ-2023-089</span>
      </div>
      <PageTitle
        title="추천 매칭 알고리즘 상세 분석"
        description="대상 사업: 차세대 국세 행정 시스템 구축 (김도윤 수석 매칭 평가)"
        actions={
          <>
            <Button variant="secondary">분석 리포트</Button>
            <Button>인력 확정</Button>
          </>
        }
      />

      <div className="mb-8 grid gap-8 xl:grid-cols-[380px_1fr]">
        <Card className="p-9">
          <h2 className="mb-8 font-headline text-[28px] font-bold">종합 매칭 점수</h2>
          <div className="mx-auto grid h-52 w-52 place-items-center rounded-full border-[22px] border-primary">
            <div className="text-center">
              <p className="font-headline text-[44px] font-bold text-primary">85%</p>
              <Badge tone="success">Excellent Fit</Badge>
            </div>
          </div>
          <div className="mt-10 flex justify-between border-t border-outline-variant pt-7 text-primary">
            <span>기존 점수: 70%</span>
            <strong>↗ 기준 대비 +15%</strong>
          </div>
        </Card>

        <Card className="p-9">
          <div className="mb-8 flex items-center justify-between border-b border-outline-variant pb-7">
            <h2 className="flex items-center gap-3 font-headline text-[28px] font-bold">
              <Sparkles className="h-7 w-7 text-primary" />
              AI 추천 요약 (Vertex AI)
            </h2>
            <span className="text-sm text-primary">Updated 10m ago</span>
          </div>
          <p className="text-[18px] leading-9 text-on-surface">
            <strong className="text-primary">김도윤 수석</strong>은 국세청 및 유관 공공기관의 대규모 시스템 구축 경험이 풍부하며,
            본 사업의 핵심 기술인 <mark className="rounded bg-secondary-container px-2 text-on-secondary-container">Java, Spring Boot 기반 MSA 전환</mark>에
            있어 90% 이상의 기술적 부합도를 보입니다.
          </p>
          <p className="mt-7 text-[18px] leading-9 text-on-surface">
            이전 차세대 행정 시스템 구축 프로젝트에서의 성공적인 리딩 경험이 본 사업과 매우 유사하여 높은 기여도를 기대할 수 있습니다.
          </p>
        </Card>
      </div>

      <Card className="mb-8 p-8">
        <h2 className="mb-8 font-headline text-[28px] font-bold">상세 평가 지표</h2>
        <div className="grid gap-8 xl:grid-cols-4">
          <Score icon={<Code2 />} label="기술 스택 일치도" value="90%" note="Java, Spring Boot, MSA 핵심 충족" />
          <Score icon={<BarChart3 />} label="공공 사업 경험" value="80%" note="국세청/관세청 유사 도메인 이력" />
          <Score icon={<Check />} label="투입 가용성" value="100%" note="9/1 착수일 기준 즉시 투입 가능" />
          <Score icon={<TrendingUp />} label="유사 프로젝트 실적" value="75%" note="100억 이상 규모 PL 경험 2회" />
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
