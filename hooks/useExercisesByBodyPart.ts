import { useQuery } from '@tanstack/react-query';
import exerciseDbService from '../services/exercisedb.service';

export function useExercisesByBodyPart(bodyPart: string, page = 1) {
  return useQuery({
    queryKey: ['exercises', 'bodyPart', bodyPart, page],
    queryFn: () => exerciseDbService.getExercisesByBodyPart(bodyPart, page),
    enabled: !!bodyPart,
    staleTime: 10 * 60 * 1000,
  });
}
