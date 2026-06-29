import { Calendar, FilePlus2, Paperclip, Save, Sparkles } from 'lucide-react';
import { PageTitle } from '../../../components/common/PageTitle';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';

const checklist = [
  '사업 기본 정보 확인',
  'RFP 및 첨부파일 등록',
  '제안 마감/평가 일정 입력',
  '평가 기준과 배점 검토',
  '공개 범위와 담당자 지정'
];

export function JobCreatePage() {
  return (
    <section>
      <PageTitle
        title="공고 등록/수정"
        description="기관 발주 사업의 공고 정보, RFP, 평가 기준, 제출 일정을 등록하고 공개 상태를 관리합니다."
        actions={
          <>
            <Button variant="secondary">임시저장</Button>
            <Button icon={<Save className="h-4 w-4" />}>공고 저장</Button>
          </>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <Card className="p-8">
            <div className="mb-7 flex items-center gap-3 border-b border-outline-variant pb-6">
              <FilePlus2 className="h-6 w-6 text-primary" />
              <h2 className="font-headline text-[26px] font-bold">사업 기본 정보</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Input label="사업명" placeholder="차세대 통합 재난 안전 관리 시스템 구축" />
              <Input label="공고번호" placeholder="20261012345-00" />
              <Input label="발주기관" placeholder="소방청" />
              <Input label="담당 부서" placeholder="디지털재난대응과" />
              <Input label="추정 예산" placeholder="8,900,000,000 KRW" />
              <Input label="요구 역량" placeholder="Java, Spring Boot, MSA, React" />
            </div>
          </Card>

          <Card className="p-8">
            <div className="mb-7 flex items-center gap-3 border-b border-outline-variant pb-6">
              <Calendar className="h-6 w-6 text-primary" />
              <h2 className="font-headline text-[26px] font-bold">일정 및 평가 기준</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Input label="공고 시작일" type="date" />
              <Input label="제안 마감일시" type="datetime-local" />
              <Input label="질의 마감일" type="date" />
              <Input label="평가 예정일" type="date" />
              <Input label="계약 예정일" type="date" />
              <Input label="착수 예정일" type="date" />
            </div>
          </Card>

          <Card className="p-8">
            <div className="mb-7 flex items-center gap-3 border-b border-outline-variant pb-6">
              <Paperclip className="h-6 w-6 text-primary" />
              <h2 className="font-headline text-[26px] font-bold">RFP 분석 기준</h2>
            </div>
            <textarea
              className="min-h-48 w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-5 text-[16px] leading-7 outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim"
              placeholder="필수 기술, 투입 역할, 평가 배점, 보안 요건, 산출물, 유사 사업 경험 등 제안 평가에 필요한 기준을 입력하세요."
            />
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="p-7">
            <h3 className="mb-4 font-headline text-[22px] font-bold">등록 체크리스트</h3>
            <ul className="space-y-4 text-on-surface-variant">
              {checklist.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="bg-primary p-7 text-on-primary">
            <Sparkles className="mb-4 h-7 w-7" />
            <p className="font-label text-label-md">RFP 분석 준비</p>
            <p className="mt-3 text-[18px] leading-7">
              RFP를 등록하면 핵심 요구사항, 평가 기준, 공급기업 제안 비교 항목을 자동으로 구조화할 수 있습니다.
            </p>
          </Card>
        </aside>
      </div>
    </section>
  );
}
