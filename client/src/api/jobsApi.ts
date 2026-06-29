import { axiosInstance, requestWithMockFallback } from './axios';
import type { ApiResponse } from './apiResponse';
import { unwrapApiResponse } from './apiResponse';
import { mockJobDetailResponse, mockJobsResponse } from '../mocks/jobs.mock';
import type { JobDetail, JobList, JobStatus } from '../types/job';

export interface CreateJobRequest {
  title: string;
  noticeNumber?: string;
  buyerName: string;
  category?: string;
  budget?: number;
  procurementType?: 'public' | 'private';
  sourceType?: 'nara' | 'private_bid' | 'manual' | 'email' | 'other';
  sourceUrl?: string;
  publishedAt?: string;
  deadline?: string;
  status?: JobStatus;
  description?: string;
}

export async function getJobs() {
  return requestWithMockFallback<JobList>({
    request: async () => {
      const response = await axiosInstance.get<ApiResponse<JobList>>('/jobs');
      return unwrapApiResponse(response.data);
    },
    mock: () => unwrapApiResponse(mockJobsResponse)
  });
}

export async function getJobDetail(jobId: string) {
  return requestWithMockFallback<JobDetail>({
    request: async () => {
      const response = await axiosInstance.get<ApiResponse<JobDetail>>(`/jobs/${jobId}`);
      return unwrapApiResponse(response.data);
    },
    mock: () => unwrapApiResponse(mockJobDetailResponse)
  });
}

export async function createJob(payload: CreateJobRequest) {
  const response = await axiosInstance.post<ApiResponse<JobDetail>>('/jobs', payload);
  return unwrapApiResponse(response.data);
}

export async function updateJob(jobId: string, payload: CreateJobRequest) {
  const response = await axiosInstance.patch<ApiResponse<JobDetail>>(`/jobs/${jobId}`, payload);
  return unwrapApiResponse(response.data);
}

export async function deleteJob(jobId: string) {
  const response = await axiosInstance.delete<ApiResponse<{ ok: true }>>(`/jobs/${jobId}`);
  return unwrapApiResponse(response.data);
}
