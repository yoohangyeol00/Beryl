import type { SupplierRelationship } from '../../../api/suppliersApi';
import type { SupplierCompany } from '../types';

export function mapSupplierRelationshipToCompany(relationship: SupplierRelationship): SupplierCompany {
  return {
    id: relationship.id,
    name: relationship.targetCompany.name,
    specialty: relationship.capabilities.length ? relationship.capabilities.join(', ') : relationship.targetCompany.companyType ?? '-',
    contact: relationship.contact?.name ?? '-',
    grade: relationship.internalGrade ?? '-',
    proposalCount: 0,
    winRate: 0,
    evaluation: 0,
    tags: relationship.tags ?? '-',
    status: relationship.managementStatus ?? 'active',
    certificationFiles: relationship.certificationFiles
  };
}
