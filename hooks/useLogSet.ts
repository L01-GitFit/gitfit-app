import { useMutation, useQueryClient } from '@tanstack/react-query';
import gitfitService from '../services/gitfit.service';
import type { LogSetPayload } from '../types/exercise.types';

export const useLogSet = (sessionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LogSetPayload) => gitfitService.logSet(sessionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
    },
  });
};
