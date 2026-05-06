import { apiClient } from '../utils/apiClient';
import type {
  AddExerciseToRoutinePayload,
  Exercise,
  LogSetPayload,
  WorkoutSet,
} from '../types/exercise.types';

export interface RoutineExercise {
  id: string;
  routineId: string;
  exerciseId: string;
  exercise: Exercise;
  sets: number | null;
  repsTarget: string | null;
  weightTarget: number | null;
  restSeconds: number | null;
  orderIndex: number;
}

async function addExerciseToRoutine(
  routineId: string,
  payload: AddExerciseToRoutinePayload,
): Promise<RoutineExercise> {
  const { data } = await apiClient.post<RoutineExercise>(
    `/routines/${routineId}/exercises`,
    payload,
  );
  return data;
}

async function logSet(sessionId: string, payload: LogSetPayload): Promise<WorkoutSet> {
  const { data } = await apiClient.post<WorkoutSet>(
    `/workout-sessions/${sessionId}/sets`,
    payload,
  );
  return data;
}

const gitfitService = {
  addExerciseToRoutine,
  logSet,
};

export default gitfitService;
