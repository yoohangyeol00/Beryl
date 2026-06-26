import { axiosInstance, requestWithMockFallback } from './axios';
import type { ApiResponse } from './apiResponse';
import { unwrapApiResponse } from './apiResponse';
import { mockResumesResponse } from '../mocks/resumes.mock';
import type { Resume } from '../types/resume';

export async function getResumes() {
  return requestWithMockFallback<Resume[]>({
    request: async () => {
      const response = await axiosInstance.get<ApiResponse<Resume[]>>('/resumes');
      return unwrapApiResponse(response.data);
    },
    mock: () => unwrapApiResponse(mockResumesResponse)
  });
}
