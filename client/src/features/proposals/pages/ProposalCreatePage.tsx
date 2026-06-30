import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, FileText, Save, Send, Sparkles, Users } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/apiResponse';
import { getJobDetail, getJobs } from '../../../api/jobsApi';
import { createOffer, getOffer, recordOfferSubmission, updateOffer } from '../../../api/offersApi';
import { getResumes } from '../../../api/resumesApi';
import { PageTitle } from '../../../components/common/PageTitle';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import type { OfferStatus, SubmissionChannel } from '../../../types/offer';
import type { Resume } from '../../../types/resume';

type FormState = {
  jobId: string;
  proposalTitle: string;
  proposalManagerName: string;
  proposalAmount: string;
  expectedStartDate: string;
  expectedDurationMonths: string;
  strategyMemo: string;
  selectedResumeIds: string[];
};

type SubmissionFormState = {
  submittedAt: string;
  channel: SubmissionChannel;
  receiptNo: string;
  submittedByName: string;
  memo: string;
};

const initialForm: FormState = {
  jobId: '',
  proposalTitle: '',
  proposalManagerName: '',
  proposalAmount: '',
  expectedStartDate: '',
  expectedDurationMonths: '',
  strategyMemo: '',
  selectedResumeIds: []
};

const channelLabels: Record<SubmissionChannel, string> = {
  nara: '나라장터',
  email: '이메일',
  portal: '발주처 포털',
  visit: '방문 제출',
  other: '기타'
};

function getNowInputValue() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

export function ProposalCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { offerId } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(offerId);
  const initialJobId = searchParams.get('jobId') ?? '';
  const [form, setForm] = useState<FormState>({ ...initialForm, jobId: initialJobId });
  const [isSubmissionFormOpen, setIsSubmissionFormOpen] = useState(false);
  const [submissionForm, setSubmissionForm] = useState<SubmissionFormState>({
    submittedAt: getNowInputValue(),
    channel: 'nara',
    receiptNo: '',
    submittedByName: '',
    memo: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const offerQuery = useQuery({
    queryKey: ['offer', offerId],
    queryFn: () => getOffer(offerId ?? ''),
    enabled: isEdit
  });
  const jobsQuery = useQuery({
    queryKey: ['jobs', { perspective: 'accessible', status: 'open', pageSize: 100 }],
    queryFn: () => getJobs({ perspective: 'accessible', status: 'open', pageSize: 100 })
  });
  const selectedJobQuery = useQuery({
    queryKey: ['jobs', initialJobId],
    queryFn: () => getJobDetail(initialJobId),
    enabled: !isEdit && Boolean(initialJobId)
  });
  const resumesQuery = useQuery({
    queryKey: ['resumes', { pageSize: 100 }],
    queryFn: () => getResumes({ pageSize: 100 })
  });
  const selectedJob = useMemo(() => jobsQuery.data?.items.find((job) => job.id === form.jobId), [form.jobId, jobsQuery.data?.items]);
  const latestSubmission = offerQuery.data?.latestSubmission ?? null;
  const displayJob = selectedJob ?? selectedJobQuery.data ?? (offerQuery.data ? {
    id: offerQuery.data.jobId,
    title: offerQuery.data.jobTitle,
    agency: offerQuery.data.buyerName,
    noticeNumber: '',
    budget: 0,
    deadline: ''
  } : null);
  const shouldRenderSelectedJobOption = Boolean(!isEdit && displayJob && form.jobId && !jobsQuery.data?.items.some((job) => job.id === form.jobId));
  const selectedResumes = resumesQuery.data?.items.filter((resume) => form.selectedResumeIds.includes(resume.id)) ?? [];

  useEffect(() => {
    if (!offerQuery.data) return;

    setForm({
      jobId: offerQuery.data.jobId,
      proposalTitle: offerQuery.data.proposalTitle,
      proposalManagerName: offerQuery.data.proposalManagerName,
      proposalAmount: offerQuery.data.proposalAmount ? String(offerQuery.data.proposalAmount) : '',
      expectedStartDate: offerQuery.data.expectedStartDate,
      expectedDurationMonths: offerQuery.data.expectedDurationMonths ? String(offerQuery.data.expectedDurationMonths) : '',
      strategyMemo: offerQuery.data.strategyMemo,
      selectedResumeIds: offerQuery.data.matches.map((match) => match.resumeId)
    });
  }, [offerQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (status: OfferStatus) =>
      offerId ? updateOffer(offerId, {
        status,
        proposalTitle: form.proposalTitle,
        proposalManagerName: form.proposalManagerName,
        proposalAmount: form.proposalAmount,
        expectedStartDate: form.expectedStartDate,
        expectedDurationMonths: form.expectedDurationMonths,
        strategyMemo: form.strategyMemo,
        resumeIds: form.selectedResumeIds
      }) : createOffer({
        jobId: form.jobId,
        status,
        proposalTitle: form.proposalTitle,
        proposalManagerName: form.proposalManagerName,
        proposalAmount: form.proposalAmount,
        expectedStartDate: form.expectedStartDate,
        expectedDurationMonths: form.expectedDurationMonths,
        strategyMemo: form.strategyMemo,
        resumeIds: form.selectedResumeIds
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['offers'] });
      if (offerId) {
        await queryClient.invalidateQueries({ queryKey: ['offer', offerId] });
      }
      navigate('/supplier/bid-participation');
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, '제안서를 저장하지 못했습니다.'));
    }
  });
  const submissionMutation = useMutation({
    mutationFn: () => recordOfferSubmission(offerId ?? '', submissionForm),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['offers'] });
      if (offerId) {
        await queryClient.invalidateQueries({ queryKey: ['offer', offerId] });
      }
      setIsSubmissionFormOpen(false);
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, '제출 기록을 저장하지 못했습니다.'));
    }
  });

  const updateField = (key: keyof FormState, value: string | string[]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateSubmissionField = (key: keyof SubmissionFormState, value: string) => {
    setSubmissionForm((current) => ({ ...current, [key]: value }));
  };

  const handleResumeToggle = (resumeId: string) => {
    setForm((current) => ({
      ...current,
      selectedResumeIds: current.selectedResumeIds.includes(resumeId)
        ? current.selectedResumeIds.filter((id) => id !== resumeId)
        : [...current.selectedResumeIds, resumeId]
    }));
  };

  const saveOffer = (status: OfferStatus) => {
    setErrorMessage('');

    if (!form.jobId) {
      setErrorMessage('대상 입찰공고를 선택해주세요.');
      return;
    }

    saveMutation.mutate(status);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>, status: OfferStatus) => {
    event.preventDefault();
    saveOffer(status);
  };

  const handleSubmissionSubmit = () => {
    setErrorMessage('');
    submissionMutation.mutate();
  };

  const columns: DataTableColumn<Resume>[] = [
    {
      key: 'selected',
      header: '선택',
      render: (row) => (
        <input
          type="checkbox"
          checked={form.selectedResumeIds.includes(row.id)}
          onChange={() => handleResumeToggle(row.id)}
          onClick={(event) => event.stopPropagation()}
          className="h-4 w-4 accent-primary"
        />
      )
    },
    { key: 'name', header: '이름', render: (row) => <strong>{row.name}</strong> },
    { key: 'role', header: '역할', render: (row) => row.role || '-' },
    { key: 'availableFrom', header: '가용일', render: (row) => row.availableFrom || '-' },
    {
      key: 'skills',
      header: '보유 기술',
      render: (row) => (row.skills.length ? row.skills.slice(0, 3).join(', ') : '-')
    }
  ];

  return (
    <section>
      <form onSubmit={(event) => handleSubmit(event, 'draft')}>
        <PageTitle
          title={isEdit ? '제안서 상세/수정' : '제안서 생성'}
          description={isEdit ? '제출한 제안서의 상세 내용을 확인하고 필요한 내용을 수정합니다.' : '입찰공고의 RFP 요구사항을 기반으로 제안 인력, 단가, 투입 일정, 제출 상태를 작성합니다.'}
          actions={
            <>
              <Button type="submit" variant="secondary" icon={<Save className="h-4 w-4" />} disabled={saveMutation.isPending}>
                임시저장
              </Button>
              {isEdit ? (
                <Button type="button" icon={<Send className="h-4 w-4" />} disabled={saveMutation.isPending} onClick={() => setIsSubmissionFormOpen(true)}>
                  제출 완료 기록
                </Button>
              ) : null}
            </>
          }
        />

        {errorMessage ? <p className="mb-4 font-body text-[14px] text-error">{errorMessage}</p> : null}

        <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            <Card className="p-7">
              <div className="mb-6 flex items-center gap-3 border-b border-outline-variant pb-5">
                <FileText className="h-6 w-6 text-primary" />
                <h2 className="font-headline text-[26px] font-bold">대상 입찰공고</h2>
                {displayJob?.deadline ? <Badge tone="danger">마감 {displayJob.deadline}</Badge> : null}
              </div>
              <label className="block">
                <span className="mb-2 block font-label text-label-sm text-on-surface-variant">공고 선택</span>
                <select
                  className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body text-[16px] text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                  value={form.jobId}
                  onChange={(event) => updateField('jobId', event.target.value)}
                  required
                  disabled={isEdit}
                >
                  {isEdit && displayJob ? <option value={form.jobId}>{displayJob.title}</option> : <option value="">공고를 선택하세요</option>}
                  {shouldRenderSelectedJobOption && displayJob ? <option value={form.jobId}>{displayJob.title}</option> : null}
                  {jobsQuery.data?.items.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} / {job.agency}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <Info label="발주기관" value={displayJob?.agency || '-'} />
                <Info label="공고번호" value={displayJob?.noticeNumber || '-'} />
                <Info label="추정 예산" value={displayJob?.budget ? `${displayJob.budget.toLocaleString('ko-KR')}원` : '-'} />
                <Info label="제안 마감" value={displayJob?.deadline || '-'} />
              </div>
            </Card>

            <Card className="p-7">
              <div className="mb-6 flex items-center gap-3 border-b border-outline-variant pb-5">
                <Sparkles className="h-6 w-6 text-primary" />
                <h2 className="font-headline text-[26px] font-bold">제안 기본 정보</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Input label="제안명" value={form.proposalTitle} onChange={(event) => updateField('proposalTitle', event.target.value)} placeholder="재난 안전 관리 시스템 구축 제안" />
                <Input label="제안 담당자" value={form.proposalManagerName} onChange={(event) => updateField('proposalManagerName', event.target.value)} placeholder="김제안 팀장" />
                <Input label="제안 금액" value={form.proposalAmount} onChange={(event) => updateField('proposalAmount', event.target.value)} placeholder="8650000000" />
                <Input label="투입 예정일" type="date" value={form.expectedStartDate} onChange={(event) => updateField('expectedStartDate', event.target.value)} />
                <Input label="예상 수행 기간(개월)" type="number" min={0} value={form.expectedDurationMonths} onChange={(event) => updateField('expectedDurationMonths', event.target.value)} />
              </div>
              <textarea
                className="mt-5 min-h-40 w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-5 text-[16px] leading-7 outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim"
                value={form.strategyMemo}
                onChange={(event) => updateField('strategyMemo', event.target.value)}
                placeholder="RFP의 핵심 요구사항, 당사 강점, 리스크 대응 방안을 정리하세요."
              />
            </Card>

            <Card className="overflow-hidden">
              <div className="border-b border-outline-variant p-6">
                <h2 className="flex items-center gap-3 font-headline text-[26px] font-bold">
                  <Users className="h-6 w-6 text-primary" />
                  제안 인력 구성
                </h2>
              </div>
              <DataTable
                columns={columns}
                data={resumesQuery.data?.items ?? []}
                getRowKey={(row) => row.id}
                isLoading={resumesQuery.isLoading}
                onRowClick={(row) => handleResumeToggle(row.id)}
                emptyMessage="등록된 인력이 없습니다."
                tableClassName="min-w-[820px] w-full"
              />
            </Card>
          </div>

          <aside className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 font-headline text-[22px] font-bold">
                <Calendar className="h-5 w-5 text-primary" />
                제안 요약
              </h3>
              <ul className="space-y-3 text-sm leading-6 text-on-surface-variant">
                <li>대상 공고: {displayJob?.title || '-'}</li>
                <li>선택 인력: {selectedResumes.length}명</li>
                <li>예상 투입일: {form.expectedStartDate || '-'}</li>
              </ul>
            </Card>
            {isEdit ? (
              <Card className="p-6">
                <h3 className="mb-4 font-headline text-[22px] font-bold">제출 이력</h3>
                {latestSubmission ? (
                  <div className="mb-5 space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
                    <p><strong>제출일시</strong> {formatDateTime(latestSubmission.submittedAt)}</p>
                    <p><strong>제출 채널</strong> {channelLabels[latestSubmission.channel]}</p>
                    <p><strong>제출자</strong> {latestSubmission.submittedByName || '-'}</p>
                    <p><strong>접수번호</strong> {latestSubmission.receiptNo || '-'}</p>
                  </div>
                ) : (
                  <p className="mb-5 text-sm leading-6 text-on-surface-variant">아직 제출 완료 기록이 없습니다.</p>
                )}
                {isSubmissionFormOpen ? (
                  <div className="space-y-3">
                    <Input label="제출일시" type="datetime-local" value={submissionForm.submittedAt} onChange={(event) => updateSubmissionField('submittedAt', event.target.value)} />
                    <label className="block">
                      <span className="mb-2 block font-label text-label-sm text-on-surface-variant">제출 채널</span>
                      <select
                        className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body text-[16px] text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                        value={submissionForm.channel}
                        onChange={(event) => updateSubmissionField('channel', event.target.value)}
                      >
                        <option value="nara">나라장터</option>
                        <option value="email">이메일</option>
                        <option value="portal">발주처 포털</option>
                        <option value="visit">방문 제출</option>
                        <option value="other">기타</option>
                      </select>
                    </label>
                    <Input label="접수번호" value={submissionForm.receiptNo} onChange={(event) => updateSubmissionField('receiptNo', event.target.value)} placeholder="2026-제안-00123" />
                    <Input label="제출자" value={submissionForm.submittedByName} onChange={(event) => updateSubmissionField('submittedByName', event.target.value)} placeholder="김OO" />
                    <textarea
                      className="min-h-28 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body text-[15px] text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/25"
                      value={submissionForm.memo}
                      onChange={(event) => updateSubmissionField('memo', event.target.value)}
                      placeholder="나라장터 최종 제출 완료, 접수증 확인"
                    />
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="secondary" onClick={() => setIsSubmissionFormOpen(false)}>
                        취소
                      </Button>
                      <Button type="button" onClick={handleSubmissionSubmit} disabled={submissionMutation.isPending}>
                        제출완료로 기록
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button type="button" className="w-full" onClick={() => setIsSubmissionFormOpen(true)}>
                    제출 완료 기록
                  </Button>
                )}
              </Card>
            ) : null}
            <Card className="p-6">
              <h3 className="mb-4 font-headline text-[22px] font-bold">제출 체크리스트</h3>
              <ul className="space-y-3 text-sm leading-6 text-on-surface-variant">
                {['RFP 첨부파일 확인', '제안 인력 가용일 확인', '단가/예산 적합성 검토', '제출 마감 전 최종 검토'].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </aside>
        </div>
      </form>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-on-surface-variant">{label}</p>
      <p className="mt-2 font-headline text-[19px] font-bold text-on-surface">{value}</p>
    </div>
  );
}

function formatDateTime(value: string) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}
