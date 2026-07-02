import { Outlet } from 'react-router-dom';
import { PageTransition } from '../components/common/PageTransition';
import { ScrollToTop } from '../components/common/ScrollToTop';

export function AuthLayout() {
  return (
    <main className="min-h-screen bg-background">
      <ScrollToTop />
      <PageTransition>
        <Outlet />
      </PageTransition>
    </main>
  );
}
