import { useMutation, useQueryClient } from '@tanstack/react-query';
import gitfitService from '../services/gitfit.service';
import type { AddExerciseToRoutinePayload } from '../types/exercise.types';

export const useAddExerciseToRoutine = (routineId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddExerciseToRoutinePayload) =>
      gitfitService.addExerciseToRoutine(routineId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines', routineId] });
    },
  });
};
