import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Header } from '../components/common/Header';
import { PageTransition } from '../components/common/PageTransition';
import { Sidebar } from '../components/common/Sidebar';
import { ScrollToTop } from '../components/common/ScrollToTop';

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-on-background">
      <ScrollToTop />
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="ml-0 flex min-w-0 flex-1 flex-col pt-20 lg:ml-80">
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="w-full">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </div>
      </main>
    </div>
  );
}
