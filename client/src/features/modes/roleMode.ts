export type RoleMode = 'agency' | 'supplier';

export function getModeFromPathname(pathname: string): RoleMode | null {
  if (pathname === '/buyer' || pathname.startsWith('/buyer/')) return 'agency';
  if (pathname === '/supplier' || pathname.startsWith('/supplier/')) return 'supplier';
  return null;
}

export function getStoredRoleMode(): RoleMode {
  if (typeof window === 'undefined') return 'agency';
  return window.localStorage.getItem('beryl-role-mode') === 'supplier' ? 'supplier' : 'agency';
}

export function getRoleMode(pathname?: string): RoleMode {
  if (pathname) {
    const routeMode = getModeFromPathname(pathname);
    if (routeMode) return routeMode;
  }

  return getStoredRoleMode();
}

export function setStoredRoleMode(mode: RoleMode) {
  window.localStorage.setItem('beryl-role-mode', mode);
  window.dispatchEvent(new CustomEvent('beryl-role-change', { detail: mode }));
}

export function getDashboardPath(mode: RoleMode) {
  return mode === 'agency' ? '/buyer/dashboard' : '/supplier/dashboard';
}

export function getJobsPath(mode: RoleMode) {
  return mode === 'agency' ? '/buyer/jobs' : '/supplier/jobs';
}

export function getJobDetailPath(mode: RoleMode, jobId: string) {
  return `${getJobsPath(mode)}/${jobId}`;
}

export function getJobEditPath(jobId: string) {
  return `/buyer/jobs/${jobId}/edit`;
}

export function getSupplierPoolPath() {
  return '/buyer/suppliers';
}

export function getSupplierFormPath(supplierId?: string) {
  return supplierId ? `/buyer/suppliers/${supplierId}/edit` : '/buyer/suppliers/new';
}

export function getSupplierClientsPath() {
  return '/supplier/clients';
}

export function getSupplierClientFormPath(clientId?: string) {
  return clientId ? `/supplier/clients/${clientId}/edit` : '/supplier/clients/new';
}

export function getProjectsPath() {
  return '/supplier/projects';
}

export function getManpowerPath() {
  return '/supplier/manpower';
}

export function getBidParticipationPath() {
  return '/supplier/bid-participation';
}
