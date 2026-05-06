import { useQuery } from '@tanstack/react-query';
import exerciseDbService from '../services/exercisedb.service';

export function useExerciseSearch(query: string, page = 1) {
  return useQuery({
    queryKey: ['exercises', 'search', query, page],
    queryFn: () => exerciseDbService.searchExercises(query, page),
    enabled: query.trim().length > 1,
    staleTime: 10 * 60 * 1000,
  });
}
