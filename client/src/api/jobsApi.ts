import { axiosInstance } from './axios';
import type { ApiResponse } from './apiResponse';
import { unwrapApiResponse } from './apiResponse';
import type { JobDetail, JobList, JobStatus } from '../types/job';

export interface GetJobsParams {
  perspective?: 'buyer' | 'accessible';
  ownProcurement?: boolean;
  q?: string;
  status?: JobStatus;
  procurementType?: 'public' | 'private';
  sourceType?: 'nara' | 'nipa' | 'nia' | 'private_bid' | 'manual' | 'email' | 'other';
  deadlineStatus?: 'urgent' | 'open' | 'expired';
  minRfpScore?: number;
  page?: number;
  pageSize?: number;
  sort?: 'createdAt' | 'publishedAt' | 'deadline' | 'title';
  order?: 'asc' | 'desc';
}

export interface CreateJobRequest {
  title: string;
  noticeNumber?: string;
  buyerName: string;
  category?: string;
  budget?: number;
  procurementType?: 'public' | 'private';
  sourceType?: 'nara' | 'nipa' | 'nia' | 'private_bid' | 'manual' | 'email' | 'other';
  sourceUrl?: string;
  publishedAt?: string;
  deadline?: string;
  status?: JobStatus;
  description?: string;
}

export interface JobRecommendedPerson {
  id: string;
  resumeId: string;
  name: string;
  role: string;
  currentProject: string;
  availableFrom: string;
  fitScore: number;
  reason: string;
  scoreBreakdown?: {
    skill: number;
    publicExperience: number;
    availability: number;
    rate: number;
    risk: number;
  };
  requirementComparisons?: Array<{
    item: string;
    requirement: string;
    capability: string;
    result: 'match' | 'partial';
  }>;
}

export interface JobRecommendedPeopleResponse {
  items: JobRecommendedPerson[];
  provider: 'gemini' | 'rule-based';
}

export async function getJobs(params?: GetJobsParams) {
  const response = await axiosInstance.get<ApiResponse<JobList>>('/jobs', { params });
  return unwrapApiResponse(response.data);
}

export async function getJobDetail(jobId: string) {
  const response = await axiosInstance.get<ApiResponse<JobDetail>>(`/jobs/${jobId}`);
  return unwrapApiResponse(response.data);
}

export async function getJobRecommendedPeople(jobId: string) {
  const response = await axiosInstance.get<ApiResponse<JobRecommendedPeopleResponse>>(`/jobs/${jobId}/recommended-people`);
  return unwrapApiResponse(response.data);
}

export async function createJob(payload: CreateJobRequest) {
  const response = await axiosInstance.post<ApiResponse<JobDetail>>('/jobs', payload);
  return unwrapApiResponse(response.data);
}

export async function importJobs(payload: CreateJobRequest[]) {
  const response = await axiosInstance.post<ApiResponse<JobList>>('/jobs/import', { items: payload });
  return unwrapApiResponse(response.data);
}

export async function updateJob(jobId: string, payload: CreateJobRequest) {
  const response = await axiosInstance.patch<ApiResponse<JobDetail>>(`/jobs/${jobId}`, payload);
  return unwrapApiResponse(response.data);
}

export async function updateJobOwnProcurement(jobId: string, isOwnProcurement: boolean) {
  const response = await axiosInstance.patch<ApiResponse<JobDetail>>(`/jobs/${jobId}/own-procurement`, {
    isOwnProcurement
  });
  return unwrapApiResponse(response.data);
}

export async function deleteJob(jobId: string) {
  const response = await axiosInstance.delete<ApiResponse<{ ok: true }>>(`/jobs/${jobId}`);
  return unwrapApiResponse(response.data);
}
