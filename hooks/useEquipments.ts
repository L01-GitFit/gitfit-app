import { useQuery } from '@tanstack/react-query';
import exerciseDbService from '../services/exercisedb.service';

export function useEquipments() {
  return useQuery({
    queryKey: ['equipments'],
    queryFn: () => exerciseDbService.getEquipments(),
    staleTime: Infinity,
  });
}
