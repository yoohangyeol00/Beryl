import { axiosInstance } from './axios';
import type { ApiResponse } from './apiResponse';
import { unwrapApiResponse } from './apiResponse';

export type SupplierManagementStatus = 'preferred' | 'active' | 'review' | 'watch';

export interface CreateSupplierRelationshipRequest {
  company: {
    name: string;
    businessRegistrationNo?: string;
    companyType?: string;
    representativeName?: string;
    websiteUrl?: string;
    address?: string;
    contactPhone?: string;
    contactEmail?: string;
  };
  contact?: {
    name?: string;
    department?: string;
    position?: string;
    email?: string;
    phone?: string;
  };
  capabilities?: string[];
  certifications?: string[];
  relationship?: {
    relationshipType?: 'preferred_partner' | 'bid_participation' | 'contract' | 'won_project';
    internalGrade?: string;
    managementStatus?: SupplierManagementStatus;
    tags?: string;
    memo?: string;
  };
}

export interface SupplierRelationship {
  id: string;
  sourceCompanyId: string;
  targetCompanyId: string;
  sourcePerspective: 'buyer' | 'supplier';
  targetPerspective: 'buyer' | 'supplier';
  relationshipType: string;
  status: string;
  internalGrade: string | null;
  managementStatus: SupplierManagementStatus | null;
  tags: string | null;
  memo: string | null;
  targetCompany: {
    id: string;
    name: string;
    businessRegistrationNo: string | null;
    companyType: string | null;
    representativeName: string | null;
    websiteUrl: string | null;
    address: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
  };
  contact: {
    id: string;
    name: string | null;
    department: string | null;
    position: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  capabilities: string[];
  certifications: string[];
  certificationFiles: Array<{
    id: string;
    name: string;
    fileName: string | null;
    url: string | null;
    mimeType: string | null;
    fileSize: string | number | null;
  }>;
}

export interface SupplierRelationshipList {
  items: SupplierRelationship[];
  total: number;
}

export interface GetSupplierRelationshipsParams {
  perspective?: 'buyer' | 'supplier';
  q?: string;
}

export async function getSupplierRelationships(params?: GetSupplierRelationshipsParams) {
  const response = await axiosInstance.get<ApiResponse<SupplierRelationshipList>>('/company-relationships', { params });
  return unwrapApiResponse(response.data);
}

export async function getSupplierRelationship(relationshipId: string) {
  const response = await axiosInstance.get<ApiResponse<SupplierRelationship>>(`/company-relationships/${relationshipId}`);
  return unwrapApiResponse(response.data);
}

export async function createSupplierRelationship(payload: CreateSupplierRelationshipRequest) {
  const response = await axiosInstance.post<ApiResponse<SupplierRelationship>>('/company-relationships', payload);
  return unwrapApiResponse(response.data);
}

export async function updateSupplierRelationship(relationshipId: string, payload: CreateSupplierRelationshipRequest) {
  const response = await axiosInstance.patch<ApiResponse<SupplierRelationship>>(`/company-relationships/${relationshipId}`, payload);
  return unwrapApiResponse(response.data);
}

export async function deleteSupplierRelationship(relationshipId: string) {
  const response = await axiosInstance.delete<ApiResponse<{ id: string }>>(`/company-relationships/${relationshipId}`);
  return unwrapApiResponse(response.data);
}

export async function uploadSupplierCertificationFile(relationshipId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post<ApiResponse<unknown>>(
    `/company-relationships/${relationshipId}/certification-files`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return unwrapApiResponse(response.data);
}
