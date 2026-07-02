export type OfferStatus = 'draft' | 'submitted' | 'awarded' | 'rejected';
export type SubmissionChannel = 'nara' | 'email' | 'portal' | 'visit' | 'other';

export type OfferSubmission = {
  id: string;
  offerId: string;
  submittedAt: string;
  channel: SubmissionChannel;
  receiptNo: string;
  submittedByMemberId: string;
  submittedByName: string;
  memo: string;
};

export type Offer = {
  id: string;
  jobId: string;
  jobTitle: string;
  buyerCompanyId: string;
  buyerName: string;
  supplierCompanyId: string;
  supplierName: string;
  status: OfferStatus;
  totalMatchScore: number;
  submittedAt: string;
  proposalTitle: string;
  proposalManagerName: string;
  proposalAmount: number;
  technicalScore: number;
  priceScore: number;
  expectedStartDate: string;
  expectedDurationMonths: number;
  strategyMemo: string;
  proposedPeople: string[];
  latestSubmission: OfferSubmission | null;
};

export type OfferMatch = {
  id: string;
  resumeId: string;
  resumeName: string;
  resumeRole: string;
  totalScore: number;
  requiredSkillScore: number;
  preferredSkillScore: number;
  projectExperienceScore: number;
  availabilityScore: number;
  reasons: unknown[];
  risks: unknown[];
  decisionStatus: 'recommended' | 'shortlisted' | 'confirmed' | 'rejected';
};

export type OfferDetail = Offer & {
  matches: OfferMatch[];
  submissions: OfferSubmission[];
};

export type OfferListResponse = {
  items: Offer[];
  total: number;
  summary: {
    total: number;
    draft: number;
    submitted: number;
    awarded: number;
    rejected: number;
  };
};

export type OfferListParams = {
  q?: string;
  status?: OfferStatus;
  perspective?: 'supplier' | 'buyer' | 'all';
  jobId?: string;
  page?: number;
  pageSize?: number;
};

export type OfferMutationPayload = {
  jobId?: string;
  status?: OfferStatus;
  proposalTitle?: string;
  proposalManagerName?: string;
  proposalAmount?: number | string;
  technicalScore?: number | string;
  priceScore?: number | string;
  expectedStartDate?: string;
  expectedDurationMonths?: number | string;
  strategyMemo?: string;
  resumeIds?: string[];
};

export type ReceivedOfferPayload = {
  jobId: string;
  supplierName: string;
  status?: OfferStatus;
  proposalTitle?: string;
  proposalManagerName?: string;
  proposalAmount?: number | string;
  technicalScore?: number | string;
  priceScore?: number | string;
  strategyMemo?: string;
};

export type OfferSubmissionPayload = {
  submittedAt: string;
  channel: SubmissionChannel;
  receiptNo?: string;
  submittedByName?: string;
  memo?: string;
};
