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

export async function createCompanyMemberInvitation(payload: CreateCompanyMemberInvitationRequest) {
  const response = await axiosInstance.post<ApiResponse<CompanyMemberInvitation>>('/company-members/invitations', payload);
  return unwrapApiResponse(response.data);
}
