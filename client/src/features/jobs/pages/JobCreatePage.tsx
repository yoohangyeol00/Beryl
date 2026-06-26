import { Calendar, FilePlus2, Save } from 'lucide-react';
import { PageTitle } from '../../../components/common/PageTitle';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';

export function JobCreatePage() {
  return (
    <section>
      <PageTitle
        title="공고 수집/보정"
        description="API/크롤링으로 가져온 공고를 보정하고, 당사 제안 가능성 분석 기준을 설정합니다."
        actions={
          <>
            <Button variant="secondary">임시저장</Button>
            <Button icon={<Save className="h-4 w-4" />}>분석 대기열 추가</Button>
          </>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <Card className="p-8">
            <div className="mb-7 flex items-center gap-3 border-b border-outline-variant pb-6">
              <FilePlus2 className="h-6 w-6 text-primary" />
              <h2 className="font-headline text-[26px] font-bold">수집 공고 정보</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Input label="공고명" placeholder="차세대 통합 재난 안전 관리 시스템 구축" />
              <Input label="공고번호" placeholder="20241012345-00" />
              <Input label="고객사/발주처" placeholder="소방청" />
              <Input label="필요 역량" placeholder="Java, Spring Boot, MSA" />
              <Input label="추정 예산" placeholder="8,900,000,000 KRW" />
              <Input label="수집 경로" placeholder="나라장터 API" />
            </div>
          </Card>

          <Card className="p-8">
            <div className="mb-7 flex items-center gap-3 border-b border-outline-variant pb-6">
              <Calendar className="h-6 w-6 text-primary" />
              <h2 className="font-headline text-[26px] font-bold">일정 및 투입 조건</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Input label="수집일" type="date" />
              <Input label="제안 마감일" type="datetime-local" />
              <Input label="투입 시작 예정일" type="date" />
              <Input label="예상 투입 기간" placeholder="12개월" />
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="mb-6 font-headline text-[26px] font-bold">인력추천 분석 기준</h2>
            <textarea
              className="min-h-48 w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-5 text-[16px] leading-7 outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim"
              placeholder="필요 기술, 투입 등급, 유사 사업 경험, 가용일, 단가 조건 등을 입력하세요."
            />
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="p-7">
            <h3 className="mb-4 font-headline text-[22px] font-bold">분석 체크리스트</h3>
            <ul className="space-y-4 text-on-surface-variant">
              {['수집 공고 정보 확인', '고객사 및 예산 확인', '제안 마감일 지정', '인력추천 기준 작성'].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="bg-primary p-7 text-on-primary">
            <p className="font-label text-label-md">AI 인력추천 분석</p>
            <p className="mt-3 text-[18px] leading-7">
              수집 공고를 분석하면 추천 인력, 가용일, 단가 적합도, 제안 우선순위를 자동으로 산출합니다.
            </p>
          </Card>
        </aside>
      </div>
    </section>
  );
}
