import type { SupplierRelationship } from '../../../api/suppliersApi';
import type { SupplierCompany } from '../types';

export function mapSupplierRelationshipToCompany(relationship: SupplierRelationship): SupplierCompany {
  const projectSummary = relationship.projectSummary;

  return {
    id: relationship.id,
    name: relationship.targetCompany.name,
    specialty: relationship.capabilities.length ? relationship.capabilities.join(', ') : relationship.targetCompany.companyType ?? '-',
    contact: relationship.contact?.name ?? '-',
    grade: relationship.internalGrade ?? '-',
    proposalCount: projectSummary?.total ?? 0,
    winRate: projectSummary?.active ?? 0,
    evaluation: 0,
    tags: relationship.tags ?? '-',
    status: relationship.managementStatus ?? 'active',
    certificationFiles: relationship.certificationFiles,
    projectCount: projectSummary?.total ?? 0,
    activeProjectCount: projectSummary?.active ?? 0,
    totalContractAmount: projectSummary?.totalContractAmount ?? 0,
    latestProjectName: projectSummary?.latestProjectName ?? '',
    latestProjectStatus: projectSummary?.latestProjectStatus ?? '',
    updatedAt: relationship.updatedAt
  };
}
