import { axiosInstance } from './axios';
import type { ApiResponse } from './apiResponse';
import { unwrapApiResponse } from './apiResponse';
import type { AuthSession } from './authApi';

export interface UpdateMyCompanyRequest {
  name: string;
  businessRegistrationNo?: string;
  companyType?: string;
  representativeName?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  supportsBuyer?: boolean;
  supportsSupplier?: boolean;
}

export async function updateMyCompany(payload: UpdateMyCompanyRequest) {
  const response = await axiosInstance.patch<ApiResponse<AuthSession>>('/companies/me', payload);
  return unwrapApiResponse(response.data);
}

export async function uploadMyCompanyLogo(file: File) {
  const formData = new FormData();
  formData.append('logo', file);

  const response = await axiosInstance.post<ApiResponse<AuthSession>>('/companies/me/logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return unwrapApiResponse(response.data);
}
