import { axiosInstance, requestWithMockFallback } from './axios';
import type { ApiResponse } from './apiResponse';
import { unwrapApiResponse } from './apiResponse';
import { mockResumesResponse } from '../mocks/resumes.mock';
import type { Resume, ResumeDetail, ResumeListParams, ResumeListResponse, ResumeMutationPayload } from '../types/resume';

function toListResponse(items: Resume[]): ResumeListResponse {
  return {
    items,
    total: items.length,
    summary: {
      total: items.length,
      assigned: items.filter((item) => item.availabilityStatus === 'assigned' || item.availabilityStatus === 'partiallyAssigned').length,
      availableSoon: items.filter((item) => item.availableFrom).length,
      unavailable: items.filter((item) => item.availabilityStatus === 'unavailable').length
    }
  };
}

export async function getResumes(params: ResumeListParams = {}) {
  return requestWithMockFallback<ResumeListResponse>({
    request: async () => {
      const response = await axiosInstance.get<ApiResponse<ResumeListResponse>>('/resumes', { params });
      return unwrapApiResponse(response.data);
    },
    mock: () => toListResponse(unwrapApiResponse(mockResumesResponse))
  });
}

export async function getResume(resumeId: string) {
  const response = await axiosInstance.get<ApiResponse<ResumeDetail>>(`/resumes/${resumeId}`);
  return unwrapApiResponse(response.data);
}

export async function createResume(payload: ResumeMutationPayload) {
  const response = await axiosInstance.post<ApiResponse<Resume>>('/resumes', payload);
  return unwrapApiResponse(response.data);
}

export async function updateResume(resumeId: string, payload: ResumeMutationPayload) {
  const response = await axiosInstance.patch<ApiResponse<Resume>>(`/resumes/${resumeId}`, payload);
  return unwrapApiResponse(response.data);
}

export async function deleteResume(resumeId: string) {
  const response = await axiosInstance.delete<ApiResponse<{ ok: boolean }>>(`/resumes/${resumeId}`);
  return unwrapApiResponse(response.data);
}
