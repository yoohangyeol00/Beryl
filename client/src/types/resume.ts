export type AvailabilityStatus = 'available' | 'assigned' | 'partiallyAssigned' | 'unavailable';

export type Resume = {
  id: string;
  name: string;
  role: string;
  careerYears: number;
  skills: string[];
  availableFrom: string;
  availabilityStatus: AvailabilityStatus;
  employmentStatus: string;
  currentClient: string;
  currentProject: string;
  currentManMonths: number;
  currentEndDate: string;
  profileImageUrl?: string | null;
};

export type ResumeProject = {
  id: string;
  projectName: string;
  clientName: string;
  role: string;
  startedAt: string;
  endedAt: string;
  manMonths: number;
  description: string;
};

export type ResumeDetail = Resume & {
  projects: ResumeProject[];
};

export type ResumeListResponse = {
  items: Resume[];
  total: number;
  summary: {
    total: number;
    assigned: number;
    availableSoon: number;
    unavailable: number;
  };
};

export type ResumeListParams = {
  q?: string;
  availabilityStatus?: AvailabilityStatus;
  page?: number;
  pageSize?: number;
};

export type ResumeMutationPayload = {
  name: string;
  role?: string;
  careerYears?: number | '';
  availableFrom?: string;
  availabilityStatus?: AvailabilityStatus;
  employmentStatus?: string;
  skills?: string[] | string;
};
