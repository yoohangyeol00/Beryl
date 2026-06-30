export type RoleMode = 'agency' | 'supplier';

export type SupplierStatus = 'preferred' | 'active' | 'review' | 'watch';

export type SupplierAttachment = {
  id: string;
  name: string;
  fileName: string | null;
  url: string | null;
};

export type SupplierCompany = {
  id: string;
  name: string;
  specialty: string;
  contact: string;
  grade: string;
  proposalCount: number;
  winRate: number;
  evaluation: number;
  tags: string;
  status: SupplierStatus;
  certificationFiles: SupplierAttachment[];
};
