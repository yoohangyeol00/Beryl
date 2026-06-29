import { Building2, ClipboardList, FileSearch, LayoutDashboard, Plus, RefreshCw, Users, X, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

type RoleMode = 'agency' | 'supplier';

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  activeMatch?: 'exact' | 'section';
};

const ko = {
  agencyDashboard: '\uB0B4 \uBC1C\uC8FC \uB300\uC2DC\uBCF4\uB4DC',
  agencyJobs: '\uBC1C\uC8FC \uC0AC\uC5C5 \uAD00\uB9AC',
  agencyExecution: '\uACC4\uC57D/\uC218\uD589 \uAD00\uB9AC',
  agencySuppliers: '\uACF5\uAE09\uAE30\uC5C5 \uD480',
  agencyUsers: '\uAE30\uAD00 \uC0AC\uC6A9\uC790/\uAD8C\uD55C',
  supplierDashboard: '\uB0B4 \uC0AC\uC5C5 \uB300\uC2DC\uBCF4\uB4DC',
  supplierOpportunities: '\uC785\uCC30\uACF5\uACE0 \uD655\uC778',
  supplierProposals: '\uC81C\uCD9C \uC81C\uC548 \uAD00\uB9AC',
  supplierPeople: '\uC778\uB825/\uC774\uB825 \uAD00\uB9AC',
  supplierProjects: '\uC218\uD589 \uC0AC\uC5C5 \uAD00\uB9AC',
  supplierClients: '\uAC70\uB798\uCC98 \uAD00\uB9AC',
  newJob: '\uC2E0\uADDC \uACF5\uACE0 \uB4F1\uB85D',
  mobileMenu: '\uBAA8\uBC14\uC77C \uBA54\uB274',
  closeMenu: '\uBA54\uB274 \uB2EB\uAE30'
};

const navItemsByRole: Record<RoleMode, NavItem[]> = {
  agency: [
    { label: ko.agencyDashboard, href: '/dashboard/agency', icon: LayoutDashboard, activeMatch: 'exact' },
    { label: ko.agencyJobs, href: '/jobs', icon: ClipboardList, activeMatch: 'section' },
    { label: ko.agencyExecution, href: '/projects/won', icon: RefreshCw, activeMatch: 'section' },
    { label: ko.agencySuppliers, href: '/suppliers', icon: Building2, activeMatch: 'section' },
    { label: ko.agencyUsers, href: '/agency-staff', icon: Users, activeMatch: 'exact' }
  ],
  supplier: [
    { label: ko.supplierDashboard, href: '/dashboard/supplier', icon: LayoutDashboard, activeMatch: 'exact' },
    { label: ko.supplierOpportunities, href: '/jobs', icon: ClipboardList, activeMatch: 'section' },
    { label: ko.supplierProposals, href: '/bid-participation', icon: FileSearch, activeMatch: 'exact' },
    { label: ko.supplierPeople, href: '/manpower', icon: Users, activeMatch: 'exact' },
    { label: ko.supplierProjects, href: '/projects/won', icon: RefreshCw, activeMatch: 'section' },
    { label: ko.supplierClients, href: '/clients', icon: Building2, activeMatch: 'exact' }
  ]
};

const roleMeta = {
  agency: { ctaLabel: ko.newJob, ctaHref: '/jobs/new' },
  supplier: { ctaLabel: ko.supplierOpportunities, ctaHref: '/jobs' }
};

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

function getInitialRole(): RoleMode {
  if (typeof window === 'undefined') return 'agency';
  return window.localStorage.getItem('beryl-role-mode') === 'supplier' ? 'supplier' : 'agency';
}

function isNavItemActive(pathname: string, item: NavItem) {
  if (item.activeMatch === 'exact') return pathname === item.href;
  if (item.href === '/jobs') return pathname === '/jobs' || pathname.startsWith('/jobs/');
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const [role, setRole] = useState<RoleMode>(getInitialRole);
  const navItems = navItemsByRole[role];
  const meta = roleMeta[role];

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

  const nav = (
    <>
      <div className="px-5 pb-8">
        <Link to={meta.ctaHref} className="flex h-16 w-full items-center justify-center gap-3 rounded-lg bg-primary px-5 font-label text-[18px] font-semibold text-on-primary shadow-sm" onClick={onClose}>
          <Plus className="h-6 w-6" />
          {meta.ctaLabel}
        </Link>
      </div>

      <nav className="flex-grow space-y-3 overflow-y-auto px-5">
        {navItems.map((item) => {
          const isActive = isNavItemActive(location.pathname, item);
          return (
            <Link key={item.href} to={item.href} onClick={onClose} className={[
              'flex h-14 items-center rounded-lg border-r-4 px-5 font-label text-[18px] font-semibold transition-colors',
              isActive ? 'border-primary bg-primary/10 text-primary' : 'border-transparent text-on-surface hover:bg-surface-container'
            ].join(' ')}>
              <item.icon aria-hidden className="mr-4 h-6 w-6" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      <aside className="fixed left-0 top-20 z-40 hidden h-[calc(100vh-5rem)] w-80 flex-shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest py-6 lg:flex">
        {nav}
      </aside>
      {isOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label={ko.mobileMenu}>
          <button type="button" aria-label={ko.closeMenu} className="absolute inset-0 bg-inverse-surface/45" onClick={onClose} />
          <aside className="relative flex h-full w-[min(88vw,320px)] flex-col bg-surface-container-lowest py-5 shadow-ambient">
            <div className="mb-5 flex items-center justify-between px-5">
              <strong className="font-headline text-headline-md text-primary">BERYL</strong>
              <button type="button" aria-label={ko.closeMenu} className="grid h-10 w-10 place-items-center rounded-lg border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/25" onClick={onClose}>
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      ) : null}
    </>
  );
}