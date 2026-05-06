import { useMutation, useQueryClient } from '@tanstack/react-query';
import gitfitService from '../services/gitfit.service';
import { useWorkoutSessionStore } from '../store/workoutSession.store';
import type { LogSetPayload } from '../types/exercise.types';

export const useLogSet = (sessionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LogSetPayload) => gitfitService.logSet(sessionId, payload),
    onSuccess: (result, payload) => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      if (result.isPr) {
        useWorkoutSessionStore
          .getState()
          .markSetAsPr(payload.exercise.exerciseId, payload.setNumber);
      }
    },
  });
};
