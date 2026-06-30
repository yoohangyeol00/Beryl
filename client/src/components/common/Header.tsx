import { Bell, BriefcaseBusiness, Building2, ChevronDown, CircleHelp, Menu, Search, ShieldCheck, UserRound, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useAuth } from '../../features/auth/AuthContext';
import { getBidParticipationPath, getDashboardPath, getJobsPath, getRoleMode, setStoredRoleMode, type RoleMode } from '../../features/modes/roleMode';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';

type HeaderProps = {
  onMenuClick?: () => void;
};

const roles: { label: string; value: RoleMode }[] = [
  { label: '발주기관', value: 'agency' },
  { label: '공급기업', value: 'supplier' }
];

const notifications = [
  { id: 'n-1', title: '제안 마감 D-3', detail: '차세대 통합 재난 안전 관리 공고의 제안 접수 마감이 임박했습니다.', tone: 'danger' as const },
  { id: 'n-2', title: '후보 제안 초안 생성', detail: '공공데이터 API 연계 플랫폼 고도화 건의 초안을 검토할 수 있습니다.', tone: 'info' as const },
  { id: 'n-3', title: '계약 종료 30일 전', detail: 'AI 디지털 교과서 클라우드 운영 연장 가능성 확인이 필요합니다.', tone: 'danger' as const },
  { id: 'n-4', title: 'RFP 분석 확인 필요', detail: '첨부파일 1건의 분석 결과를 수동으로 확인해야 합니다.', tone: 'info' as const }
];

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { session: authSession } = useAuth();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<RoleMode>(() => getRoleMode(location.pathname));
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const userName = authSession?.user.name ?? '김관리';
  const companyName = authSession?.company?.name ?? 'BERYL';
  const logoUrl = authSession?.company?.logoUrl;
  const position = authSession?.member?.position;
  const department = authSession?.member?.department;
  const title = position ? `${userName} ${position}` : userName;
  const subtitle = [companyName, department || roles.find((item) => item.value === role)?.label].filter(Boolean).join(' · ');
  const currentRole = roles.find((item) => item.value === role) ?? roles[0];
  const dashboardPath = getDashboardPath(role);
  const jobsPath = getJobsPath(role);

  useEffect(() => {
    setRole(getRoleMode(location.pathname));
  }, [location.pathname]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `${jobsPath}?q=${encodeURIComponent(query)}` : jobsPath);
  };

  const handleRoleChange = (nextRole: RoleMode) => {
    setRole(nextRole);
    setStoredRoleMode(nextRole);
    navigate(getDashboardPath(nextRole));
  };

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 flex h-20 items-center bg-surface-container-lowest">
        <div className="hidden h-full w-80 shrink-0 items-center border-r border-outline-variant px-6 lg:flex">
          <Link to={dashboardPath} className="block">
            <img src={logo} alt="BERYL" className="h-14 w-44 object-contain object-left" />
          </Link>
        </div>

        <div className="flex h-full min-w-0 flex-1 items-center justify-between gap-3 border-b border-outline-variant px-4 sm:gap-6 sm:px-6 lg:px-10">
          <button
            type="button"
            aria-label="메뉴 열기"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-outline-variant text-on-surface transition hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary/25 lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link to={dashboardPath} className="shrink-0 lg:hidden">
            <img src={logo} alt="BERYL" className="h-11 w-28 object-contain object-left" />
          </Link>

          <form className="hidden w-full max-w-[700px] md:block" onSubmit={handleSearch}>
            <Input
              aria-label="통합 검색"
              className="h-14 rounded-xl bg-surface-container-lowest text-lg"
              icon={<Search aria-hidden className="h-6 w-6" />}
              placeholder="공고, 고객사, 기술 검색..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </form>

          <div className="ml-auto flex items-center gap-2 sm:gap-4 lg:gap-6">
            <div className="relative hidden md:block">
              <button
                type="button"
                className="flex h-12 items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 font-label text-sm font-semibold text-on-surface shadow-sm transition hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/25"
                aria-haspopup="menu"
                aria-expanded={isRoleMenuOpen}
                onClick={() => setIsRoleMenuOpen((open) => !open)}
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                {currentRole.label} 모드
                <ChevronDown className={['h-4 w-4 text-on-surface-variant transition-transform', isRoleMenuOpen ? 'rotate-180' : ''].join(' ')} />
              </button>
              {isRoleMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+8px)] z-[80] w-48 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest p-1 shadow-ambient" role="menu">
                  {roles.map((item) => {
                    const isSelected = item.value === role;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        role="menuitemradio"
                        aria-checked={isSelected}
                        className={[
                          'flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left font-label text-sm transition-colors',
                          isSelected ? 'bg-primary/10 text-primary' : 'text-on-surface hover:bg-surface-container'
                        ].join(' ')}
                        onClick={() => {
                          setIsRoleMenuOpen(false);
                          handleRoleChange(item.value);
                        }}
                      >
                        <span>{item.label} 모드</span>
                        {isSelected ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              aria-label="알림"
              className="relative grid h-11 w-11 place-items-center rounded-lg text-on-surface hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary/25"
              onClick={() => setIsNotificationOpen(true)}
            >
              <Bell className="h-6 w-6" />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-error" />
            </button>
            <button type="button" aria-label="도움말" className="hidden h-11 w-11 place-items-center rounded-lg text-on-surface hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary/25 sm:grid">
              <CircleHelp className="h-6 w-6" />
            </button>
            <div className="hidden h-8 w-px bg-outline-variant lg:block" />
            <Link to="/mypage" className="flex items-center gap-3 rounded-xl px-2 py-1 hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary/25">
              <div className="hidden text-right lg:block">
                <p className="max-w-48 truncate font-label text-label-md text-on-surface">{title}</p>
                <p className="max-w-48 truncate text-xs text-on-surface-variant">{subtitle || currentRole.label}</p>
              </div>
              <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-primary p-1.5 text-on-primary lg:h-12 lg:w-12">
                {logoUrl ? (
                  <img src={logoUrl} alt={`${companyName} 로고`} className="h-full w-full object-contain" />
                ) : authSession?.company ? (
                  <Building2 className="h-6 w-6" />
                ) : (
                  <UserRound className="h-6 w-6" />
                )}
              </div>
            </Link>
          </div>
        </div>
      </header>

      {isNotificationOpen ? (
        <div className="fixed inset-0 z-[70]">
          <button type="button" aria-label="알림 닫기" className="absolute inset-0 bg-inverse-surface/20" onClick={() => setIsNotificationOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-[min(92vw,420px)] flex-col border-l border-outline-variant bg-surface-container-lowest shadow-ambient">
            <div className="flex items-center justify-between border-b border-outline-variant p-5">
              <div>
                <h2 className="font-headline text-[24px] font-bold">알림 / 해야 할 일</h2>
                <p className="mt-1 text-sm text-on-surface-variant">마감, 후보 제안, 계약 리스크를 확인합니다.</p>
              </div>
              <button type="button" aria-label="알림 닫기" className="grid h-10 w-10 place-items-center rounded-lg border border-outline-variant" onClick={() => setIsNotificationOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 overflow-y-auto p-5">
              {notifications.map((item) => (
                <button key={item.id} type="button" className="w-full rounded-lg border border-outline-variant p-4 text-left transition hover:border-primary hover:bg-primary/5" onClick={() => navigate(item.tone === 'danger' ? `${jobsPath}?deadline=urgent` : getBidParticipationPath())}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <strong>{item.title}</strong>
                    <Badge tone={item.tone}>{item.tone === 'danger' ? '긴급' : '확인'}</Badge>
                  </div>
                  <p className="text-sm leading-6 text-on-surface-variant">{item.detail}</p>
                </button>
              ))}
            </div>
            <div className="border-t border-outline-variant p-5">
              <button type="button" className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-label font-semibold text-on-primary" onClick={() => navigate(dashboardPath)}>
                <BriefcaseBusiness className="h-5 w-5" />
                현재 모드 대시보드에서 보기
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
