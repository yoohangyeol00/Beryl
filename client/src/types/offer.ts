export type Offer = {
  id: string;
  jobId: string;
  supplierName: string;
  status: 'draft' | 'submitted' | 'awarded' | 'rejected';
};
