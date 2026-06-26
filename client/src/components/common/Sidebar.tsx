import { BarChart3, Building2, FileSearch, LayoutDashboard, Plus, RefreshCw, Users } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

const navItems = [
  { label: '운영 대시보드', href: '/dashboard/admin', icon: LayoutDashboard },
  { label: '사업공고 발굴', href: '/jobs', icon: FileSearch },
  { label: '제안관리', href: '/bid-participation', icon: BarChart3 },
  { label: '투입현황 관리', href: '/manpower', icon: Users },
  { label: '참여 사업', href: '/projects/won', icon: RefreshCw },
  { label: '고객사 관리', href: '/clients', icon: Building2 }
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-20 z-40 hidden h-[calc(100vh-5rem)] w-80 flex-shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest py-6 lg:flex">
      <div className="px-5 pb-8">
        <Link
          to="/jobs/new"
          className="flex h-16 w-full items-center justify-center gap-3 rounded-lg bg-primary px-5 font-label text-[18px] font-semibold text-on-primary shadow-sm"
        >
          <Plus className="h-6 w-6" />
          공고 수집
        </Link>
      </div>

      <nav className="flex-grow space-y-3 overflow-y-auto px-5">
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

    </aside>
  );
}
