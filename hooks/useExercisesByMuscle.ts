import { useQuery } from '@tanstack/react-query';
import exerciseDbService from '../services/exercisedb.service';

export function useExercisesByMuscle(muscle: string, page = 1) {
  return useQuery({
    queryKey: ['exercises', 'muscle', muscle, page],
    queryFn: () => exerciseDbService.getExercisesByMuscle(muscle, page),
    enabled: !!muscle,
    staleTime: 10 * 60 * 1000,
  });
}
