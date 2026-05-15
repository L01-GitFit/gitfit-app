import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ExternalExercise } from '../types/exercise.types';
import type { DraftRoutineExercise } from '@/store/routine.store';

export interface ActiveSet {
  id: string;
  exerciseDbId: string;
  exerciseName: string;
  gifUrl: string;
  previous?: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe?: number;
  isWarmup: boolean;
  isPr: boolean;
  isCompleted: boolean;
}

export interface ActiveExercise {
  id: string;
  externalExercise: ExternalExercise;
  sets: ActiveSet[];
}

interface WorkoutSessionState {
  sessionId: string | null;
  sessionName: string;
  startedAt: Date | null;
  exercises: ActiveExercise[];
  isMinimized: boolean;

  startSession: (id: string, name: string) => void;
  startSessionFromRoutine: (id: string, name: string, routineExercises: DraftRoutineExercise[]) => void;
  minimize: () => void;
  restore: () => void;
  addExercise: (exercise: ExternalExercise) => void;
  removeExercise: (entryId: string) => void;
  addSet: (
    entryId: string,
    set: Omit<ActiveSet, 'id' | 'isPr' | 'isCompleted'>,
  ) => void;
  toggleSet: (entryId: string, setNumber: number) => void;
  updateSet: (entryId: string, setNumber: number, data: Partial<ActiveSet>) => void;
  removeSet: (entryId: string, setNumber: number) => void;
  markSetAsPr: (entryId: string, setNumber: number) => void;
  reorderExercises: (from: number, to: number) => void;
  finishSession: () => void;
  resetSession: () => void;
}

const initialState = {
  sessionId: null,
  sessionName: '',
  startedAt: null,
  exercises: [],
  isMinimized: false,
};

export const useWorkoutSessionStore = create<WorkoutSessionState>()(
  devtools(
    immer((set) => ({
      ...initialState,

      startSession: (id, name) =>
        set((state) => {
          state.sessionId = id;
          state.sessionName = name;
          state.startedAt = new Date();
          state.isMinimized = false;
        }),

      startSessionFromRoutine: (id, name, routineExercises) =>
        set((state) => {
          state.sessionId = id;
          state.sessionName = name;
          state.startedAt = new Date();
          state.isMinimized = false;
          state.exercises = routineExercises.map((routineExercise) => ({
            id: `active-exercise-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            externalExercise: routineExercise.exercise,
            sets: routineExercise.sets.map((set) => ({
              id: `${routineExercise.exercise.exerciseId}-${Date.now()}-${set.setNumber}`,
              exerciseDbId: routineExercise.exercise.exerciseId,
              exerciseName: routineExercise.exercise.name,
              gifUrl: routineExercise.exercise.gifUrl,
              previous: '-',
              setNumber: set.setNumber,
              reps: set.reps ?? 0,
              weightKg: set.weightKg ?? 0,
              rpe: undefined,
              isWarmup: false,
              isPr: false,
              isCompleted: false,
            })),
          }));
        }),

      minimize: () => set((state) => { state.isMinimized = true; }),

      restore: () => set((state) => { state.isMinimized = false; }),

      addExercise: (exercise) =>
        set((state) => {
          state.exercises.push({
            id: `active-exercise-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            externalExercise: exercise,
            sets: [],
          });
        }),

      removeExercise: (entryId) =>
        set((state) => {
          state.exercises = state.exercises.filter((e) => e.id !== entryId);
        }),

      addSet: (entryId, setData) =>
        set((state) => {
          const exercise = state.exercises.find((e) => e.id === entryId);
          exercise?.sets.push({
            ...setData,
            id: `${entryId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            isPr: false,
            isCompleted: false,
          });
        }),

      updateSet: (entryId, setNumber, data) =>
        set((state) => {
          const exercise = state.exercises.find((e) => e.id === entryId);
          const target = exercise?.sets.find((s) => s.setNumber === setNumber);
          if (target) Object.assign(target, data);
        }),

      removeSet: (entryId, setNumber) =>
        set((state) => {
          const exercise = state.exercises.find((e) => e.id === entryId);
          if (exercise) {
            exercise.sets = exercise.sets
              .filter((s) => s.setNumber !== setNumber)
              .map((s, index) => ({
                ...s,
                setNumber: index + 1,
              }));
          }
        }),

      toggleSet: (entryId, setNumber) =>
        set((state) => {
          const exercise = state.exercises.find((e) => e.id === entryId);
          const target = exercise?.sets.find((s) => s.setNumber === setNumber);
          if (target) target.isCompleted = !target.isCompleted;
        }),

      markSetAsPr: (entryId, setNumber) =>
        set((state) => {
          const exercise = state.exercises.find((e) => e.id === entryId);
          const target = exercise?.sets.find((s) => s.setNumber === setNumber);
          if (target) target.isPr = true;
        }),

      reorderExercises: (from, to) =>
        set((state) => {
          const [moved] = state.exercises.splice(from, 1);
          state.exercises.splice(to, 0, moved);
        }),

      finishSession: () =>
        set((state) => {
          state.sessionId = null;
          state.startedAt = null;
        }),

      resetSession: () => set(() => ({ ...initialState })),
    })),
    { name: 'workoutSession' },
  ),
);

export const selectTotalSets = (state: WorkoutSessionState) =>
  state.exercises.reduce(
    (acc, e) => acc + e.sets.filter((s) => s.isCompleted).reduce((r, s) => r + s.reps, 0),
    0,
  );

export const selectTotalVolume = (state: WorkoutSessionState) =>
  state.exercises.reduce(
    (acc, e) =>
      acc + e.sets.filter((s) => s.isCompleted).reduce((s, set) => s + set.weightKg * set.reps, 0),
    0,
  );

export const selectExerciseByDbId =
  (exerciseDbId: string) => (state: WorkoutSessionState) =>
    state.exercises.find((e) => e.externalExercise.exerciseId === exerciseDbId);

export const selectHasActiveSession = (state: WorkoutSessionState) =>
  state.sessionId !== null;
