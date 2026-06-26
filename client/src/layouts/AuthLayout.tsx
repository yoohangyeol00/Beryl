import { Outlet } from 'react-router-dom';
import { ScrollToTop } from '../components/common/ScrollToTop';

export function AuthLayout() {
  return (
    <main className="min-h-screen bg-background">
      <ScrollToTop />
      <Outlet />
    </main>
  );
}
