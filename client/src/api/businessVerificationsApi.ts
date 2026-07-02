import { axiosInstance } from './axios';
import type { ApiResponse } from './apiResponse';
import { unwrapApiResponse } from './apiResponse';

export interface BusinessVerificationStatus {
  businessNumber: string;
  verified: boolean;
  statusCode: string;
  statusMessage: string;
  taxType: string;
}

export async function verifyBusinessRegistrationStatus(businessNumber: string) {
  const response = await axiosInstance.post<ApiResponse<BusinessVerificationStatus>>('/business-verifications/status', {
    businessNumber
  });
  return unwrapApiResponse(response.data);
}
