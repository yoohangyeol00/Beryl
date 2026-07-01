import { axiosInstance, requestWithMockFallback } from './axios';
import type { ApiResponse } from './apiResponse';
import { unwrapApiResponse } from './apiResponse';
import type {
  ProjectLogPayload,
  WonProject,
  WonProjectDetail,
  WonProjectListParams,
  WonProjectListResponse,
  WonProjectMutationPayload
} from '../types/wonProject';

const emptyWonProjects: WonProjectListResponse = {
  items: [],
  total: 0,
  summary: {
    total: 0,
    totalAmount: 0,
    inspectionWaiting: 0,
    riskProjects: 0,
    endingSoon: 0
  }
};

export async function getWonProjects(params: WonProjectListParams = {}) {
  return requestWithMockFallback<WonProjectListResponse>({
    request: async () => {
      const response = await axiosInstance.get<ApiResponse<WonProjectListResponse>>('/projects/won', { params });
      return unwrapApiResponse(response.data);
    },
    mock: () => emptyWonProjects
  });
}

export async function getWonProject(projectId: string) {
  const response = await axiosInstance.get<ApiResponse<WonProjectDetail>>(`/projects/won/${projectId}`);
  return unwrapApiResponse(response.data);
}

export async function createWonProject(payload: WonProjectMutationPayload) {
  const response = await axiosInstance.post<ApiResponse<WonProject>>('/projects/won', payload);
  return unwrapApiResponse(response.data);
}

export async function updateWonProject(projectId: string, payload: WonProjectMutationPayload) {
  const response = await axiosInstance.patch<ApiResponse<WonProject>>(`/projects/won/${projectId}`, payload);
  return unwrapApiResponse(response.data);
}

export async function addWonProjectLog(projectId: string, payload: ProjectLogPayload) {
  const response = await axiosInstance.post<ApiResponse<{ items: WonProjectDetail['logs']; total: number }>>(`/projects/won/${projectId}/logs`, payload);
  return unwrapApiResponse(response.data);
}
