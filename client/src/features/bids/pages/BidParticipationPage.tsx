import { ClipboardCheck, FilePlus2, Send, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTitle } from '../../../components/common/PageTitle';
import { PageToolbar } from '../../../components/common/PageToolbar';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type RoleMode = 'agency' | 'supplier';

type Proposal = {
  id: string;
  project: string;
  client: string;
  proposedPeople: string;
  expectedStart: string;
  monthlyRate: string;
  fitScore: number;
  status: '후보선정' | '제안완료' | '인터뷰' | '보완필요';
};

const rows: Proposal[] = [
  { id: 'pr-1', project: '차세대 통합 재난 안전 관리 시스템 구축', client: '소방청', proposedPeople: '김도윤, 이서연, 박지훈', expectedStart: '2026-08-01', monthlyRate: '월 3,800만원', fitScore: 91, status: '제안완료' },
  { id: 'pr-2', project: '공공데이터 API 연계 플랫폼', client: '행정안전부', proposedPeople: '박지훈, 최민서', expectedStart: '2026-07-22', monthlyRate: '월 2,200만원', fitScore: 84, status: '후보선정' },
  { id: 'pr-3', project: 'AI 디지털 교과서 클라우드 운영', client: 'NIA', proposedPeople: '정하늘', expectedStart: '2026-07-10', monthlyRate: '월 1,600만원', fitScore: 78, status: '보완필요' },
  { id: 'pr-4', project: '전자조달 사용자 포털 개선', client: '조달청', proposedPeople: '이서연', expectedStart: '2026-08-15', monthlyRate: '월 1,400만원', fitScore: 82, status: '인터뷰' }
];

const draftProject = '차세대 통합 재난 안전 관리 시스템 구축';

const draftCandidates = [
  { name: '김도윤', role: 'PM/아키텍트', score: 92 },
  { name: '이서연', role: 'Frontend', score: 86 },
  { name: '박지훈', role: 'Backend', score: 81 }
];

const columns: DataTableColumn<Proposal>[] = [
  { key: 'project', header: '대상 사업', sortable: true, render: (row) => <strong>{row.project}</strong> },
  { key: 'client', header: '발주처', sortable: true },
  { key: 'proposedPeople', header: '제안 인력', sortable: true },
  { key: 'expectedStart', header: '예상 투입일', sortable: true },
  { key: 'monthlyRate', header: '제안 단가', align: 'right' },
  { key: 'fitScore', header: '적합도', align: 'right', sortable: true, sortValue: (row) => row.fitScore, render: (row) => `${row.fitScore}점` },
  {
    key: 'status',
    header: '진행상태',
    sortable: true,
    render: (row) => <Badge tone={row.status === '보완필요' ? 'danger' : row.status === '제안완료' ? 'success' : 'info'}>{row.status}</Badge>
  }
];

function getInitialRole(): RoleMode {
  if (typeof window === 'undefined') return 'agency';
  return window.localStorage.getItem('beryl-role-mode') === 'supplier' ? 'supplier' : 'agency';
}

export function BidParticipationPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<RoleMode>(getInitialRole);
  const isAgency = role === 'agency';

  useEffect(() => {
    const handleRoleChange = (event: Event) => {
      const nextRole = (event as CustomEvent<RoleMode>).detail;
      setRole(nextRole === 'supplier' ? 'supplier' : 'agency');
    };

    window.addEventListener('beryl-role-change', handleRoleChange);
    window.addEventListener('storage', () => setRole(getInitialRole()));

    return () => {
      window.removeEventListener('beryl-role-change', handleRoleChange);
    };
  }, []);

  return (
    <section>
      <PageTitle
        title={isAgency ? '접수 제안 평가' : '제출 제안 관리'}
        description={isAgency ? '우리 기관 공고에 공급기업이 제출한 제안서, 후보 인력, 단가, 평가 상태를 관리합니다.' : '입찰공고를 보고 작성·제출한 제안서의 상태, 보완 요청, 선정 이후 계약 전환을 관리합니다.'}
        actions={<Button icon={isAgency ? <ClipboardCheck className="h-4 w-4" /> : <Send className="h-4 w-4" />} onClick={() => !isAgency && navigate('/proposals/new')}>{isAgency ? '평가표 열기' : '제안서 생성'}</Button>}
      />

      {isAgency ? (
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card className="p-5">
            <p className="font-label text-label-sm uppercase text-on-surface-variant">접수 제안</p>
            <p className="mt-2 font-headline text-headline-md text-primary">16건</p>
          </Card>
          <Card className="p-5">
            <p className="font-label text-label-sm uppercase text-on-surface-variant">평가 대기</p>
            <p className="mt-2 font-headline text-headline-md text-error">8건</p>
          </Card>
          <Card className="p-5">
            <p className="font-label text-label-sm uppercase text-on-surface-variant">우선협상</p>
            <p className="mt-2 font-headline text-headline-md text-primary">3건</p>
          </Card>
          <Card className="p-5">
            <p className="font-label text-label-sm uppercase text-on-surface-variant">보완 요청</p>
            <p className="mt-2 font-headline text-headline-md text-error">2건</p>
          </Card>
        </div>
      ) : (
        <div className="mb-6 grid gap-4 xl:grid-cols-[1fr_360px]">
          <Card className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="font-headline text-[24px] font-bold">제안 후보군</h2>
              <Badge tone="info">초안 준비</Badge>
            </div>
            <p className="mb-4 text-sm text-on-surface-variant">대상 사업: <strong className="text-on-surface">{draftProject}</strong></p>
            <div className="grid gap-3 md:grid-cols-3">
              {draftCandidates.map((candidate) => (
                <div key={candidate.name} className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
                  <div className="flex items-center justify-between gap-3">
                    <strong>{candidate.name}</strong>
                    <span className="text-primary">{candidate.score}점</span>
                  </div>
                  <p className="mt-1 text-sm text-on-surface-variant">{candidate.role}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <FilePlus2 className="mb-4 h-7 w-7 text-primary" />
            <h2 className="font-headline text-[24px] font-bold">제안서 초안 생성</h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">선택된 제안 후보군의 역할, 단가, 투입 가능일을 기반으로 제안서 초안을 생성합니다.</p>
            <Button className="mt-5 w-full" icon={<Send className="h-4 w-4" />}>초안 생성</Button>
          </Card>
        </div>
      )}

      <PageToolbar searchPlaceholder={isAgency ? '사업명, 공급기업, 후보 인력 검색' : '사업명, 발주기관, 인력명 검색'} />
      <DataTable columns={columns} data={rows} getRowKey={(row) => row.id} />
    </section>
  );
}

