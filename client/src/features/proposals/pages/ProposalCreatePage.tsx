import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, FileText, History, MessageSquarePlus, Save, Send, Sparkles, Users } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/apiResponse';
import { getCompanyMemberAssignees } from '../../../api/companyMembersApi';
import { getJobDetail, getJobs } from '../../../api/jobsApi';
import { createOffer, getOffer, recordOfferSubmission, updateOffer } from '../../../api/offersApi';
import { getResumes } from '../../../api/resumesApi';
import { PageTitle } from '../../../components/common/PageTitle';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import type { OfferStatus, SubmissionChannel } from '../../../types/offer';
import type { Resume } from '../../../types/resume';
import { useAuth } from '../../auth/AuthContext';

type FormState = {
  jobId: string;
  proposalTitle: string;
  proposalManagerName: string;
  proposalAmount: string;
  expectedStartDate: string;
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

type ReviewHistoryStatus = 'reviewRequested' | 'revisionRequested' | 'resolved' | 'approved';

type ReviewHistoryItem = {
  id: string;
  createdAt: string;
  authorName: string;
  roleLabel: string;
  assigneeMemberId: string;
  assigneeName: string;
  status: ReviewHistoryStatus;
  body: string;
};

type ReviewHistoryFormState = {
  authorName: string;
  roleLabel: string;
  assigneeMemberId: string;
  status: ReviewHistoryStatus;
  body: string;
};

type ProposalDisplayJob = {
  id: string;
  title: string;
  agency: string;
  noticeNumber?: string;
  category?: string;
  budget?: number;
  deadline?: string;
  requirements?: string[];
};

const initialForm: FormState = {
  jobId: '',
  proposalTitle: '',
  proposalManagerName: '',
  proposalAmount: '',
  expectedStartDate: '',
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

const availabilityLabels: Record<Resume['availabilityStatus'], string> = {
  available: '가용',
  partiallyAssigned: '부분 투입',
  assigned: '투입 중',
  unavailable: '불가'
};

const availabilityTones: Record<Resume['availabilityStatus'], 'success' | 'info' | 'neutral' | 'danger'> = {
  available: 'success',
  partiallyAssigned: 'info',
  assigned: 'neutral',
  unavailable: 'danger'
};

const offerStatusLabels: Record<OfferStatus, string> = {
  draft: '임시저장',
  submitted: '제출완료',
  awarded: '선정',
  rejected: '미선정'
};

const offerStatusTones: Record<OfferStatus, 'success' | 'info' | 'neutral' | 'danger'> = {
  draft: 'neutral',
  submitted: 'info',
  awarded: 'success',
  rejected: 'danger'
};

const checklistItems = ['RFP 원문 별도 확인', '제안 인력 가용일 확인', '제안 금액 확인', '제출 마감 전 최종 검토'];

const reviewStatusLabels: Record<ReviewHistoryStatus, string> = {
  reviewRequested: '검토 요청',
  revisionRequested: '보완 요청',
  resolved: '반영 완료',
  approved: '최종 확인'
};

const reviewStatusTones: Record<ReviewHistoryStatus, 'success' | 'info' | 'neutral' | 'danger'> = {
  reviewRequested: 'info',
  revisionRequested: 'danger',
  resolved: 'neutral',
  approved: 'success'
};

function getNowInputValue() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

export function ProposalCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useAuth();
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
  const [isReviewHistoryFormOpen, setIsReviewHistoryFormOpen] = useState(false);
  const [reviewHistory, setReviewHistory] = useState<ReviewHistoryItem[]>([]);
  const [reviewHistoryForm, setReviewHistoryForm] = useState<ReviewHistoryFormState>({
    authorName: '',
    roleLabel: '실무자',
    assigneeMemberId: '',
    status: 'reviewRequested',
    body: ''
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
  const companyMembersQuery = useQuery({
    queryKey: ['company-member-assignees', { usage: 'proposal-review' }],
    queryFn: getCompanyMemberAssignees
  });
  const selectedJob = useMemo(() => jobsQuery.data?.items.find((job) => job.id === form.jobId), [form.jobId, jobsQuery.data?.items]);
  const currentUserName = session?.member?.name || session?.user.name || '';
  const latestSubmission = offerQuery.data?.latestSubmission ?? null;
  const offerStatus = offerQuery.data?.status ?? 'draft';
  const displayedSubmission = latestSubmission ?? (offerQuery.data?.status === 'submitted' && offerQuery.data.submittedAt ? {
    id: `${offerQuery.data.id}-submitted`,
    offerId: offerQuery.data.id,
    submittedAt: offerQuery.data.submittedAt,
    channel: 'other' as SubmissionChannel,
    receiptNo: '',
    submittedByMemberId: '',
    submittedByName: offerQuery.data.proposalManagerName,
    memo: '제출 완료 상태로 등록된 제안입니다.'
  } : null);
  const submissionHistory = offerQuery.data?.submissions ?? [];
  const displayJob: ProposalDisplayJob | null = selectedJob ?? selectedJobQuery.data ?? (offerQuery.data ? {
    id: offerQuery.data.jobId,
    title: offerQuery.data.jobTitle,
    agency: offerQuery.data.buyerName,
    noticeNumber: '',
    budget: 0,
    deadline: ''
  } : null);
  const shouldRenderSelectedJobOption = Boolean(!isEdit && displayJob && form.jobId && !jobsQuery.data?.items.some((job) => job.id === form.jobId));
  const selectedResumes = resumesQuery.data?.items.filter((resume) => form.selectedResumeIds.includes(resume.id)) ?? [];
  const companyMembers = companyMembersQuery.data?.items ?? [];
  const reviewHistoryStorageKey = offerId ? `beryl-offer-review-history:${offerId}` : '';

  useEffect(() => {
    if (!offerQuery.data) return;

    setForm({
      jobId: offerQuery.data.jobId,
      proposalTitle: offerQuery.data.proposalTitle,
      proposalManagerName: offerQuery.data.proposalManagerName,
      proposalAmount: offerQuery.data.proposalAmount ? String(offerQuery.data.proposalAmount) : '',
      expectedStartDate: offerQuery.data.expectedStartDate,
      strategyMemo: offerQuery.data.strategyMemo,
      selectedResumeIds: offerQuery.data.matches.map((match) => match.resumeId)
    });
  }, [offerQuery.data]);

  useEffect(() => {
    if (!isSubmissionFormOpen || !currentUserName) return;

    setSubmissionForm((current) => (
      current.submittedByName ? current : { ...current, submittedByName: currentUserName }
    ));
  }, [currentUserName, isSubmissionFormOpen]);

  useEffect(() => {
    if (!reviewHistoryStorageKey) {
      setReviewHistory([]);
      return;
    }

    try {
      const saved = window.localStorage.getItem(reviewHistoryStorageKey);
      const parsed = saved ? JSON.parse(saved) as Partial<ReviewHistoryItem>[] : [];
      setReviewHistory(parsed.map((item) => ({
        id: item.id ?? `review-${Date.now()}`,
        createdAt: item.createdAt ?? new Date().toISOString(),
        authorName: item.authorName ?? '-',
        roleLabel: item.roleLabel ?? '검토자',
        assigneeMemberId: item.assigneeMemberId ?? '',
        assigneeName: item.assigneeName ?? '',
        status: item.status ?? 'reviewRequested',
        body: item.body ?? ''
      })));
    } catch {
      setReviewHistory([]);
    }
  }, [reviewHistoryStorageKey]);

  useEffect(() => {
    if (!isReviewHistoryFormOpen || !currentUserName) return;

    setReviewHistoryForm((current) => (
      current.authorName ? current : { ...current, authorName: currentUserName }
    ));
  }, [currentUserName, isReviewHistoryFormOpen]);

  const saveMutation = useMutation({
    mutationFn: (status: OfferStatus) =>
      offerId ? updateOffer(offerId, {
        status,
        proposalTitle: form.proposalTitle,
        proposalManagerName: form.proposalManagerName,
        proposalAmount: form.proposalAmount,
        expectedStartDate: form.expectedStartDate,
        strategyMemo: form.strategyMemo,
        resumeIds: form.selectedResumeIds
      }) : createOffer({
        jobId: form.jobId,
        status,
        proposalTitle: form.proposalTitle,
        proposalManagerName: form.proposalManagerName,
        proposalAmount: form.proposalAmount,
        expectedStartDate: form.expectedStartDate,
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

  const updateReviewHistoryField = (key: keyof ReviewHistoryFormState, value: string) => {
    setReviewHistoryForm((current) => ({ ...current, [key]: value }));
  };

  const persistReviewHistory = (items: ReviewHistoryItem[]) => {
    setReviewHistory(items);
    if (reviewHistoryStorageKey) {
      window.localStorage.setItem(reviewHistoryStorageKey, JSON.stringify(items));
    }
  };

  const handleReviewHistorySubmit = () => {
    const body = reviewHistoryForm.body.trim();
    const assignee = companyMembers.find((member) => member.id === reviewHistoryForm.assigneeMemberId);

    if (!body) {
      setErrorMessage('검토/보완 내용을 입력해주세요.');
      return;
    }

    setErrorMessage('');
    persistReviewHistory([
      {
        id: `review-${Date.now()}`,
        createdAt: new Date().toISOString(),
        authorName: reviewHistoryForm.authorName.trim() || currentUserName || '-',
        roleLabel: reviewHistoryForm.roleLabel.trim() || '검토자',
        assigneeMemberId: assignee?.id ?? '',
        assigneeName: assignee?.name ?? '',
        status: reviewHistoryForm.status,
        body
      },
      ...reviewHistory
    ]);
    setReviewHistoryForm({
      authorName: currentUserName,
      roleLabel: '실무자',
      assigneeMemberId: '',
      status: 'reviewRequested',
      body: ''
    });
    setIsReviewHistoryFormOpen(false);
  };

  const updateReviewHistoryStatus = (reviewId: string, status: ReviewHistoryStatus) => {
    persistReviewHistory(reviewHistory.map((item) => (
      item.id === reviewId ? { ...item, status } : item
    )));
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
    { key: 'careerYears', header: '경력', render: (row) => `${row.careerYears}년` },
    { key: 'availableFrom', header: '가용일', render: (row) => row.availableFrom || '-' },
    {
      key: 'skills',
      header: '보유 기술',
      render: (row) => (row.skills.length ? row.skills.slice(0, 3).join(', ') : '-')
    },
    {
      key: 'availabilityStatus',
      header: '상태',
      render: (row) => <Badge tone={availabilityTones[row.availabilityStatus]}>{availabilityLabels[row.availabilityStatus]}</Badge>
    },
    {
      key: 'currentProject',
      header: '현재 투입',
      render: (row) => row.currentProject ? `${row.currentProject} / ${row.currentManMonths}M` : '-'
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

        <div className="space-y-8">
          <Card className="p-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant pb-5">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <h2 className="font-headline text-[26px] font-bold">공고/상태</h2>
                {displayJob?.deadline ? <Badge tone="danger">마감 {displayJob.deadline}</Badge> : null}
              </div>
              <Button type="button" variant="secondary" icon={<Download className="h-4 w-4" />} disabled={!displayJob} className="h-10 px-3 text-[13px]">
                RFP 원문 다운로드
              </Button>
            </div>
            <div className="grid gap-5 xl:grid-cols-[minmax(360px,0.8fr)_minmax(0,1.2fr)]">
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
              <div className="grid grid-cols-[1.25fr_1.45fr_1.1fr_1fr] gap-5">
                <Info label="발주기관" value={displayJob?.agency || '-'} />
                <Info label="공고번호" value={displayJob?.noticeNumber || '-'} />
                <Info label="추정 예산" value={displayJob?.budget ? `${displayJob.budget.toLocaleString('ko-KR')}원` : '-'} />
                <Info label="최근 제출일" value={formatDateTime(displayedSubmission?.submittedAt ?? '')} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 font-headline text-[22px] font-bold">제출 관리</h2>
            <div className="grid gap-3 text-sm leading-6 text-on-surface-variant md:grid-cols-2 xl:grid-cols-4">
              <StatusRow label="현재 상태" value={offerStatusLabels[offerStatus]} />
              <StatusRow label="제안 금액" value={form.proposalAmount ? `${Number(form.proposalAmount).toLocaleString('ko-KR')}원` : '-'} />
              <StatusRow label="담당자" value={form.proposalManagerName || '-'} />
              <StatusRow label="접수번호" value={displayedSubmission?.receiptNo || '-'} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-headline text-[22px] font-bold">제출 전 체크리스트</h2>
              {isEdit ? <Badge tone={offerStatusTones[offerStatus]}>{offerStatusLabels[offerStatus]}</Badge> : null}
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {checklistItems.map((item) => (
                <div key={item} className="flex min-h-14 items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-8">
              <Card className="overflow-hidden">
                <div className="border-b border-outline-variant p-6">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <h2 className="flex items-center gap-3 font-headline text-[26px] font-bold">
                      <Users className="h-6 w-6 text-primary" />
                      제안 인력 구성
                    </h2>
                    <p className="text-sm font-semibold text-on-surface-variant">
                      선택 {selectedResumes.length}명
                    </p>
                  </div>
                </div>
                <DataTable
                  columns={columns}
                  data={resumesQuery.data?.items ?? []}
                  getRowKey={(row) => row.id}
                  isLoading={resumesQuery.isLoading}
                  onRowClick={(row) => handleResumeToggle(row.id)}
                  emptyMessage="등록된 인력이 없습니다."
                  tableClassName="min-w-[1120px] w-full"
                />
              </Card>

              <Card className="p-7">
                <div className="mb-6 flex items-center gap-3 border-b border-outline-variant pb-5">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <h2 className="font-headline text-[26px] font-bold">제안 기본 정보</h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                  <Input label="제안명" value={form.proposalTitle} onChange={(event) => updateField('proposalTitle', event.target.value)} placeholder="재난 안전 관리 시스템 구축 제안" />
                  <Input label="제안 담당자" value={form.proposalManagerName} onChange={(event) => updateField('proposalManagerName', event.target.value)} placeholder="김제안 팀장" />
                  <Input label="제안 금액" value={form.proposalAmount} onChange={(event) => updateField('proposalAmount', event.target.value)} placeholder="8650000000" />
                  <Input label="투입 예정일" type="date" value={form.expectedStartDate} onChange={(event) => updateField('expectedStartDate', event.target.value)} />
                </div>
              </Card>
            </div>

            <aside className="space-y-6">
            {isEdit ? (
              <>
              <Card className="p-6">
                <h3 className="mb-4 flex items-center gap-2 font-headline text-[22px] font-bold">
                  <History className="h-5 w-5 text-primary" />
                  제출 이력
                </h3>
                {displayedSubmission ? (
                  <div className="mb-5 space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
                    <p><strong>제출일시</strong> {formatDateTime(displayedSubmission.submittedAt)}</p>
                    <p><strong>제출 채널</strong> {channelLabels[displayedSubmission.channel]}</p>
                    <p><strong>제출자</strong> {displayedSubmission.submittedByName || '-'}</p>
                    <p><strong>접수번호</strong> {displayedSubmission.receiptNo || '-'}</p>
                  </div>
                ) : (
                  <p className="mb-5 text-sm leading-6 text-on-surface-variant">아직 제출 완료 기록이 없습니다.</p>
                )}
                {submissionHistory.length > 1 ? (
                  <div className="mb-5 space-y-2">
                    {submissionHistory.slice(1).map((submission) => (
                      <div key={submission.id} className="rounded-lg border border-outline-variant bg-surface-container-low p-3 text-sm">
                        <strong>{formatDateTime(submission.submittedAt)}</strong>
                        <p className="mt-1 text-on-surface-variant">{channelLabels[submission.channel]} / {submission.receiptNo || '접수번호 없음'}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
            </Card>
              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="font-headline text-[22px] font-bold">검토/보완 이력</h3>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-10 px-3 text-[13px]"
                    icon={<MessageSquarePlus className="h-4 w-4" />}
                    onClick={() => setIsReviewHistoryFormOpen(true)}
                  >
                    메모 추가
                  </Button>
                </div>
                {reviewHistory.length ? (
                  <div className="space-y-3">
                    {reviewHistory.map((item) => (
                      <div key={item.id} className="rounded-lg border border-outline-variant bg-surface-container-low p-4 text-sm leading-6">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <strong>{item.authorName}</strong>
                            <span className="ml-2 text-on-surface-variant">{item.roleLabel}</span>
                          </div>
                          <Badge tone={reviewStatusTones[item.status]}>{reviewStatusLabels[item.status]}</Badge>
                        </div>
                        <p className="whitespace-pre-line text-on-surface-variant">{item.body}</p>
                        {item.assigneeName ? (
                          <p className="mt-2 text-xs font-semibold text-primary">요청 대상자: {item.assigneeName}</p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs text-on-surface-variant">{formatDateTime(item.createdAt)}</span>
                          <div className="flex gap-2">
                            {item.status === 'revisionRequested' ? (
                              <Button type="button" variant="secondary" className="h-8 px-2 text-xs" onClick={() => updateReviewHistoryStatus(item.id, 'resolved')}>
                                반영 완료
                              </Button>
                            ) : null}
                            {item.status === 'resolved' ? (
                              <Button type="button" variant="secondary" className="h-8 px-2 text-xs" onClick={() => updateReviewHistoryStatus(item.id, 'approved')}>
                                최종 확인
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-4 text-sm leading-6 text-on-surface-variant">
                    등록된 검토/보완 이력이 없습니다.
                  </div>
                )}
              </Card>
              </>
            ) : null}
          </aside>
          </div>
        </div>
      </form>

      <Modal
        open={isSubmissionFormOpen}
        title="제출 완료 기록"
        onClose={() => setIsSubmissionFormOpen(false)}
        footer={
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsSubmissionFormOpen(false)}>
              취소
            </Button>
            <Button type="button" onClick={handleSubmissionSubmit} disabled={submissionMutation.isPending}>
              제출완료로 기록
            </Button>
          </div>
        }
      >
        <div className="space-y-4 pb-6">
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
        </div>
      </Modal>

      <Modal
        open={isReviewHistoryFormOpen}
        title="검토/보완 메모 추가"
        onClose={() => setIsReviewHistoryFormOpen(false)}
        footer={
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsReviewHistoryFormOpen(false)}>
              취소
            </Button>
            <Button type="button" onClick={handleReviewHistorySubmit}>
              이력 추가
            </Button>
          </div>
        }
      >
        <div className="space-y-4 pb-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="작성자" value={reviewHistoryForm.authorName} onChange={(event) => updateReviewHistoryField('authorName', event.target.value)} placeholder="이름" />
            <Input label="역할" value={reviewHistoryForm.roleLabel} onChange={(event) => updateReviewHistoryField('roleLabel', event.target.value)} placeholder="실무자 / 상급자 / 검토자" />
          </div>
          <label className="block">
            <span className="mb-2 block font-label text-label-sm text-on-surface-variant">요청 대상자</span>
            <select
              className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body text-[16px] text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
              value={reviewHistoryForm.assigneeMemberId}
              onChange={(event) => updateReviewHistoryField('assigneeMemberId', event.target.value)}
            >
              <option value="">지정 안 함</option>
              {companyMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}{member.position ? ` / ${member.position}` : ''}{member.department ? ` / ${member.department}` : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block font-label text-label-sm text-on-surface-variant">상태</span>
            <select
              className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body text-[16px] text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
              value={reviewHistoryForm.status}
              onChange={(event) => updateReviewHistoryField('status', event.target.value)}
            >
              <option value="reviewRequested">검토 요청</option>
              <option value="revisionRequested">보완 요청</option>
              <option value="resolved">반영 완료</option>
              <option value="approved">최종 확인</option>
            </select>
          </label>
          <textarea
            className="min-h-36 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body text-[15px] text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/25"
            value={reviewHistoryForm.body}
            onChange={(event) => updateReviewHistoryField('body', event.target.value)}
            placeholder="예: 가격 산출 근거를 상세화하고, 투입 인력 역할별 책임 범위를 보완해주세요."
          />
        </div>
      </Modal>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-on-surface-variant">{label}</p>
      <p className="mt-2 truncate whitespace-nowrap break-keep font-headline text-[clamp(12px,0.95vw,19px)] font-bold leading-7 text-on-surface" title={value}>{value}</p>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-surface-container-low px-4 py-3">
      <span>{label}</span>
      <strong className="text-right text-on-surface">{value}</strong>
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
