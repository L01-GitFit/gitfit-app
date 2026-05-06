import { useQuery } from '@tanstack/react-query';
import exerciseDbService from '../services/exercisedb.service';

export function useExercisesByEquipment(equipment: string, page = 1) {
  return useQuery({
    queryKey: ['exercises', 'equipment', equipment, page],
    queryFn: () => exerciseDbService.getExercisesByEquipment(equipment, page),
    enabled: !!equipment,
    staleTime: 10 * 60 * 1000,
  });
}
