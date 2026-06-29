import { Calendar, CheckCircle2, Download, FileText, Info, Paperclip, Send, Sparkles, Star, Target } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTitle } from '../../../components/common/PageTitle';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type RoleMode = 'agency' | 'supplier';
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

const ko = {
  title: '\uCC28\uC138\uB300 \uD1B5\uD569 \uC7AC\uB09C \uC548\uC804 \uAD00\uB9AC \uC2DC\uC2A4\uD15C \uAD6C\uCD95',
  statusOpen: '\uACF5\uACE0\uC911',
  noticeNo: '\uACF5\uACE0\uBC88\uD638: 20261012345-00',
  downloadRfp: 'RFP \uB2E4\uC6B4\uB85C\uB4DC',
  openScore: '\uD3C9\uAC00\uD45C \uC5F4\uAE30',
  createProposal: '\uC81C\uC548\uC11C \uC0DD\uC131',
  overview: '\uAE30\uBCF8 \uC815\uBCF4',
  summary: 'RFP \uC694\uC57D',
  skills: '\uC694\uAD6C \uAE30\uC220',
  criteria: '\uD3C9\uAC00 \uAE30\uC900',
  schedule: '\uC81C\uCD9C \uC77C\uC815',
  files: '\uCCA8\uBD80\uD30C\uC77C',
  agency: '\uBC1C\uC8FC\uAE30\uAD00',
  agencyValue: '\uC18C\uBC29\uCCAD',
  budget: '\uCD94\uC815 \uC608\uC0B0',
  dept: '\uB2F4\uB2F9 \uBD80\uC11C',
  deptValue: '\uB514\uC9C0\uD138\uC7AC\uB09C\uB300\uC751\uACFC',
  deadline: '\uC81C\uC548 \uB9C8\uAC10\uC77C\uC2DC',
  roles: '\uD544\uC694 \uC5ED\uD560',
  period: '\uC608\uC0C1 \uC218\uD589 \uAE30\uAC04',
  receivedCompare: '\uC811\uC218 \uC81C\uC548 \uBE44\uAD50',
  recommendedPeople: '\uCD94\uCC9C \uC778\uB825',
  agencyCompareDesc: '\uACF5\uAE09\uAE30\uC5C5\uBCC4 \uC81C\uC548 \uC778\uB825, \uAE08\uC561, \uD3C9\uAC00 \uC810\uC218\uC640 \uBCF4\uC644 \uC694\uCCAD \uC0C1\uD0DC\uB97C \uBE44\uAD50\uD569\uB2C8\uB2E4.',
  supplierDesc: '\uC81C\uC548\uC11C \uC0DD\uC131 \uD654\uBA74\uC5D0\uC11C \uCD94\uCC9C \uC778\uB825\uC744 \uAE30\uBC18\uC73C\uB85C \uC81C\uC548 \uCD08\uC548\uC744 \uC791\uC131\uD569\uB2C8\uB2E4.',
  supplier: '\uACF5\uAE09\uAE30\uC5C5',
  people: '\uC81C\uC548 \uC778\uB825',
  amount: '\uC81C\uC548 \uAE08\uC561',
  techScore: '\uAE30\uC220 \uD3C9\uAC00',
  priceScore: '\uAC00\uACA9 \uD3C9\uAC00',
  progress: '\uC9C4\uD589\uC0C1\uD0DC',
  name: '\uCD94\uCC9C \uC778\uB825',
  role: '\uC5ED\uD560',
  current: '\uD604\uC7AC \uD22C\uC785/\uC0C1\uD0DC',
  available: '\uAC00\uC6A9\uC77C',
  fit: '\uC801\uD569\uB3C4',
  reason: '\uCD94\uCC9C \uC0AC\uC720',
  point: '\uC810',
  received: '\uC811\uC218',
  reviewing: '\uD3C9\uAC00\uC911',
  revision: '\uBCF4\uC644\uC694\uCCAD',
  preferred: '\uC6B0\uC120\uD611\uC0C1',
  reviewPanel: '\uC81C\uC548 \uD3C9\uAC00 \uD604\uD669',
  reviewPanelDesc: '\uC811\uC218 \uC81C\uC548 4\uAC74 \uC911 2\uAC74 \uD3C9\uAC00 \uB300\uAE30',
  candidatePanel: '\uC81C\uC548 \uC900\uBE44',
  candidatePanelDesc: '\uCD94\uCC9C \uC778\uB825\uC744 \uD655\uC778\uD55C \uB4A4 \uC81C\uC548\uC11C \uC0DD\uC131 \uD654\uBA74\uC73C\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4.',
  requirement: '\uD575\uC2EC \uC694\uAD6C\uC0AC\uD56D',
  proposalPoint: '\uC81C\uC548 \uD3EC\uC778\uD2B8',
  q1: 'Cloud-native \uC544\uD0A4\uD14D\uCC98 \uC804\uD658',
  q2: 'MSA \uAD6C\uD604 \uBC0F \uC11C\uBE44\uC2A4 \uBD84\uB9AC',
  q3: '\uB300\uC6A9\uB7C9 \uD2B8\uB79C\uC7AD\uC158 \uCC98\uB9AC \uCD5C\uC801\uD654',
  p1: '\uACF5\uACF5 \uC720\uC0AC \uC0AC\uC5C5 \uC218\uD589 \uACBD\uD5D8',
  p2: '\uC0C1\uC8FC PM \uBC0F \uD575\uC2EC \uC778\uB825 \uAC00\uC6A9\uC131',
  p3: '\uBCF4\uC548 \uC900\uC218\uC640 \uC0B0\uCD9C\uBB3C \uAD00\uB9AC \uCCB4\uACC4'
};

const statusLabel: Record<ProposalStatus, string> = {
  received: ko.received,
  reviewing: ko.reviewing,
  revision: ko.revision,
  preferred: ko.preferred
};

const receivedProposals: ReceivedProposal[] = [
  { id: 'proposal-1', supplier: '\uD14C\uD06C\uBE0C\uB9AC\uC9C0\uCF54\uB9AC\uC544', people: '\uAE40\uB3C4\uC724, \uC774\uC11C\uC5F0, \uBC15\uC9C0\uD6C8', proposedAmount: '8,650,000,000\uC6D0', techScore: 92, priceScore: 84, status: 'reviewing' },
  { id: 'proposal-2', supplier: '\uB125\uC2A4\uD2B8\uC18C\uD504\uD2B8', people: '\uC624\uC9C0\uD6C8, \uCD5C\uBBFC\uC11C \uC678 2\uBA85', proposedAmount: '8,420,000,000\uC6D0', techScore: 86, priceScore: 88, status: 'received' },
  { id: 'proposal-3', supplier: '\uB3C4\uC2DC\uC815\uBCF4\uAE30\uC220', people: '\uC815\uD558\uB298 \uC678 3\uBA85', proposedAmount: '8,780,000,000\uC6D0', techScore: 78, priceScore: 81, status: 'revision' },
  { id: 'proposal-4', supplier: '\uC5D0\uC774\uC544\uC774\uB7A9\uC2A4', people: '\uAC15\uC11C\uC900 \uC678 4\uBA85', proposedAmount: '8,590,000,000\uC6D0', techScore: 89, priceScore: 86, status: 'preferred' }
];

const recommendedPeople: RecommendedPerson[] = [
  { id: 'match-8f3a21', name: '\uAE40\uB3C4\uC724', role: 'PM/\uC544\uD0A4\uD14D\uD2B8', currentProject: '\uC804\uC790\uC870\uB2EC \uD50C\uB7AB\uD3FC \uACE0\uB3C4\uD654', availableFrom: '2026-08-01', fitScore: 92, reason: 'MSA \uC804\uD658\uACFC \uACF5\uACF5 PM \uACBD\uD5D8 \uBCF4\uC720' },
  { id: 'match-42c9e7', name: '\uC774\uC11C\uC5F0', role: 'Frontend', currentProject: '\uC804\uC790\uC870\uB2EC \uD3EC\uD138 \uAC1C\uC120', availableFrom: '2026-08-16', fitScore: 86, reason: '\uB300\uC2DC\uBCF4\uB4DC/\uD3EC\uD138 UX \uAD6C\uCD95 \uACBD\uD5D8' },
  { id: 'match-a71d04', name: '\uBC15\uC9C0\uD6C8', role: 'Backend', currentProject: '\uB300\uAE30', availableFrom: '2026-07-01', fitScore: 81, reason: 'Spring Boot API \uAD6C\uCD95 \uACBD\uD5D8' }
];

const tabs: { id: DetailTab; label: string; icon: typeof Info }[] = [
  { id: 'overview', label: ko.overview, icon: Info },
  { id: 'summary', label: ko.summary, icon: Sparkles },
  { id: 'skills', label: ko.skills, icon: Target },
  { id: 'criteria', label: ko.criteria, icon: Star },
  { id: 'schedule', label: ko.schedule, icon: Calendar },
  { id: 'files', label: ko.files, icon: Paperclip }
];

function getInitialRole(): RoleMode {
  if (typeof window === 'undefined') return 'agency';
  return window.localStorage.getItem('beryl-role-mode') === 'supplier' ? 'supplier' : 'agency';
}

export function JobDetailPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [role, setRole] = useState<RoleMode>(getInitialRole);
  const isAgency = role === 'agency';

  useEffect(() => {
    const handleRoleChange = (event: Event) => {
      const nextRole = (event as CustomEvent<RoleMode>).detail;
      setRole(nextRole === 'supplier' ? 'supplier' : 'agency');
    };
    const handleStorage = () => setRole(getInitialRole());

    window.addEventListener('beryl-role-change', handleRoleChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('beryl-role-change', handleRoleChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const proposalColumns: DataTableColumn<ReceivedProposal>[] = [
    { key: 'supplier', header: ko.supplier, sortable: true, render: (row) => <strong>{row.supplier}</strong> },
    { key: 'people', header: ko.people, sortable: true },
    { key: 'proposedAmount', header: ko.amount, align: 'right' },
    { key: 'techScore', header: ko.techScore, align: 'right', sortable: true, render: (row) => `${row.techScore}${ko.point}` },
    { key: 'priceScore', header: ko.priceScore, align: 'right', sortable: true, render: (row) => `${row.priceScore}${ko.point}` },
    { key: 'status', header: ko.progress, render: (row) => <Badge tone={row.status === 'revision' ? 'danger' : row.status === 'preferred' ? 'success' : 'info'}>{statusLabel[row.status]}</Badge> }
  ];

  const recommendedColumns: DataTableColumn<RecommendedPerson>[] = [
    { key: 'name', header: ko.name, sortable: true, render: (row) => <strong>{row.name}</strong> },
    { key: 'role', header: ko.role, sortable: true },
    { key: 'currentProject', header: ko.current, sortable: true },
    { key: 'availableFrom', header: ko.available, sortable: true },
    { key: 'fitScore', header: ko.fit, align: 'right', sortable: true, render: (row) => <span className="rounded bg-primary px-3 py-1 font-bold text-on-primary">{row.fitScore}{ko.point}</span> },
    { key: 'reason', header: ko.reason, cellClassName: 'whitespace-normal min-w-[320px]' }
  ];

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge tone="success">{ko.statusOpen}</Badge>
        <Badge tone="danger">D-4</Badge>
        <span className="text-on-surface-variant">{ko.noticeNo}</span>
      </div>

      <PageTitle
        title={ko.title}
        actions={
          <>
            <Button variant="secondary" icon={<Download className="h-4 w-4" />}>{ko.downloadRfp}</Button>
            <Button icon={isAgency ? <Star className="h-4 w-4" /> : <Send className="h-4 w-4" />} onClick={() => !isAgency && navigate('/proposals/new')}>
              {isAgency ? ko.openScore : ko.createProposal}
            </Button>
          </>
        }
      />

      <div className="mb-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <div className="flex gap-2 overflow-x-auto border-b border-outline-variant px-5 pt-5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab;
              return (
                <button key={tab.id} type="button" className={[
                  'flex h-12 shrink-0 items-center gap-2 border-b-4 px-4 font-label text-[15px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/25',
                  isActive ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                ].join(' ')} onClick={() => setActiveTab(tab.id)}>
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="p-7 lg:p-9">
            <TabContent activeTab={activeTab} />
          </div>
        </Card>

        {isAgency ? <AgencyReviewPanel /> : <SupplierProposalPanel onCreateProposal={() => navigate('/proposals/new')} />}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-outline-variant p-8">
          <h2 className="font-headline text-[28px] font-bold">{isAgency ? ko.receivedCompare : ko.recommendedPeople}</h2>
          <p className="mt-2 text-on-surface-variant">{isAgency ? ko.agencyCompareDesc : ko.supplierDesc}</p>
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

function TabContent({ activeTab }: { activeTab: DetailTab }) {
  if (activeTab === 'overview') {
    return (
      <div>
        <SectionTitle icon={<Info className="h-6 w-6" />} title={ko.overview} />
        <dl className="grid gap-x-20 gap-y-10 md:grid-cols-2">
          <InfoBlock label={ko.agency} value={ko.agencyValue} />
          <InfoBlock label={ko.budget} value="8,900,000,000 KRW" strong />
          <InfoBlock label={ko.dept} value={ko.deptValue} />
          <InfoBlock label={ko.deadline} value="2026-07-03 14:00" danger />
          <InfoBlock label={ko.roles} value="PM, Backend, Frontend, DevOps" />
          <InfoBlock label={ko.period} value="2026.08 - 2027.07" />
        </dl>
      </div>
    );
  }

  if (activeTab === 'summary') {
    return <AnalysisGrid title={ko.summary} left={ko.requirement} right={ko.proposalPoint} leftItems={[ko.q1, ko.q2, ko.q3]} rightItems={[ko.p1, ko.p2, ko.p3]} />;
  }

  if (activeTab === 'skills') {
    return (
      <div>
        <SectionTitle icon={<Target className="h-6 w-6" />} title={ko.skills} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {['Java/Spring Boot', 'MSA 설계', 'PostgreSQL', 'Kubernetes', 'React Dashboard', '공공 보안 가이드'].map((skill) => (
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
        <SectionTitle icon={<Star className="h-6 w-6" />} title={ko.criteria} />
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
        <SectionTitle icon={<Calendar className="h-6 w-6" />} title={ko.schedule} />
        <div className="space-y-3 rounded border border-outline-variant bg-surface-container-low p-5">
          <Schedule label="질의 마감" value="2026년 6월 30일" />
          <Schedule label="제안 마감" value="2026년 7월 3일 14:00" />
          <Schedule label="평가/발표" value="2026년 7월 2주" />
          <Schedule label="계약 예정" value="2026년 7월 4주" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle icon={<Paperclip className="h-6 w-6" />} title={ko.files} />
      <div className="space-y-3">
        {['RFP_재난안전관리시스템.pdf', '제안요청_기술요구사항.xlsx', '보안준수_체크리스트.pdf'].map((file) => (
          <div key={file} className="flex items-center justify-between rounded-lg border border-outline-variant p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <span>{file}</span>
            </div>
            <Button variant="ghost" icon={<Download className="h-4 w-4" />} aria-label={`${file} download`} />
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
        <h2 className="font-headline text-[24px] font-bold">{ko.reviewPanel}</h2>
        <p className="mt-2 text-sm text-on-surface-variant">{ko.reviewPanelDesc}</p>
      </div>
      <div className="space-y-3">
        <StatusLine label="평가위원 배정" value="3/5명 완료" />
        <StatusLine label="기술평가 입력" value="2건 대기" />
        <StatusLine label="보완 요청" value="1건 진행" />
        <StatusLine label="우선협상 후보" value="1개사" />
      </div>
      <Button className="mt-5 w-full" icon={<Star className="h-4 w-4" />}>{ko.openScore}</Button>
    </Card>
  );
}

function SupplierProposalPanel({ onCreateProposal }: { onCreateProposal: () => void }) {
  return (
    <Card className="p-6">
      <div className="mb-5 border-b border-outline-variant pb-5">
        <h2 className="font-headline text-[24px] font-bold">{ko.candidatePanel}</h2>
        <p className="mt-2 text-sm text-on-surface-variant">{ko.candidatePanelDesc}</p>
      </div>
      <div className="space-y-3">
        {recommendedPeople.slice(0, 3).map((person) => (
          <div key={person.id} className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <div className="flex items-center justify-between gap-3">
              <strong>{person.name}</strong>
              <span className="font-bold text-primary">{person.fitScore}{ko.point}</span>
            </div>
            <p className="mt-1 text-sm text-on-surface-variant">{person.role} · {person.availableFrom}</p>
          </div>
        ))}
      </div>
      <Button className="mt-5 w-full" icon={<Send className="h-4 w-4" />} onClick={onCreateProposal}>{ko.createProposal}</Button>
    </Card>
  );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return <div className="mb-7 flex items-center gap-3 border-b border-outline-variant pb-5"><span className="text-primary">{icon}</span><h2 className="font-headline text-[28px] font-bold text-on-surface">{title}</h2></div>;
}

function InfoBlock({ label, value, strong = false, danger = false }: { label: string; value: string; strong?: boolean; danger?: boolean }) {
  return <div><dt className="mb-3 text-sm text-on-surface-variant">{label}</dt><dd className={[strong ? 'font-bold text-primary' : '', danger ? 'font-bold text-error' : '', 'text-[19px] leading-8'].join(' ')}>{value}</dd></div>;
}

function AnalysisGrid({ title, left, right, leftItems, rightItems }: { title: string; left: string; right: string; leftItems: string[]; rightItems: string[] }) {
  return <div><SectionTitle icon={<Sparkles className="h-6 w-6" />} title={title} /><div className="grid gap-5 lg:grid-cols-2"><AnalysisSection title={left} items={leftItems} /><AnalysisSection title={right} items={rightItems} /></div></div>;
}

function AnalysisSection({ title, items }: { title: string; items: string[] }) {
  return <div className="rounded-lg border border-outline-variant bg-surface-container-low p-5"><h3 className="mb-4 font-label text-[16px] font-bold text-primary">{title}</h3><ul className="space-y-3 text-[16px] leading-7 text-on-surface">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}

function Criteria({ label, value }: { label: string; value: number }) {
  return <div><div className="mb-2 flex items-center justify-between"><strong>{label}</strong><span className="text-primary">{value}%</span></div><div className="h-3 rounded-full bg-surface-container"><div className="h-3 rounded-full bg-primary" style={{ width: `${value}%` }} /></div></div>;
}

function Schedule({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 text-[16px]"><span>{label}</span><strong className="text-right">{value}</strong></div>;
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-4"><span>{label}</span><strong className="text-primary">{value}</strong></div>;
}