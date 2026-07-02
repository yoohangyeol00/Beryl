import { axiosInstance } from './axios';
import type { ApiResponse } from './apiResponse';
import { unwrapApiResponse } from './apiResponse';

export interface CreateCompanyMemberInvitationRequest {
  name: string;
  email: string;
  department?: string;
  position?: string;
  phone?: string;
  role?: 'companyUser';
  memberType?: 'employee' | 'reviewer' | 'manager';
}

export interface CompanyMemberInvitation {
  id: string;
  companyMemberId: string;
  email: string;
  role: 'companyUser';
  status: string;
  expiresAt: string;
  sentAt: string | null;
}

export interface CompanyMemberListItem {
  id: string;
  name: string;
  department: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
  memberType: string;
  status: 'invited' | 'active' | 'inactive' | string;
  userId: string | null;
  assignedJobs: number;
  invitation: {
    id: string;
    status: 'pending' | 'accepted' | 'expired' | 'revoked' | string | null;
    role: 'companyUser' | string | null;
    invitedAt: string | null;
    sentAt: string | null;
    expiresAt: string | null;
    acceptedAt: string | null;
    invitedBy: {
      id: string;
      name: string | null;
      email: string | null;
    } | null;
  } | null;
}

export interface GetCompanyMembersParams {
  q?: string;
  status?: string;
}

export interface UpdateCompanyMemberRequest {
  department?: string;
  position?: string;
  phone?: string;
  memberType?: 'employee' | 'reviewer' | 'manager';
}

export interface CompanyMemberListResponse {
  items: CompanyMemberListItem[];
  total: number;
}

export interface CompanyMemberAssignee {
  id: string;
  name: string;
  department: string | null;
  position: string | null;
  memberType: string;
}

export interface CompanyMemberAssigneeResponse {
  items: CompanyMemberAssignee[];
  total: number;
}

export interface CompanyMemberInvitationHistoryItem {
  id: string;
  companyMemberId: string;
  name: string;
  department: string | null;
  position: string | null;
  email: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked' | string;
  invitedAt: string;
  sentAt: string | null;
  expiresAt: string;
  acceptedAt: string | null;
  canceledAt: string | null;
}

export interface CompanyMemberInvitationHistoryResponse {
  items: CompanyMemberInvitationHistoryItem[];
  total: number;
}

export async function createCompanyMemberInvitation(payload: CreateCompanyMemberInvitationRequest) {
  const response = await axiosInstance.post<ApiResponse<CompanyMemberInvitation>>('/company-members/invitations', payload);
  return unwrapApiResponse(response.data);
}

export async function getCompanyMembers(params?: GetCompanyMembersParams) {
  const response = await axiosInstance.get<ApiResponse<CompanyMemberListResponse>>('/company-members', {
    params
  });
  return unwrapApiResponse(response.data);
}

export async function getCompanyMemberAssignees() {
  const response = await axiosInstance.get<ApiResponse<CompanyMemberAssigneeResponse>>('/company-members/assignees');
  return unwrapApiResponse(response.data);
}

export async function getCompanyMemberInvitations() {
  const response = await axiosInstance.get<ApiResponse<CompanyMemberInvitationHistoryResponse>>('/company-members/invitations');
  return unwrapApiResponse(response.data);
}

export async function updateCompanyMember(memberId: string, payload: UpdateCompanyMemberRequest) {
  const response = await axiosInstance.patch<ApiResponse<{ id: string }>>(`/company-members/${memberId}`, payload);
  return unwrapApiResponse(response.data);
}

export async function cancelCompanyMemberInvitation(memberId: string) {
  const response = await axiosInstance.patch<ApiResponse<{ id: string }>>(`/company-members/${memberId}/cancel-invitation`);
  return unwrapApiResponse(response.data);
}

export async function deactivateCompanyMember(memberId: string) {
  const response = await axiosInstance.patch<ApiResponse<{ id: string }>>(`/company-members/${memberId}/deactivate`);
  return unwrapApiResponse(response.data);
}

export async function activateCompanyMember(memberId: string) {
  const response = await axiosInstance.patch<ApiResponse<{ id: string }>>(`/company-members/${memberId}/activate`);
  return unwrapApiResponse(response.data);
}
