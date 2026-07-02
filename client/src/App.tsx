import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { Navigate, RouterProvider, createBrowserRouter, useParams } from 'react-router-dom';
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './features/auth/routes/AuthRouteGuards';
import { LoginPage } from './features/auth/pages/LoginPage';
import { SignupPage } from './features/auth/pages/SignupPage';
import { InvitationAcceptPage } from './features/auth/pages/InvitationAcceptPage';
import { AgenciesPage } from './features/agencies/pages/AgenciesPage';
import { AgencyFormPage } from './features/agencies/pages/AgencyFormPage';
import { AgencyOrganizationPage } from './features/agencies/pages/AgencyOrganizationPage';
import { BuyerCompanyMembersPage } from './features/company-members/pages/BuyerCompanyMembersPage';
import { BuyerCompanyMemberFormPage } from './features/company-members/pages/BuyerCompanyMemberFormPage';
import { BuyerCompanyMemberInvitationsPage } from './features/company-members/pages/BuyerCompanyMemberInvitationsPage';
import { MyPage } from './features/account/pages/MyPage';
import { AdminDashboardPage } from './features/dashboards/pages/AdminDashboardPage';
import { BuyerDashboardPage } from './features/dashboards/pages/BuyerDashboardPage';
import { SupplierDashboardPage } from './features/dashboards/pages/SupplierDashboardPage';
import { SupplierBidParticipationPage } from './features/bids/pages/SupplierBidParticipationPage';
import { ProposalCreatePage } from './features/proposals/pages/ProposalCreatePage';
import { BuyerJobDetailPage } from './features/jobs/pages/BuyerJobDetailPage';
import { BuyerJobFormPage } from './features/jobs/pages/BuyerJobFormPage';
import { BuyerJobListPage } from './features/jobs/pages/BuyerJobListPage';
import { SupplierJobDetailPage } from './features/jobs/pages/SupplierJobDetailPage';
import { SupplierJobListPage } from './features/jobs/pages/SupplierJobListPage';
import { SupplierManpowerPage } from './features/manpower/pages/SupplierManpowerPage';
import { OfferAnalysisPage } from './features/offers/pages/OfferAnalysisPage';
import { SupplierProjectsPage } from './features/projects/pages/SupplierProjectsPage';
import { SupplierProjectDetailPage } from './features/projects/pages/SupplierProjectDetailPage';
import { ResumeDetailPage } from './features/resumes/pages/ResumeDetailPage';
import { ResumeFormPage } from './features/resumes/pages/ResumeFormPage';
import { BuyerSupplierFormPage } from './features/company-relationships/pages/BuyerSupplierFormPage';
import { BuyerSupplierPoolPage } from './features/company-relationships/pages/BuyerSupplierPoolPage';
import { SupplierClientListPage } from './features/company-relationships/pages/SupplierClientListPage';
import { BuyerSupplierDetailPage } from './features/company-relationships/pages/BuyerSupplierDetailPage';

const queryClient = new QueryClient();

function RedirectWithParam({ to, param }: { to: (value: string) => string; param: string }) {
  const params = useParams();
  const value = params[param];

  return <Navigate to={value ? to(value) : '/buyer/dashboard'} replace />;
}

function CompanyMemberAdminRoute({ children }: { children: ReactElement }) {
  const { session } = useAuth();
  const canManageCompanyMembers = session?.user.role === 'systemAdmin' || session?.member?.memberType === 'manager';

  if (!canManageCompanyMembers) {
    return <Navigate to="/supplier/dashboard" replace />;
  }

  return children;
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
          { path: 'signup', element: <SignupPage /> },
          { path: 'invitations/accept', element: <InvitationAcceptPage /> }
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
          { path: 'buyer/dashboard', element: <BuyerDashboardPage /> },
          { path: 'buyer/jobs', element: <BuyerJobListPage /> },
          { path: 'buyer/jobs/new', element: <BuyerJobFormPage /> },
          { path: 'buyer/jobs/:jobId/edit', element: <BuyerJobFormPage /> },
          { path: 'buyer/jobs/:jobId', element: <BuyerJobDetailPage /> },
          { path: 'buyer/suppliers', element: <BuyerSupplierPoolPage /> },
          { path: 'buyer/suppliers/new', element: <BuyerSupplierFormPage /> },
          { path: 'buyer/suppliers/:supplierId/edit', element: <BuyerSupplierFormPage /> },
          { path: 'buyer/company-members', element: <Navigate to="/company-members" replace /> },
          { path: 'buyer/company-members/invitations', element: <Navigate to="/company-members/invitations" replace /> },
          { path: 'buyer/company-members/new', element: <Navigate to="/company-members/new" replace /> },
          { path: 'supplier/dashboard', element: <SupplierDashboardPage /> },
          { path: 'supplier/jobs', element: <SupplierJobListPage /> },
          { path: 'supplier/jobs/new', element: <BuyerJobFormPage /> },
          { path: 'supplier/jobs/:jobId', element: <SupplierJobDetailPage /> },
          { path: 'supplier/bid-participation', element: <SupplierBidParticipationPage /> },
          { path: 'supplier/company-members', element: <Navigate to="/company-members" replace /> },
          { path: 'supplier/company-members/invitations', element: <Navigate to="/company-members/invitations" replace /> },
          { path: 'supplier/company-members/new', element: <Navigate to="/company-members/new" replace /> },
          { path: 'supplier/clients', element: <SupplierClientListPage /> },
          { path: 'supplier/clients/new', element: <BuyerSupplierFormPage /> },
          { path: 'supplier/clients/:supplierId/edit', element: <BuyerSupplierFormPage /> },
          { path: 'supplier/manpower', element: <SupplierManpowerPage /> },
          { path: 'supplier/projects', element: <SupplierProjectsPage /> },
          { path: 'supplier/projects/:projectId', element: <SupplierProjectDetailPage /> },
          { path: 'jobs', element: <Navigate to="/buyer/jobs" replace /> },
          { path: 'jobs/new', element: <Navigate to="/buyer/jobs/new" replace /> },
          { path: 'jobs/:jobId/edit', element: <RedirectWithParam param="jobId" to={(jobId) => `/buyer/jobs/${jobId}/edit`} /> },
          { path: 'jobs/:jobId', element: <RedirectWithParam param="jobId" to={(jobId) => `/buyer/jobs/${jobId}`} /> },
          { path: 'resumes/new', element: <ResumeFormPage /> },
          { path: 'resumes/:resumeId/edit', element: <ResumeFormPage /> },
          { path: 'resumes/:resumeId', element: <ResumeDetailPage /> },
          { path: 'offers/:offerId', element: <ProposalCreatePage /> },
          { path: 'offers/:offerId/analysis', element: <OfferAnalysisPage /> },
          { path: 'company-members', element: <CompanyMemberAdminRoute><BuyerCompanyMembersPage /></CompanyMemberAdminRoute> },
          { path: 'company-members/invitations', element: <CompanyMemberAdminRoute><BuyerCompanyMemberInvitationsPage /></CompanyMemberAdminRoute> },
          { path: 'company-members/new', element: <CompanyMemberAdminRoute><BuyerCompanyMemberFormPage /></CompanyMemberAdminRoute> },
          { path: 'dashboard', element: <Navigate to="/buyer/dashboard" replace /> },
          { path: 'dashboard/admin', element: <AdminDashboardPage /> },
          { path: 'dashboard/agency', element: <Navigate to="/buyer/dashboard" replace /> },
          { path: 'dashboard/supplier', element: <Navigate to="/supplier/dashboard" replace /> },
          { path: 'agencies', element: <AgenciesPage /> },
          { path: 'agencies/new', element: <AgencyFormPage /> },
          { path: 'agencies/:agencyId/edit', element: <AgencyFormPage /> },
          { path: 'agency-organizations', element: <AgencyOrganizationPage /> },
          { path: 'agency-staff', element: <Navigate to="/company-members" replace /> },
          { path: 'bid-participation', element: <Navigate to="/supplier/bid-participation" replace /> },
          { path: 'proposals/new', element: <ProposalCreatePage /> },
          { path: 'clients', element: <Navigate to="/supplier/clients" replace /> },
          { path: 'suppliers', element: <Navigate to="/buyer/suppliers" replace /> },
          { path: 'suppliers/new', element: <Navigate to="/buyer/suppliers/new" replace /> },
          { path: 'suppliers/:supplierId/edit', element: <RedirectWithParam param="supplierId" to={(supplierId) => `/buyer/suppliers/${supplierId}/edit`} /> },
          { path: 'suppliers/:supplierId', element: <BuyerSupplierDetailPage /> },
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
