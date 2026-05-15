import { useInfiniteQuery } from '@tanstack/react-query';
import exerciseDbService from '../services/exercisedb.service';

export function useExerciseSearch(query: string, limit = 10) {
  return useInfiniteQuery({
    queryKey: ['exercises', 'search', query, limit],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => exerciseDbService.searchExercises(query, pageParam, limit),
    enabled: query.trim().length > 1,
    staleTime: 10 * 60 * 1000,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.metadata;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
}
