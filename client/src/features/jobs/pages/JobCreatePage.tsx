import { Calendar, FilePlus2, Save } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/apiResponse';
import { createJob } from '../../../api/jobsApi';
import { PageTitle } from '../../../components/common/PageTitle';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';

export function JobCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [noticeNumber, setNoticeNumber] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [sourceType, setSourceType] = useState('nara');
  const [sourceUrl, setSourceUrl] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [deadline, setDeadline] = useState('');
  const [expectedStartDate, setExpectedStartDate] = useState('');
  const [expectedDuration, setExpectedDuration] = useState('');
  const [analysisCriteria, setAnalysisCriteria] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const createdJob = await createJob({
        title,
        noticeNumber,
        buyerName,
        category,
        budget: parseBudget(budget),
        procurementType: 'public',
        sourceType: sourceType as 'nara' | 'private_bid' | 'manual' | 'email' | 'other',
        sourceUrl,
        publishedAt,
        deadline,
        status: 'draft',
        description: buildDescription({
          expectedStartDate,
          expectedDuration,
          analysisCriteria
        })
      });

      setMessage('공고가 등록되었습니다.');
      navigate(`/jobs/${createdJob.id}`, { replace: true });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, '공고 등록 중 오류가 발생했습니다.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <PageTitle
        title="공고 수집/보정"
        description="API/크롤링으로 가져온 공고를 보정하고, 당사 제안 가능성 분석 기준을 설정합니다."
        actions={
          <>
            <Button variant="secondary" type="button" disabled={isSubmitting}>
              임시저장
            </Button>
            <Button type="submit" form="job-create-form" icon={<Save className="h-4 w-4" />} disabled={isSubmitting}>
              {isSubmitting ? '등록 중...' : '분석 대기열 추가'}
            </Button>
          </>
        }
      />

      {errorMessage ? (
        <div className="mb-6 rounded-lg border border-error/30 bg-error-container px-5 py-4 font-semibold text-on-error-container">
          {errorMessage}
        </div>
      ) : null}
      {message ? (
        <div className="mb-6 rounded-lg border border-primary/30 bg-secondary-container px-5 py-4 font-semibold text-primary">
          {message}
        </div>
      ) : null}

      <form id="job-create-form" className="grid gap-8 xl:grid-cols-[1fr_360px]" onSubmit={handleSubmit}>
        <div className="space-y-8">
          <Card className="p-8">
            <div className="mb-7 flex items-center gap-3 border-b border-outline-variant pb-6">
              <FilePlus2 className="h-6 w-6 text-primary" />
              <h2 className="font-headline text-[26px] font-bold">수집 공고 정보</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Input
                label="공고명"
                placeholder="차세대 통합 재난 안전 관리 시스템 구축"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
              <Input
                label="공고번호"
                placeholder="20241012345-00"
                value={noticeNumber}
                onChange={(event) => setNoticeNumber(event.target.value)}
              />
              <Input
                label="고객사/발주처"
                placeholder="소방청"
                value={buyerName}
                onChange={(event) => setBuyerName(event.target.value)}
                required
              />
              <Input
                label="필요 역량"
                placeholder="Java, Spring Boot, MSA"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              />
              <Input
                label="추정 예산"
                placeholder="8,900,000,000 KRW"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
              />
              <label className="block">
                <span className="mb-2 block font-label text-label-sm text-on-surface-variant">수집 경로</span>
                <select
                  className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body text-[16px] text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim"
                  value={sourceType}
                  onChange={(event) => setSourceType(event.target.value)}
                >
                  <option value="nara">나라장터 API</option>
                  <option value="private_bid">민간 입찰</option>
                  <option value="manual">수동 등록</option>
                  <option value="email">이메일</option>
                  <option value="other">기타</option>
                </select>
              </label>
              <div className="md:col-span-2">
                <Input
                  label="원문 공고 URL"
                  placeholder="https://example.com/notice"
                  value={sourceUrl}
                  onChange={(event) => setSourceUrl(event.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <div className="mb-7 flex items-center gap-3 border-b border-outline-variant pb-6">
              <Calendar className="h-6 w-6 text-primary" />
              <h2 className="font-headline text-[26px] font-bold">일정 및 투입 조건</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Input
                label="수집일"
                type="date"
                value={publishedAt}
                onChange={(event) => setPublishedAt(event.target.value)}
              />
              <Input
                label="제안 마감일"
                type="datetime-local"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
              />
              <Input
                label="투입 시작 예정일"
                type="date"
                value={expectedStartDate}
                onChange={(event) => setExpectedStartDate(event.target.value)}
              />
              <Input
                label="예상 투입 기간"
                placeholder="12개월"
                value={expectedDuration}
                onChange={(event) => setExpectedDuration(event.target.value)}
              />
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="mb-6 font-headline text-[26px] font-bold">인력추천 분석 기준</h2>
            <textarea
              className="min-h-48 w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-5 text-[16px] leading-7 outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim"
              placeholder="필요 기술, 투입 등급, 유사 사업 경험, 가용일, 단가 조건 등을 입력하세요."
              value={analysisCriteria}
              onChange={(event) => setAnalysisCriteria(event.target.value)}
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
      </form>
    </section>
  );
}

function parseBudget(value: string) {
  const budget = Number(value.replace(/[^\d.]/g, ''));
  return Number.isFinite(budget) && budget > 0 ? budget : undefined;
}

function buildDescription({
  expectedStartDate,
  expectedDuration,
  analysisCriteria
}: {
  expectedStartDate: string;
  expectedDuration: string;
  analysisCriteria: string;
}) {
  return [
    expectedStartDate ? `투입 시작 예정일: ${expectedStartDate}` : '',
    expectedDuration ? `예상 투입 기간: ${expectedDuration}` : '',
    analysisCriteria ? `인력추천 분석 기준:\n${analysisCriteria}` : ''
  ]
    .filter(Boolean)
    .join('\n\n');
}
