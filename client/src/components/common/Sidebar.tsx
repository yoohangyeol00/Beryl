import { BarChart3, Building2, CircleHelp, FileSearch, Gem, LayoutDashboard, Plus, Settings, Trophy, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: '대시보드', href: '/dashboard/agency', icon: LayoutDashboard },
  { label: '공급기업 대시보드', href: '/dashboard/supplier', icon: Building2 },
  { label: '입찰공고', href: '/jobs', icon: FileSearch },
  { label: 'RFP 분석', href: '/offers/demo/analysis', icon: CircleHelp },
  { label: '인력 현황', href: '/agencies', icon: Users },
  { label: '공급기업', href: '/suppliers', icon: BarChart3 },
  { label: '수주 사업', href: '/projects/won', icon: Trophy },
  { label: '자원 배정', href: '/manpower', icon: Users }
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-80 flex-shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest py-8 lg:flex">
      <div className="mb-10 px-8">
        <div className="mb-2 flex items-center gap-3">
          <Gem aria-hidden className="h-8 w-8 text-primary" />
          <span className="font-headline text-[32px] font-bold leading-none text-primary">BERYL</span>
        </div>
        <p className="font-body text-[15px] text-on-surface-variant">공공입찰관리시스템</p>
      </div>

      <div className="px-5 pb-8">
        <button className="flex h-16 w-full items-center justify-center gap-3 rounded-lg bg-primary px-5 font-label text-[18px] font-semibold text-on-primary shadow-sm">
          <Plus className="h-6 w-6" />
          공고 등록
        </button>
      </div>

      <nav className="flex-grow space-y-3 px-5">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              [
                'flex h-14 items-center rounded-lg border-r-4 px-5 font-label text-[18px] font-semibold transition-colors',
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-transparent text-on-surface hover:bg-surface-container'
              ].join(' ')
            }
          >
            <item.icon aria-hidden className="mr-4 h-6 w-6" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-3 border-t border-outline-variant/60 px-5 pt-8">
        <a className="flex h-12 items-center rounded-lg px-5 font-label text-[17px] font-semibold text-on-surface hover:bg-surface-container">
          <Settings aria-hidden className="mr-4 h-6 w-6" />
          설정
        </a>
      </div>
    </aside>
  );
}
