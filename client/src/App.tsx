import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';
import { AuthProvider } from './features/auth/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './features/auth/components/AuthRouteGuards';
import { LoginPage } from './features/auth/pages/LoginPage';
import { SignupPage } from './features/auth/pages/SignupPage';
import { AgenciesPage } from './features/agencies/pages/AgenciesPage';
import { AgencyFormPage } from './features/agencies/pages/AgencyFormPage';
import { AgencyOrganizationPage } from './features/agencies/pages/AgencyOrganizationPage';
import { AgencyStaffPage } from './features/agencies/pages/AgencyStaffPage';
import { MyPage } from './features/account/pages/MyPage';
import { AdminDashboardPage } from './features/dashboards/pages/AdminDashboardPage';
import { AgencyDashboardPage } from './features/dashboards/pages/AgencyDashboardPage';
import { SupplierDashboardPage } from './features/dashboards/pages/SupplierDashboardPage';
import { BidParticipationPage } from './features/bids/pages/BidParticipationPage';
import { ProposalCreatePage } from './features/proposals/pages/ProposalCreatePage';
import { JobDetailPage } from './features/jobs/pages/JobDetailPage';
import { JobCreatePage } from './features/jobs/pages/JobCreatePage';
import { JobListPage } from './features/jobs/pages/JobListPage';
import { ManpowerPage } from './features/manpower/pages/ManpowerPage';
import { OfferAnalysisPage } from './features/offers/pages/OfferAnalysisPage';
import { WonProjectsPage } from './features/projects/pages/WonProjectsPage';
import { ProjectDetailPage } from './features/projects/pages/ProjectDetailPage';
import { ResumeDetailPage } from './features/resumes/pages/ResumeDetailPage';
import { SupplierDetailPage } from './features/suppliers/pages/SupplierDetailPage';
import { SupplierFormPage } from './features/suppliers/pages/SupplierFormPage';
import { SuppliersPage } from './features/suppliers/pages/SuppliersPage';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'signup', element: <SignupPage /> }
        ]
      }
    ]
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard/admin" replace /> },
          { path: 'mypage', element: <MyPage /> },
          { path: 'jobs', element: <JobListPage /> },
          { path: 'jobs/new', element: <JobCreatePage /> },
          { path: 'jobs/:jobId', element: <JobDetailPage /> },
          { path: 'resumes/:resumeId', element: <ResumeDetailPage /> },
          { path: 'offers/:offerId/analysis', element: <OfferAnalysisPage /> },
          { path: 'dashboard', element: <Navigate to="/dashboard/admin" replace /> },
          { path: 'dashboard/admin', element: <AdminDashboardPage /> },
          { path: 'dashboard/agency', element: <AgencyDashboardPage /> },
          { path: 'dashboard/supplier', element: <SupplierDashboardPage /> },
          { path: 'agencies', element: <AgenciesPage /> },
          { path: 'agencies/new', element: <AgencyFormPage /> },
          { path: 'agencies/:agencyId/edit', element: <AgencyFormPage /> },
          { path: 'agency-organizations', element: <AgencyOrganizationPage /> },
          { path: 'agency-staff', element: <AgencyStaffPage /> },
          { path: 'bid-participation', element: <BidParticipationPage /> },
          { path: 'proposals/new', element: <ProposalCreatePage /> },
          { path: 'clients', element: <SuppliersPage /> },
          { path: 'suppliers', element: <SuppliersPage /> },
          { path: 'suppliers/new', element: <SupplierFormPage /> },
          { path: 'suppliers/:supplierId/edit', element: <SupplierFormPage /> },
          { path: 'suppliers/:supplierId', element: <SupplierDetailPage /> },
          { path: 'projects/won', element: <WonProjectsPage /> },
          { path: 'projects/won/:projectId', element: <ProjectDetailPage /> },
          { path: 'manpower', element: <ManpowerPage /> }
        ]
      }
    ]
  }
]);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
