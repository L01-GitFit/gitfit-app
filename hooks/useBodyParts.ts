import { useQuery } from '@tanstack/react-query';
import exerciseDbService from '../services/exercisedb.service';

export function useBodyParts() {
  return useQuery({
    queryKey: ['bodyparts'],
    queryFn: () => exerciseDbService.getBodyParts(),
    staleTime: Infinity,
  });
}
