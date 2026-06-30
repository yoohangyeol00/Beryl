import { Calendar, FilePlus2, Paperclip, Save, Sparkles } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/apiResponse';
import { createJob, updateJob, type CreateJobRequest } from '../../../api/jobsApi';
import { LoadingState } from '../../../components/common/LoadingState';
import { PageTitle } from '../../../components/common/PageTitle';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../../auth/AuthContext';
import { getJobDetailPath } from '../../modes/roleMode';
import { useJobDetail } from '../hooks/useJobDetail';

type SourceType = NonNullable<CreateJobRequest['sourceType']>;

const checklist = ['사업 기본 정보 확인', 'RFP 및 첨부파일 등록', '제안 마감/평가 일정 입력', '평가 기준과 배점 검토', '공개 범위와 담당자 지정'];

export function JobCreatePage() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const isEditMode = Boolean(jobId);
  const { session } = useAuth();
  const { data: job, isLoading: isDetailLoading, isError: isDetailError, error: detailError } = useJobDetail(jobId ?? '');
  const [title, setTitle] = useState('');
  const [noticeNumber, setNoticeNumber] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('nara');
  const [sourceUrl, setSourceUrl] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [deadline, setDeadline] = useState('');
  const [questionDeadline, setQuestionDeadline] = useState('');
  const [evaluationDate, setEvaluationDate] = useState('');
  const [expectedStartDate, setExpectedStartDate] = useState('');
  const [expectedDuration, setExpectedDuration] = useState('');
  const [analysisCriteria, setAnalysisCriteria] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!job) return;

    setTitle(job.title);
    setNoticeNumber(job.noticeNumber);
    setBuyerName(job.agency);
    setCategory(job.category);
    setBudget(job.budget ? String(job.budget) : '');
    setSourceType(job.sourceType ?? 'manual');
    setSourceUrl(job.sourceUrl ?? '');
    setPublishedAt(formatDateInputValue(job.publishedAt));
    setDeadline(formatDateInputValue(job.deadline));

    const descriptionFields = parseDescriptionFields(job.description);
    setQuestionDeadline(descriptionFields.questionDeadline);
    setEvaluationDate(descriptionFields.evaluationDate);
    setExpectedStartDate(descriptionFields.expectedStartDate);
    setExpectedDuration(descriptionFields.expectedDuration);
    setAnalysisCriteria(descriptionFields.analysisCriteria);
  }, [job]);

  useEffect(() => {
    if (isEditMode || buyerName || !session?.company?.name) return;

    setBuyerName(session.company.name);
  }, [buyerName, isEditMode, session?.company?.name]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const payload = buildPayload({
      title,
      noticeNumber,
      buyerName,
      category,
      budget,
      sourceType,
      sourceUrl,
      publishedAt,
      deadline,
      questionDeadline,
      evaluationDate,
      expectedStartDate,
      expectedDuration,
      analysisCriteria
    });

    try {
      const savedJob = isEditMode && jobId ? await updateJob(jobId, payload) : await createJob(payload);
      navigate(getJobDetailPath('agency', savedJob.id), { replace: true });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, isEditMode ? '공고 수정 중 오류가 발생했습니다.' : '공고 등록 중 오류가 발생했습니다.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isEditMode && isDetailLoading) {
    return <LoadingState />;
  }

  if (isEditMode && isDetailError) {
    return (
      <Card className="p-8">
        <p className="font-semibold text-error">{getApiErrorMessage(detailError, '공고 정보를 불러오지 못했습니다.')}</p>
      </Card>
    );
  }

  return (
    <section>
      <PageTitle
        title={isEditMode ? '공고 수정' : '공고 등록/수집'}
        description="발주 사업의 공고 정보, RFP, 평가 기준, 제출 일정을 등록하고 관리합니다."
        actions={
          <>
            <Button variant="secondary" type="button" disabled={isSubmitting} onClick={() => navigate(-1)}>
              취소
            </Button>
            <Button type="submit" form="job-form" icon={<Save className="h-4 w-4" />} disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : isEditMode ? '수정 저장' : '공고 저장'}
            </Button>
          </>
        }
      />

      {errorMessage ? (
        <div className="mb-6 rounded-lg border border-error/30 bg-error-container px-5 py-4 font-semibold text-on-error-container">
          {errorMessage}
        </div>
      ) : null}

      <form id="job-form" className="grid gap-8 xl:grid-cols-[1fr_360px]" onSubmit={handleSubmit}>
        <div className="space-y-8">
          <Card className="p-8">
            <div className="mb-7 flex items-center gap-3 border-b border-outline-variant pb-6">
              <FilePlus2 className="h-6 w-6 text-primary" />
              <h2 className="font-headline text-[26px] font-bold">사업 기본 정보</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Input label="공고명" placeholder="차세대 통합 안전 관리 시스템 구축" value={title} onChange={(event) => setTitle(event.target.value)} required />
              <Input label="공고번호" placeholder="20261012345-00" value={noticeNumber} onChange={(event) => setNoticeNumber(event.target.value)} />
              <Input label="발주기관" placeholder="소방청" value={buyerName} onChange={(event) => setBuyerName(event.target.value)} required disabled={!isEditMode} />
              <Input label="필요 역량" placeholder="Java, Spring Boot, MSA, React" value={category} onChange={(event) => setCategory(event.target.value)} />
              <Input label="추정 예산" placeholder="8,900,000,000 KRW" value={budget} onChange={(event) => setBudget(event.target.value)} />
              <label className="block">
                <span className="mb-2 block font-label text-label-sm text-on-surface-variant">수집 경로</span>
                <select
                  className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body text-[16px] text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim"
                  value={sourceType}
                  onChange={(event) => setSourceType(event.target.value as SourceType)}
                >
                  <option value="nara">나라장터 API</option>
                  <option value="nipa">NIPA</option>
                  <option value="nia">NIA</option>
                  <option value="private_bid">민간 입찰</option>
                  <option value="manual">수동 등록</option>
                  <option value="email">이메일</option>
                  <option value="other">기타</option>
                </select>
              </label>
              <div className="md:col-span-2">
                <Input label="원문 공고 URL" placeholder="https://example.com/notice" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} />
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <div className="mb-7 flex items-center gap-3 border-b border-outline-variant pb-6">
              <Calendar className="h-6 w-6 text-primary" />
              <h2 className="font-headline text-[26px] font-bold">일정 및 평가 기준</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Input label="공고 시작일" type="date" value={publishedAt} onChange={(event) => setPublishedAt(event.target.value)} />
              <Input label="제안 마감일" type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
              <Input label="질의 마감일" type="date" value={questionDeadline} onChange={(event) => setQuestionDeadline(event.target.value)} />
              <Input label="평가 예정일" type="date" value={evaluationDate} onChange={(event) => setEvaluationDate(event.target.value)} />
              <Input label="착수 예정일" type="date" value={expectedStartDate} onChange={(event) => setExpectedStartDate(event.target.value)} />
              <Input label="예상 수행 기간" placeholder="12개월" value={expectedDuration} onChange={(event) => setExpectedDuration(event.target.value)} />
            </div>
          </Card>

          <Card className="p-8">
            <div className="mb-7 flex items-center gap-3 border-b border-outline-variant pb-6">
              <Paperclip className="h-6 w-6 text-primary" />
              <h2 className="font-headline text-[26px] font-bold">RFP 분석 기준</h2>
            </div>
            <textarea
              className="min-h-48 w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-5 text-[16px] leading-7 outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim"
              placeholder="필수 기술, 수행 역할, 평가 배점, 보안 요건, 산출물, 유사 사업 경험 등 제안 평가에 필요한 기준을 입력하세요."
              value={analysisCriteria}
              onChange={(event) => setAnalysisCriteria(event.target.value)}
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
              RFP를 등록하면 핵심 요구사항, 평가 기준, 공급기업 제안 비교 항목을 구조화할 수 있습니다.
            </p>
          </Card>
        </aside>
      </form>
    </section>
  );
}

function buildPayload({
  title,
  noticeNumber,
  buyerName,
  category,
  budget,
  sourceType,
  sourceUrl,
  publishedAt,
  deadline,
  questionDeadline,
  evaluationDate,
  expectedStartDate,
  expectedDuration,
  analysisCriteria
}: {
  title: string;
  noticeNumber: string;
  buyerName: string;
  category: string;
  budget: string;
  sourceType: SourceType;
  sourceUrl: string;
  publishedAt: string;
  deadline: string;
  questionDeadline: string;
  evaluationDate: string;
  expectedStartDate: string;
  expectedDuration: string;
  analysisCriteria: string;
}): CreateJobRequest {
  return {
    title,
    noticeNumber,
    buyerName,
    category,
    budget: parseBudget(budget),
    procurementType: 'public',
    sourceType,
    sourceUrl,
    publishedAt,
    deadline,
    status: 'draft',
    description: buildDescription({
      questionDeadline,
      evaluationDate,
      expectedStartDate,
      expectedDuration,
      analysisCriteria
    })
  };
}

function parseBudget(value: string) {
  const budget = Number(value.replace(/[^\d.]/g, ''));
  return Number.isFinite(budget) && budget > 0 ? budget : undefined;
}

function formatDateInputValue(value: string) {
  return value ? value.slice(0, 10) : '';
}

function parseDescriptionFields(description: string) {
  const fields = {
    questionDeadline: '',
    evaluationDate: '',
    expectedStartDate: '',
    expectedDuration: '',
    analysisCriteria: ''
  };

  if (!description.trim()) {
    return fields;
  }

  const blocks = description.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  const dateValues: string[] = [];
  const unstructuredBlocks: string[] = [];

  for (const block of blocks) {
    if (block.includes('RFP')) {
      fields.analysisCriteria = block.replace(/^.*RFP.*?:\s*/s, '').trim();
      continue;
    }

    const date = block.match(/\d{4}-\d{2}-\d{2}/)?.[0];

    if (date) {
      dateValues.push(date);
      continue;
    }

    if (!fields.expectedDuration && isDurationBlock(block)) {
      fields.expectedDuration = block.replace(/^.*?:\s*/, '').trim();
      continue;
    }

    unstructuredBlocks.push(block);
  }

  fields.questionDeadline = dateValues[0] ?? '';
  fields.evaluationDate = dateValues[1] ?? '';
  fields.expectedStartDate = dateValues[2] ?? '';

  if (!fields.analysisCriteria && unstructuredBlocks.length) {
    fields.analysisCriteria = unstructuredBlocks.join('\n\n');
  }

  return fields;
}

function isDurationBlock(value: string) {
  return /기간|duration|month|개월|媛쒖썡|湲곌컙/i.test(value);
}

function buildDescription({
  questionDeadline,
  evaluationDate,
  expectedStartDate,
  expectedDuration,
  analysisCriteria
}: {
  questionDeadline: string;
  evaluationDate: string;
  expectedStartDate: string;
  expectedDuration: string;
  analysisCriteria: string;
}) {
  return [
    questionDeadline ? `질의 마감일: ${questionDeadline}` : '',
    evaluationDate ? `평가 예정일: ${evaluationDate}` : '',
    expectedStartDate ? `착수 예정일: ${expectedStartDate}` : '',
    expectedDuration ? `예상 수행 기간: ${expectedDuration}` : '',
    analysisCriteria ? `RFP 분석 기준:\n${analysisCriteria}` : ''
  ]
    .filter(Boolean)
    .join('\n\n');
}
