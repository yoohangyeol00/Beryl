import { useQuery } from '@tanstack/react-query';
import { getJobs, type GetJobsParams } from '../../../api/jobsApi';

export function useJobs(params?: GetJobsParams) {
  return useQuery({
    queryKey: ['jobs', params ?? {}],
    queryFn: () => getJobs(params)
  });
}
