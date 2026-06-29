import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <AuthRouteLoading />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <AuthRouteLoading />;
  }

  if (status === 'authenticated') {
    return <Navigate to="/dashboard/admin" replace />;
  }

  return <Outlet />;
}

function AuthRouteLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-background text-on-background">
      <div className="rounded-lg bg-surface-container px-6 py-4 font-label text-[15px] text-on-surface-variant">
        세션 확인 중...
      </div>
    </div>
  );
}
