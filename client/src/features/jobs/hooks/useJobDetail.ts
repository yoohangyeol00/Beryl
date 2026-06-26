import { useQuery } from '@tanstack/react-query';
import { getJobDetail } from '../../../api/jobsApi';

export function useJobDetail(jobId: string) {
  return useQuery({
    queryKey: ['jobs', jobId],
    queryFn: () => getJobDetail(jobId),
    enabled: Boolean(jobId)
  });
}
