import { axiosInstance } from './axios';
import type { ApiResponse } from './apiResponse';
import { unwrapApiResponse } from './apiResponse';

export type AuthRole = 'systemAdmin' | 'companyUser';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  companyId: string | null;
}

export interface AuthCompany {
  id: string;
  name: string;
  businessRegistrationNo: string | null;
  companyType: string | null;
  representativeName: string | null;
  address: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  status: string | null;
  logoUrl: string | null;
  supportsBuyer: boolean;
  supportsSupplier: boolean;
}

export interface AuthMember {
  id: string;
  name: string;
  department: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
  memberType: string;
}

export interface AuthSession {
  user: AuthUser;
  company: AuthCompany | null;
  member: AuthMember | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  company: {
    name: string;
    businessRegistrationNo?: string;
    businessRegistrationNoVerified?: boolean;
    supportsBuyer: boolean;
    supportsSupplier: boolean;
  };
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
  department?: string;
  position?: string;
  phone?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface InvitationAcceptInfo {
  email: string;
  name: string;
  companyName: string;
  department: string | null;
  position: string | null;
  expiresAt: string;
}

export interface AcceptInvitationRequest {
  token: string;
  password: string;
  passwordConfirm: string;
}

export async function login(payload: LoginRequest) {
  const response = await axiosInstance.post<ApiResponse<AuthSession>>('/auth/login', payload);
  return unwrapApiResponse(response.data);
}

export async function signup(payload: SignupRequest) {
  const response = await axiosInstance.post<ApiResponse<AuthSession>>('/auth/signup', payload);
  return unwrapApiResponse(response.data);
}

export async function logout() {
  const response = await axiosInstance.post<ApiResponse<{ ok: boolean }>>('/auth/logout');
  return unwrapApiResponse(response.data);
}

export async function withdrawAccount() {
  const response = await axiosInstance.delete<ApiResponse<{ ok: boolean }>>('/auth/me');
  return unwrapApiResponse(response.data);
}

export async function getCurrentAuthSession() {
  const response = await axiosInstance.get<ApiResponse<AuthSession>>('/auth/me');
  return unwrapApiResponse(response.data);
}

export async function updateProfile(payload: UpdateProfileRequest) {
  const response = await axiosInstance.patch<ApiResponse<AuthSession>>('/auth/me', payload);
  return unwrapApiResponse(response.data);
}

export async function updatePassword(payload: UpdatePasswordRequest) {
  const response = await axiosInstance.patch<ApiResponse<{ ok: boolean }>>('/auth/me/password', payload);
  return unwrapApiResponse(response.data);
}

export async function getInvitationAcceptInfo(token: string) {
  const response = await axiosInstance.get<ApiResponse<InvitationAcceptInfo>>('/auth/invitations/accept', {
    params: { token }
  });
  return unwrapApiResponse(response.data);
}

export async function acceptInvitation(payload: AcceptInvitationRequest) {
  const response = await axiosInstance.post<ApiResponse<AuthSession>>('/auth/invitations/accept', payload);
  return unwrapApiResponse(response.data);
}
