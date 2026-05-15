import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ExternalExercise } from '@/types/exercise.types';

export interface DraftRoutineSet {
  id: string;
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
}

export interface DraftRoutineExercise {
  id: string;
  exercise: ExternalExercise;
  notes: string;
  sets: DraftRoutineSet[];
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  exercises: DraftRoutineExercise[];
  createdAt: string;
}

interface RoutineState {
  routines: WorkoutRoutine[];
  draftName: string;
  draftExercises: DraftRoutineExercise[];

  startDraft: (name?: string) => void;
  setDraftName: (name: string) => void;
  addExerciseToDraft: (exercise: ExternalExercise) => void;
  removeExerciseFromDraft: (draftExerciseId: string) => void;
  updateDraftExerciseNotes: (draftExerciseId: string, notes: string) => void;
  addSetToDraftExercise: (draftExerciseId: string) => void;
  updateDraftSet: (
    draftExerciseId: string,
    setNumber: number,
    data: Partial<Pick<DraftRoutineSet, 'weightKg' | 'reps'>>,
  ) => void;
  removeDraftSet: (draftExerciseId: string, setNumber: number) => void;
  saveDraft: () => WorkoutRoutine | null;
  discardDraft: () => void;
}

const initialDraftName = 'New Routine';

export const useRoutineStore = create<RoutineState>()(
  devtools(
    immer((set, get) => ({
      routines: [],
      draftName: initialDraftName,
      draftExercises: [],

      startDraft: (name) =>
        set((state) => {
          state.draftName = name?.trim() || initialDraftName;
          state.draftExercises = [];
        }),

      setDraftName: (name) =>
        set((state) => {
          state.draftName = name;
        }),

      addExerciseToDraft: (exercise) =>
        set((state) => {
          state.draftExercises.push({
            id: `draft-exercise-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            exercise,
            notes: '',
            sets: [],
          });
        }),

      removeExerciseFromDraft: (draftExerciseId) =>
        set((state) => {
          state.draftExercises = state.draftExercises.filter((e) => e.id !== draftExerciseId);
        }),

      updateDraftExerciseNotes: (draftExerciseId, notes) =>
        set((state) => {
          const draftExercise = state.draftExercises.find(
            (entry) => entry.id === draftExerciseId,
          );
          if (draftExercise) {
            draftExercise.notes = notes;
          }
        }),

      addSetToDraftExercise: (draftExerciseId) =>
        set((state) => {
          const draftExercise = state.draftExercises.find(
            (entry) => entry.id === draftExerciseId,
          );
          if (!draftExercise) return;

          const nextSetNumber = (draftExercise.sets[draftExercise.sets.length - 1]?.setNumber ?? 0) + 1;
          draftExercise.sets.push({
            id: `${draftExerciseId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            setNumber: nextSetNumber,
            weightKg: null,
            reps: null,
          });
        }),

      updateDraftSet: (draftExerciseId, setNumber, data) =>
        set((state) => {
          const draftExercise = state.draftExercises.find(
            (entry) => entry.id === draftExerciseId,
          );
          const targetSet = draftExercise?.sets.find((set) => set.setNumber === setNumber);
          if (targetSet) {
            Object.assign(targetSet, data);
          }
        }),

      removeDraftSet: (draftExerciseId, setNumber) =>
        set((state) => {
          const draftExercise = state.draftExercises.find(
            (entry) => entry.id === draftExerciseId,
          );
          if (!draftExercise) return;

          draftExercise.sets = draftExercise.sets
            .filter((set) => set.setNumber !== setNumber)
            .map((set, index) => ({
              ...set,
              setNumber: index + 1,
            }));
        }),

      saveDraft: () => {
        const { draftName, draftExercises } = get();
        const trimmedName = draftName.trim();

        if (!trimmedName || draftExercises.length === 0) {
          return null;
        }

        const routine: WorkoutRoutine = {
          id: `routine-${Date.now()}`,
          name: trimmedName,
          exercises: draftExercises,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          state.routines.unshift(routine);
          state.draftName = initialDraftName;
          state.draftExercises = [];
        });

        return routine;
      },

      discardDraft: () =>
        set((state) => {
          state.draftName = initialDraftName;
          state.draftExercises = [];
        }),
    })),
    { name: 'routineStore' },
  ),
);