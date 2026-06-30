import { useQueryClient } from '@tanstack/react-query';
import { Calendar, CheckCircle2, Download, FileText, Info, Paperclip, Pencil, Send, Sparkles, Star, Target, Trash2 } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/apiResponse';
import { deleteJob } from '../../../api/jobsApi';
import { EmptyState } from '../../../components/common/EmptyState';
import { LoadingState } from '../../../components/common/LoadingState';
import { PageTitle } from '../../../components/common/PageTitle';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';
import { getJobEditPath, getJobsPath, type RoleMode } from '../../modes/roleMode';
import type { JobDetail } from '../../../types/job';
import { useJobDetail } from '../hooks/useJobDetail';

type DetailTab = 'overview' | 'summary' | 'skills' | 'criteria' | 'schedule' | 'files';
type ProposalStatus = 'received' | 'reviewing' | 'revision' | 'preferred';

type ReceivedProposal = {
  id: string;
  supplier: string;
  people: string;
  proposedAmount: string;
  techScore: number;
  priceScore: number;
  status: ProposalStatus;
};

type RecommendedPerson = {
  id: string;
  name: string;
  role: string;
  currentProject: string;
  availableFrom: string;
  fitScore: number;
  reason: string;
};

const labels = {
  downloadRfp: 'RFP 다운로드',
  openScore: '평가표 열기',
  createProposal: '제안서 생성',
  overview: '기본 정보',
  summary: 'RFP 요약',
  skills: '요구 기술',
  criteria: '평가 기준',
  schedule: '제출 일정',
  files: '첨부파일',
  receivedCompare: '접수 제안 비교',
  recommendedPeople: '추천 인력',
  agencyCompareDesc: '공급기업별 제안 인력, 금액, 평가 점수와 보완 요청 상태를 비교합니다.',
  supplierDesc: '추천 인력을 기반으로 제안 초안을 준비합니다.',
  supplier: '공급기업',
  people: '제안 인력',
  amount: '제안 금액',
  techScore: '기술 평가',
  priceScore: '가격 평가',
  progress: '진행상태',
  name: '추천 인력',
  role: '역할',
  current: '현재 투입/상태',
  available: '가용일',
  fit: '적합도',
  reason: '추천 사유',
  point: '점',
  received: '접수',
  reviewing: '평가중',
  revision: '보완요청',
  preferred: '우선협상',
  reviewPanel: '제안 평가 현황',
  reviewPanelDesc: '접수 제안 중 평가와 보완 요청 상태를 확인합니다.',
  candidatePanel: '제안 준비',
  candidatePanelDesc: '추천 인력을 확인한 뒤 제안서 생성 화면으로 이동합니다.',
  requirement: '핵심 요구사항',
  proposalPoint: '제안 포인트'
};

const statusLabel: Record<ProposalStatus, string> = {
  received: labels.received,
  reviewing: labels.reviewing,
  revision: labels.revision,
  preferred: labels.preferred
};

const receivedProposals: ReceivedProposal[] = [
  { id: 'proposal-1', supplier: '테크브리지코리아', people: '김도윤, 이서연, 박지훈', proposedAmount: '8,650,000,000원', techScore: 92, priceScore: 84, status: 'reviewing' },
  { id: 'proposal-2', supplier: '넥스트소프트', people: '오지훈, 최민서 외 2명', proposedAmount: '8,420,000,000원', techScore: 86, priceScore: 88, status: 'received' },
  { id: 'proposal-3', supplier: '도시정보기술', people: '정하늘 외 3명', proposedAmount: '8,780,000,000원', techScore: 78, priceScore: 81, status: 'revision' },
  { id: 'proposal-4', supplier: '에이아이랩스', people: '강서준 외 4명', proposedAmount: '8,590,000,000원', techScore: 89, priceScore: 86, status: 'preferred' }
];

const recommendedPeople: RecommendedPerson[] = [
  { id: 'match-8f3a21', name: '김도윤', role: 'PM/아키텍트', currentProject: '전자조달 플랫폼 고도화', availableFrom: '2026-08-01', fitScore: 92, reason: 'MSA 전환과 공공 PM 경험 보유' },
  { id: 'match-42c9e7', name: '이서연', role: 'Frontend', currentProject: '전자조달 포털 개선', availableFrom: '2026-08-16', fitScore: 86, reason: '대시보드/포털 UX 구축 경험' },
  { id: 'match-a71d04', name: '박지훈', role: 'Backend', currentProject: '대기', availableFrom: '2026-07-01', fitScore: 81, reason: 'Spring Boot API 구축 경험' }
];

const tabs: { id: DetailTab; label: string; icon: typeof Info }[] = [
  { id: 'overview', label: labels.overview, icon: Info },
  { id: 'summary', label: labels.summary, icon: Sparkles },
  { id: 'skills', label: labels.skills, icon: Target },
  { id: 'criteria', label: labels.criteria, icon: Star },
  { id: 'schedule', label: labels.schedule, icon: Calendar },
  { id: 'files', label: labels.files, icon: Paperclip }
];

type JobDetailViewProps = {
  mode?: RoleMode;
};

export function JobDetailView({ mode }: JobDetailViewProps = {}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { jobId = '' } = useParams();
  const { data: job, isLoading, isError, error } = useJobDetail(jobId);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [role, setRole] = useState<RoleMode>(mode ?? 'agency');
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const isAgency = role === 'agency';

  useEffect(() => {
    if (mode) {
      setRole(mode);
      return;
    }

    const handleRoleChange = (event: Event) => {
      const nextRole = (event as CustomEvent<RoleMode>).detail;
      setRole(nextRole === 'supplier' ? 'supplier' : 'agency');
    };
    const handleStorage = () => setRole(window.localStorage.getItem('beryl-role-mode') === 'supplier' ? 'supplier' : 'agency');

    window.addEventListener('beryl-role-change', handleRoleChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('beryl-role-change', handleRoleChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [mode]);

  const proposalColumns: DataTableColumn<ReceivedProposal>[] = [
    { key: 'supplier', header: labels.supplier, sortable: true, render: (row) => <strong>{row.supplier}</strong> },
    { key: 'people', header: labels.people, sortable: true },
    { key: 'proposedAmount', header: labels.amount, align: 'right' },
    { key: 'techScore', header: labels.techScore, align: 'right', sortable: true, render: (row) => `${row.techScore}${labels.point}` },
    { key: 'priceScore', header: labels.priceScore, align: 'right', sortable: true, render: (row) => `${row.priceScore}${labels.point}` },
    {
      key: 'status',
      header: labels.progress,
      render: (row) => <Badge tone={row.status === 'revision' ? 'danger' : row.status === 'preferred' ? 'success' : 'info'}>{statusLabel[row.status]}</Badge>
    }
  ];

  const recommendedColumns: DataTableColumn<RecommendedPerson>[] = [
    { key: 'name', header: labels.name, sortable: true, render: (row) => <strong>{row.name}</strong> },
    { key: 'role', header: labels.role, sortable: true },
    { key: 'currentProject', header: labels.current, sortable: true },
    { key: 'availableFrom', header: labels.available, sortable: true },
    {
      key: 'fitScore',
      header: labels.fit,
      align: 'right',
      sortable: true,
      render: (row) => <span className="rounded bg-primary px-3 py-1 font-bold text-on-primary">{row.fitScore}{labels.point}</span>
    },
    { key: 'reason', header: labels.reason, cellClassName: 'whitespace-normal min-w-[320px]' }
  ];

  async function handleDelete() {
    if (!jobId || !window.confirm('공고를 삭제하시겠습니까?')) return;

    setDeleteErrorMessage('');
    setIsDeleting(true);

    try {
      await deleteJob(jobId);
      await queryClient.invalidateQueries({ queryKey: ['jobs'] });
      navigate(getJobsPath(role), { replace: true });
    } catch (deleteError) {
      setDeleteErrorMessage(getApiErrorMessage(deleteError, '공고 삭제 중 오류가 발생했습니다.'));
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) return <LoadingState />;

  if (isError || !job) {
    return (
      <EmptyState
        title="공고 정보를 불러오지 못했습니다"
        description={getApiErrorMessage(error, '공고가 삭제되었거나 접근 권한이 없을 수 있습니다.')}
      />
    );
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={job.status} />
        <Badge tone="danger">{job.deadline ? `마감 ${formatDate(job.deadline)}` : '마감일 미정'}</Badge>
        <span className="text-on-surface-variant">공고번호: {job.noticeNumber || '-'}</span>
      </div>

      <PageTitle
        title={job.title}
        actions={
          <>
            <Button variant="secondary" icon={<Download className="h-4 w-4" />}>{labels.downloadRfp}</Button>
            <Button icon={isAgency ? <Star className="h-4 w-4" /> : <Send className="h-4 w-4" />} onClick={() => !isAgency && navigate(`/proposals/new?jobId=${job.id}`)}>
              {isAgency ? labels.openScore : labels.createProposal}
            </Button>
            <Button variant="secondary" icon={<Pencil className="h-4 w-4" />} onClick={() => navigate(getJobEditPath(job.id))}>
              수정
            </Button>
            <Button
              variant="secondary"
              className="!border-error !text-error hover:!bg-error/5"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </>
        }
      />

      {deleteErrorMessage ? (
        <div className="mb-6 rounded-lg border border-error/30 bg-error-container px-5 py-4 font-semibold text-on-error-container">
          {deleteErrorMessage}
        </div>
      ) : null}

      <div className="mb-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <div className="flex gap-2 overflow-x-auto border-b border-outline-variant px-5 pt-5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={[
                    'flex h-12 shrink-0 items-center gap-2 border-b-4 px-4 font-label text-[15px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/25',
                    isActive ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  ].join(' ')}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="p-7 lg:p-9">
            <TabContent activeTab={activeTab} job={job} />
          </div>
        </Card>

        {isAgency ? <AgencyReviewPanel /> : <SupplierProposalPanel job={job} onCreateProposal={() => navigate(`/proposals/new?jobId=${job.id}`)} />}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-outline-variant p-8">
          <h2 className="font-headline text-[28px] font-bold">{isAgency ? labels.receivedCompare : labels.recommendedPeople}</h2>
          <p className="mt-2 text-on-surface-variant">{isAgency ? labels.agencyCompareDesc : labels.supplierDesc}</p>
        </div>
        {isAgency ? (
          <DataTable columns={proposalColumns} data={receivedProposals} getRowKey={(row) => row.id} tableClassName="min-w-[1040px] w-full" />
        ) : (
          <DataTable columns={recommendedColumns} data={recommendedPeople} getRowKey={(row) => row.id} onRowClick={(row) => navigate(`/offers/${row.id}/analysis`)} tableClassName="min-w-[1040px] w-full" />
        )}
      </Card>
    </section>
  );
}

function TabContent({ activeTab, job }: { activeTab: DetailTab; job: JobDetail }) {
  if (activeTab === 'overview') {
    return (
      <div>
        <SectionTitle icon={<Info className="h-6 w-6" />} title={labels.overview} />
        <dl className="grid gap-x-20 gap-y-10 md:grid-cols-2">
          <InfoBlock label="발주기관" value={job.agency || '-'} />
          <InfoBlock label="추정 예산" value={formatCurrency(job.budget)} strong />
          <InfoBlock label="수집 경로" value={formatSourceType(job.sourceType)} />
          <InfoBlock label="제안 마감일" value={formatDate(job.deadline)} danger />
          <InfoBlock label="필요 역량" value={job.category || '-'} />
          <InfoBlock label="공고 시작일" value={formatDate(job.publishedAt)} />
          <InfoBlock label="원문 공고 URL" value={job.sourceUrl || '-'} />
          <InfoBlock label="추천 인력" value={`${job.recommendedPeople}명`} />
        </dl>
      </div>
    );
  }

  if (activeTab === 'summary') {
    const summaryItems = job.description ? job.description.split('\n').filter(Boolean) : ['등록된 RFP 분석 기준이 없습니다.'];
    return <AnalysisGrid title={labels.summary} left={labels.requirement} right={labels.proposalPoint} leftItems={job.requirements.length ? job.requirements : ['필요 역량 미입력']} rightItems={summaryItems} />;
  }

  if (activeTab === 'skills') {
    const skills = job.category ? job.category.split(',').map((item) => item.trim()).filter(Boolean) : ['필요 기술 미입력'];
    return (
      <div>
        <SectionTitle icon={<Target className="h-6 w-6" />} title={labels.skills} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {skills.map((skill) => (
            <div key={skill} className="rounded-lg border border-outline-variant bg-surface-container-low p-5">
              <CheckCircle2 className="mb-3 h-5 w-5 text-primary" />
              <strong>{skill}</strong>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'criteria') {
    return (
      <div>
        <SectionTitle icon={<Star className="h-6 w-6" />} title={labels.criteria} />
        <div className="space-y-5">
          <Criteria label="기술 제안" value={40} />
          <Criteria label="수행 경험" value={25} />
          <Criteria label="인력 구성" value={20} />
          <Criteria label="가격/일정" value={15} />
        </div>
      </div>
    );
  }

  if (activeTab === 'schedule') {
    return (
      <div>
        <SectionTitle icon={<Calendar className="h-6 w-6" />} title={labels.schedule} />
        <div className="space-y-3 rounded border border-outline-variant bg-surface-container-low p-5">
          <Schedule label="공고 시작일" value={formatDate(job.publishedAt)} />
          <Schedule label="제안 마감" value={formatDate(job.deadline)} />
          <Schedule label="상태" value={job.status} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle icon={<Paperclip className="h-6 w-6" />} title={labels.files} />
      <div className="space-y-3">
        {['RFP 원문 파일은 업로드 API 연결 후 표시됩니다.'].map((file) => (
          <div key={file} className="flex items-center justify-between rounded-lg border border-outline-variant p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <span>{file}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgencyReviewPanel() {
  return (
    <Card className="p-6">
      <div className="mb-5 border-b border-outline-variant pb-5">
        <h2 className="font-headline text-[24px] font-bold">{labels.reviewPanel}</h2>
        <p className="mt-2 text-sm text-on-surface-variant">{labels.reviewPanelDesc}</p>
      </div>
      <div className="space-y-3">
        <StatusLine label="평가위원 배정" value="3/5명 완료" />
        <StatusLine label="기술평가 입력" value="2건 대기" />
        <StatusLine label="보완 요청" value="1건 진행" />
        <StatusLine label="우선협상 후보" value="1개사" />
      </div>
      <Button className="mt-5 w-full" icon={<Star className="h-4 w-4" />}>{labels.openScore}</Button>
    </Card>
  );
}

function SupplierProposalPanel({ job, onCreateProposal }: { job: JobDetail; onCreateProposal: () => void }) {
  const daysLeft = getDaysLeft(job.deadline);
  const urgencyLabel = daysLeft === null ? '마감일 미정' : daysLeft <= 3 ? `마감 ${daysLeft}일 전` : daysLeft <= 7 ? `마감 임박 D-${daysLeft}` : `D-${daysLeft}`;
  const fitLabel = job.rfpScore >= 85 ? '매우 적합' : job.rfpScore >= 70 ? '검토 적합' : '추가 검토';
  const skills = job.category
    ? job.category.split(',').map((item) => item.trim()).filter(Boolean).slice(0, 4)
    : [];

  return (
    <Card className="p-6">
      <div className="mb-5 border-b border-outline-variant pb-5">
        <h2 className="font-headline text-[24px] font-bold">AI 분석 정보</h2>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">RFP 요건과 보유 인력 정보를 기준으로 제안 준비 우선순위를 요약합니다.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <AnalysisMetric label="RFP 적합도" value={`${job.rfpScore}점`} emphasis />
        <AnalysisMetric label="판정" value={fitLabel} />
        <AnalysisMetric label="마감 긴급도" value={urgencyLabel} danger={daysLeft !== null && daysLeft <= 7} />
        <AnalysisMetric label="추천 인력" value={`${job.recommendedPeople}명`} />
      </div>
      <div className="mt-5 space-y-4">
        <AnalysisNote
          title="제안 포인트"
          items={[
            `${job.agency} 요구사항에 맞춰 ${skills[0] ?? '핵심 기술'} 경험을 전면에 배치`,
            `${formatCurrency(job.budget)} 예산 범위 안에서 단계별 투입 계획 제시`
          ]}
        />
        <AnalysisNote
          title="주의 사항"
          items={[
            daysLeft !== null && daysLeft <= 7 ? '마감이 가까워 산출물과 첨부파일 검토를 우선 처리' : '제출 전 요구 기술과 투입 가능일 재검증 필요',
            skills.length ? `필수 역량: ${skills.join(', ')}` : '필수 역량 정보가 부족해 RFP 원문 확인 필요'
          ]}
        />
      </div>
      <Button className="mt-5 w-full" icon={<Send className="h-4 w-4" />} onClick={onCreateProposal}>{labels.createProposal}</Button>
    </Card>
  );
}

function AnalysisMetric({ label, value, emphasis = false, danger = false }: { label: string; value: string; emphasis?: boolean; danger?: boolean }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
      <p className="text-xs font-semibold text-on-surface-variant">{label}</p>
      <p className={['mt-2 font-headline text-[20px] font-bold', emphasis ? 'text-primary' : '', danger ? 'text-error' : ''].join(' ')}>
        {value}
      </p>
    </div>
  );
}

function AnalysisNote({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-2 font-label text-[14px] font-bold text-on-surface">{title}</h3>
      <ul className="space-y-2 text-sm leading-6 text-on-surface-variant">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="mb-7 flex items-center gap-3 border-b border-outline-variant pb-5">
      <span className="text-primary">{icon}</span>
      <h2 className="font-headline text-[28px] font-bold text-on-surface">{title}</h2>
    </div>
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

function AnalysisGrid({ title, left, right, leftItems, rightItems }: { title: string; left: string; right: string; leftItems: string[]; rightItems: string[] }) {
  return (
    <div>
      <SectionTitle icon={<Sparkles className="h-6 w-6" />} title={title} />
      <div className="grid gap-5 lg:grid-cols-2">
        <AnalysisSection title={left} items={leftItems} />
        <AnalysisSection title={right} items={rightItems} />
      </div>
    </div>
  );
}

function AnalysisSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-low p-5">
      <h3 className="mb-4 font-label text-[16px] font-bold text-primary">{title}</h3>
      <ul className="space-y-3 text-[16px] leading-7 text-on-surface">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

function Criteria({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <strong>{label}</strong>
        <span className="text-primary">{value}%</span>
      </div>
      <div className="h-3 rounded-full bg-surface-container">
        <div className="h-3 rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Schedule({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[16px]">
      <span>{label}</span>
      <strong className="text-right">{value}</strong>
    </div>
  );
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-4">
      <span>{label}</span>
      <strong className="text-primary">{value}</strong>
    </div>
  );
}

function formatCurrency(value: number) {
  if (!value) return '-';

  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0
  }).format(value);
}

function formatDate(value: string) {
  if (!value) return '-';

  return value.slice(0, 10);
}

function getDaysLeft(value: string) {
  if (!value) return null;

  const deadline = new Date(value);
  if (Number.isNaN(deadline.getTime())) return null;

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startOfDeadline = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate()).getTime();

  return Math.ceil((startOfDeadline - startOfToday) / 86400000);
}

function formatSourceType(value: string | undefined) {
  const labelMap: Record<string, string> = {
    nara: '나라장터 API',
    nipa: 'NIPA',
    nia: 'NIA',
    private_bid: '민간 입찰',
    manual: '수동 등록',
    email: '이메일',
    other: '기타'
  };

  return value ? labelMap[value] ?? value : '-';
}
