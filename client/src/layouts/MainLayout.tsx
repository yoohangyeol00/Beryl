import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';

export function MainLayout() {
  return (
    <div className="flex min-h-screen bg-background text-on-background">
      <Sidebar />
      <main className="ml-0 flex min-w-0 flex-1 flex-col lg:ml-80">
        <Header />
        <div className="flex-1 px-6 py-8 lg:px-10">
          <div className="w-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
