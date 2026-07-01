export type WonProjectStatus = 'preparing' | 'inProgress' | 'atRisk' | 'completed' | 'cancelled';
export type ProjectHealthStatus = 'normal' | 'watch' | 'risk';
export type ProjectLogType = 'created' | 'progress' | 'risk' | 'inspection' | 'memo';

export type WonProject = {
  id: string;
  contractId: string | null;
  jobId: string | null;
  name: string;
  status: WonProjectStatus;
  startedAt: string;
  endedAt: string;
  plannedManMonths: number;
  actualManMonths: number;
  buyerCompanyId: string;
  buyerName: string;
  supplierCompanyId: string;
  supplierName: string;
  contractAmount: number;
  assignmentCount: number;
  assignmentNames: string[];
  progressRate: number;
  healthStatus: ProjectHealthStatus;
  nextAction: string;
  latestLogAt: string;
};

export type ProjectAssignment = {
  id: string;
  resumeId: string;
  name: string;
  role: string;
  assignedFrom: string;
  assignedTo: string;
  allocationRate: number;
  plannedManMonths: number;
  actualManMonths: number;
  status: string;
};

export type ProjectLog = {
  id: string;
  logType: ProjectLogType;
  title: string;
  body: string;
  progressRate: number | null;
  healthStatus: ProjectHealthStatus | null;
  nextAction: string;
  createdAt: string;
  authorName: string;
};

export type WonProjectDetail = WonProject & {
  assignments: ProjectAssignment[];
  logs: ProjectLog[];
};

export type WonProjectListResponse = {
  items: WonProject[];
  total: number;
  summary: {
    total: number;
    totalAmount: number;
    inspectionWaiting: number;
    riskProjects: number;
    endingSoon: number;
  };
};

export type WonProjectListParams = {
  q?: string;
  healthStatus?: ProjectHealthStatus;
  page?: number;
  pageSize?: number;
};

export type WonProjectMutationPayload = {
  name: string;
  buyerName?: string;
  contractAmount?: number | string;
  startedAt?: string;
  endedAt?: string;
  status?: WonProjectStatus;
  plannedManMonths?: number | string;
  actualManMonths?: number | string;
  progressRate?: number | string;
  healthStatus?: ProjectHealthStatus;
  nextAction?: string;
  logType?: ProjectLogType;
  logTitle?: string;
  logBody?: string;
};

export type ProjectLogPayload = {
  logType?: ProjectLogType;
  title: string;
  body?: string;
  progressRate?: number | string;
  healthStatus?: ProjectHealthStatus;
  nextAction?: string;
};
