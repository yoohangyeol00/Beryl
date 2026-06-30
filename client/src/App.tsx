import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navigate, RouterProvider, createBrowserRouter, useParams } from 'react-router-dom';
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';
import { AuthProvider } from './features/auth/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './features/auth/routes/AuthRouteGuards';
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
import { ResumeFormPage } from './features/resumes/pages/ResumeFormPage';
import { SupplierDetailPage } from './features/suppliers/pages/SupplierDetailPage';
import { SupplierFormPage } from './features/suppliers/pages/SupplierFormPage';
import { SuppliersPage } from './features/suppliers/pages/SuppliersPage';

const queryClient = new QueryClient();

function RedirectWithParam({ to, param }: { to: (value: string) => string; param: string }) {
  const params = useParams();
  const value = params[param];

  return <Navigate to={value ? to(value) : '/buyer/dashboard'} replace />;
}

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
          { index: true, element: <Navigate to="/buyer/dashboard" replace /> },
          { path: 'mypage', element: <MyPage /> },
          { path: 'buyer/dashboard', element: <AgencyDashboardPage /> },
          { path: 'buyer/jobs', element: <JobListPage mode="agency" /> },
          { path: 'buyer/jobs/new', element: <JobCreatePage /> },
          { path: 'buyer/jobs/:jobId/edit', element: <JobCreatePage /> },
          { path: 'buyer/jobs/:jobId', element: <JobDetailPage mode="agency" /> },
          { path: 'buyer/suppliers', element: <SuppliersPage mode="agency" /> },
          { path: 'buyer/suppliers/new', element: <SupplierFormPage /> },
          { path: 'buyer/suppliers/:supplierId/edit', element: <SupplierFormPage /> },
          { path: 'buyer/company-members', element: <AgencyStaffPage /> },
          { path: 'supplier/dashboard', element: <SupplierDashboardPage /> },
          { path: 'supplier/jobs', element: <JobListPage mode="supplier" /> },
          { path: 'supplier/jobs/:jobId', element: <JobDetailPage mode="supplier" /> },
          { path: 'supplier/bid-participation', element: <BidParticipationPage /> },
          { path: 'supplier/clients', element: <SuppliersPage mode="supplier" /> },
          { path: 'supplier/manpower', element: <ManpowerPage /> },
          { path: 'supplier/projects', element: <WonProjectsPage /> },
          { path: 'supplier/projects/:projectId', element: <ProjectDetailPage /> },
          { path: 'jobs', element: <Navigate to="/buyer/jobs" replace /> },
          { path: 'jobs/new', element: <Navigate to="/buyer/jobs/new" replace /> },
          { path: 'jobs/:jobId/edit', element: <RedirectWithParam param="jobId" to={(jobId) => `/buyer/jobs/${jobId}/edit`} /> },
          { path: 'jobs/:jobId', element: <RedirectWithParam param="jobId" to={(jobId) => `/buyer/jobs/${jobId}`} /> },
          { path: 'resumes/new', element: <ResumeFormPage /> },
          { path: 'resumes/:resumeId/edit', element: <ResumeFormPage /> },
          { path: 'resumes/:resumeId', element: <ResumeDetailPage /> },
          { path: 'offers/:offerId', element: <ProposalCreatePage /> },
          { path: 'offers/:offerId/analysis', element: <OfferAnalysisPage /> },
          { path: 'dashboard', element: <Navigate to="/buyer/dashboard" replace /> },
          { path: 'dashboard/admin', element: <AdminDashboardPage /> },
          { path: 'dashboard/agency', element: <Navigate to="/buyer/dashboard" replace /> },
          { path: 'dashboard/supplier', element: <Navigate to="/supplier/dashboard" replace /> },
          { path: 'agencies', element: <AgenciesPage /> },
          { path: 'agencies/new', element: <AgencyFormPage /> },
          { path: 'agencies/:agencyId/edit', element: <AgencyFormPage /> },
          { path: 'agency-organizations', element: <AgencyOrganizationPage /> },
          { path: 'agency-staff', element: <Navigate to="/buyer/company-members" replace /> },
          { path: 'bid-participation', element: <Navigate to="/supplier/bid-participation" replace /> },
          { path: 'proposals/new', element: <ProposalCreatePage /> },
          { path: 'clients', element: <Navigate to="/supplier/clients" replace /> },
          { path: 'suppliers', element: <Navigate to="/buyer/suppliers" replace /> },
          { path: 'suppliers/new', element: <Navigate to="/buyer/suppliers/new" replace /> },
          { path: 'suppliers/:supplierId/edit', element: <RedirectWithParam param="supplierId" to={(supplierId) => `/buyer/suppliers/${supplierId}/edit`} /> },
          { path: 'suppliers/:supplierId', element: <SupplierDetailPage /> },
          { path: 'projects/won', element: <Navigate to="/supplier/projects" replace /> },
          { path: 'projects/won/:projectId', element: <RedirectWithParam param="projectId" to={(projectId) => `/supplier/projects/${projectId}`} /> },
          { path: 'manpower', element: <Navigate to="/supplier/manpower" replace /> }
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
