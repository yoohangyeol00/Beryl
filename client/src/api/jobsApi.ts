import { axiosInstance, requestWithMockFallback } from './axios';
import type { ApiResponse } from './apiResponse';
import { unwrapApiResponse } from './apiResponse';
import { mockJobDetailResponse, mockJobsResponse } from '../mocks/jobs.mock';
import type { JobDetail, JobList } from '../types/job';

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
