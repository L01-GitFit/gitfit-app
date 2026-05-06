import { useQuery } from '@tanstack/react-query';
import exerciseDbService from '../services/exercisedb.service';

export function useMuscles() {
  return useQuery({
    queryKey: ['muscles'],
    queryFn: () => exerciseDbService.getMuscles(),
    staleTime: Infinity,
  });
}
