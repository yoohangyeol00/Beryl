import { useQuery } from '@tanstack/react-query';
import { getSupplierRelationships, type GetSupplierRelationshipsParams } from '../../../api/suppliersApi';

export function useSupplierRelationships(params?: GetSupplierRelationshipsParams) {
  return useQuery({
    queryKey: ['supplier-relationships', params ?? {}],
    queryFn: () => getSupplierRelationships(params)
  });
}
