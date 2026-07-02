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
  procurementType?: 'public' | 'private';
  sourceType?: 'nara' | 'nipa' | 'nia' | 'private_bid' | 'manual' | 'email' | 'other';
  sourceUrl?: string;
  rfpScore: number;
  recommendedPeople: number;
  isOwnProcurement?: boolean;
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
  evaluationCriteria: {
    score: number;
    summary: string;
    requirements: Array<{
      type: string;
      title: string;
      description: string;
      priority: number | null;
    }>;
    requiredSkills: string[];
    preferredSkills: string[];
    risks: string[];
    keywords: string[];
  };
};
