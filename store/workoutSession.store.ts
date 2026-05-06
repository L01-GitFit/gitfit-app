import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ExternalExercise } from '../types/exercise.types';

export interface ActiveSet {
  id: string;
  exerciseDbId: string;
  exerciseName: string;
  gifUrl: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe?: number;
  isWarmup: boolean;
  isPr: boolean;
  isCompleted: boolean;
}

export interface ActiveExercise {
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
  minimize: () => void;
  restore: () => void;
  addExercise: (exercise: ExternalExercise) => void;
  removeExercise: (exerciseDbId: string) => void;
  addSet: (
    exerciseDbId: string,
    set: Omit<ActiveSet, 'id' | 'isPr' | 'isCompleted'>,
  ) => void;
  toggleSet: (exerciseDbId: string, setNumber: number) => void;
  updateSet: (exerciseDbId: string, setNumber: number, data: Partial<ActiveSet>) => void;
  removeSet: (exerciseDbId: string, setNumber: number) => void;
  markSetAsPr: (exerciseDbId: string, setNumber: number) => void;
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

      minimize: () => set((state) => { state.isMinimized = true; }),

      restore: () => set((state) => { state.isMinimized = false; }),

      addExercise: (exercise) =>
        set((state) => {
          const exists = state.exercises.some(
            (e) => e.externalExercise.exerciseId === exercise.exerciseId,
          );
          if (!exists) {
            state.exercises.push({ externalExercise: exercise, sets: [] });
          }
        }),

      removeExercise: (exerciseDbId) =>
        set((state) => {
          state.exercises = state.exercises.filter(
            (e) => e.externalExercise.exerciseId !== exerciseDbId,
          );
        }),

      addSet: (exerciseDbId, setData) =>
        set((state) => {
          const exercise = state.exercises.find(
            (e) => e.externalExercise.exerciseId === exerciseDbId,
          );
          exercise?.sets.push({
            ...setData,
            id: `${exerciseDbId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            isPr: false,
            isCompleted: false,
          });
        }),

      updateSet: (exerciseDbId, setNumber, data) =>
        set((state) => {
          const exercise = state.exercises.find(
            (e) => e.externalExercise.exerciseId === exerciseDbId,
          );
          const target = exercise?.sets.find((s) => s.setNumber === setNumber);
          if (target) Object.assign(target, data);
        }),

      removeSet: (exerciseDbId, setNumber) =>
        set((state) => {
          const exercise = state.exercises.find(
            (e) => e.externalExercise.exerciseId === exerciseDbId,
          );
          if (exercise) {
            exercise.sets = exercise.sets
              .filter((s) => s.setNumber !== setNumber)
              .map((s, index) => ({
                ...s,
                setNumber: index + 1,
              }));
          }
        }),

      toggleSet: (exerciseDbId, setNumber) =>
        set((state) => {
          const exercise = state.exercises.find(
            (e) => e.externalExercise.exerciseId === exerciseDbId,
          );
          const target = exercise?.sets.find((s) => s.setNumber === setNumber);
          if (target) target.isCompleted = !target.isCompleted;
        }),

      markSetAsPr: (exerciseDbId, setNumber) =>
        set((state) => {
          const exercise = state.exercises.find(
            (e) => e.externalExercise.exerciseId === exerciseDbId,
          );
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
