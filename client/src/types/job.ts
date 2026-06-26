export type JobStatus = 'open' | 'closingSoon' | 'closed' | 'awarded' | 'draft';

export type Job = {
  id: string;
  noticeNumber: string;
  title: string;
  agency: string;
  category: string;
  budget: number;
  publishedAt: string;
  deadline: string;
  status: JobStatus;
  rfpScore: number;
  recommendedPeople: number;
};

export type JobList = {
  items: Job[];
  total: number;
  summary: {
    open: number;
    closingSoon: number;
    awarded: number;
    avgRfpScore: number;
  };
};

export type JobDetail = Job & {
  description: string;
  requirements: string[];
};
