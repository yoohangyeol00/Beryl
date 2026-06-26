import { Calendar, Download, Info, Send, Sparkles } from 'lucide-react';
import { PageTitle } from '../../../components/common/PageTitle';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export function JobDetailPage() {
  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge tone="success">진행중</Badge>
        <Badge tone="danger">D-15</Badge>
        <span className="text-on-surface-variant">공고번호: 20231012345-00</span>
      </div>

      <PageTitle
        title="차세대 국세 행정 시스템 구축"
        actions={
          <>
            <Button variant="secondary" icon={<Download className="h-4 w-4" />}>RFP 다운로드</Button>
            <Button icon={<Send className="h-4 w-4" />}>제안서 제출</Button>
          </>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <Card className="min-h-[720px] p-9">
          <div className="mb-9 flex items-center gap-3 border-b border-outline-variant pb-7">
            <Info className="h-6 w-6 text-primary" />
            <h2 className="font-headline text-[28px] font-bold">기본 정보</h2>
          </div>
          <dl className="grid gap-x-20 gap-y-14 md:grid-cols-2">
            <InfoBlock label="발주기관" value="국세청" />
            <InfoBlock label="추정 예산" value="50,000,000,000 KRW (VAT 포함)" strong />
            <InfoBlock label="공고 일자" value="2023-10-01" />
            <InfoBlock label="제안서 마감일시" value="2023-11-15 14:00" danger />
            <InfoBlock label="계약 방법" value="협상에 의한 계약" />
            <InfoBlock label="사업 기간" value="계약체결일로부터 12개월" />
          </dl>
        </Card>

        <Card className="p-8">
          <div className="mb-8 flex items-start justify-between border-b border-outline-variant pb-7">
            <div className="flex gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="font-headline text-[28px] font-bold leading-tight">AI RFP 분석<br />요약</h2>
            </div>
            <div className="grid h-16 w-16 place-items-center rounded bg-secondary-container text-xs font-bold text-primary">Vertex<br />AI</div>
          </div>

          <AnalysisSection
            title="핵심 요구사항"
            items={['Cloud-native 아키텍처 전환', 'MSA (Microservices Architecture) 구현', '대용량 트랜잭션 처리 최적화']}
          />
          <AnalysisSection
            title="필수 자격요건"
            items={['CMMI Level 3 이상 인증 보유', '최근 3년 내 공공부문 유사 사업 수행 실적', '소프트웨어사업자 신고']}
          />
          <div>
            <div className="mb-4 flex items-center gap-2 font-label text-primary">
              <Calendar className="h-5 w-5" />
              주요 일정
            </div>
            <div className="space-y-3 rounded border border-outline-variant bg-surface-container-low p-5">
              <Schedule label="Kick-off" value="2024년 1월" />
              <Schedule label="구축 완료" value="2024년 12월" />
            </div>
          </div>
        </Card>
      </div>
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
