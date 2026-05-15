import { renderHook, act } from '@testing-library/react-native';
import { useRoutineStore, type WorkoutRoutine } from '@/store/routine.store';
import type { ExternalExercise } from '@/types/exercise.types';

describe('useRoutineStore', () => {
  const mockExercise: ExternalExercise = {
    exerciseId: 'ex-1',
    name: 'Push-ups',
    gifUrl: 'https://example.com/pushups.gif',
    bodyParts: ['chest'],
    targetMuscles: ['pectoralis'],
  };

  const mockExercise2: ExternalExercise = {
    exerciseId: 'ex-2',
    name: 'Squats',
    gifUrl: 'https://example.com/squats.gif',
    bodyParts: ['legs'],
    targetMuscles: ['quadriceps'],
  };

  beforeEach(() => {
    useRoutineStore.setState({
      routines: [],
      draftName: 'New Routine',
      draftExercises: [],
    });
  });

  describe('Initial state', () => {
    it('should start with empty routines', () => {
      const { result } = renderHook(() => useRoutineStore());
      expect(result.current.routines).toEqual([]);
    });

    it('should start with default draft name', () => {
      const { result } = renderHook(() => useRoutineStore());
      expect(result.current.draftName).toBe('New Routine');
    });

    it('should start with empty draft exercises', () => {
      const { result } = renderHook(() => useRoutineStore());
      expect(result.current.draftExercises).toEqual([]);
    });
  });

  describe('startDraft', () => {
    it('should initialize draft with default name when no name provided', () => {
      const { result } = renderHook(() => useRoutineStore());

      act(() => {
        result.current.startDraft();
      });

      expect(result.current.draftName).toBe('New Routine');
      expect(result.current.draftExercises).toEqual([]);
    });

    it('should initialize draft with custom name', () => {
      const { result } = renderHook(() => useRoutineStore());

      act(() => {
        result.current.startDraft('My Workout');
      });

      expect(result.current.draftName).toBe('My Workout');
    });

    it('should trim whitespace from name', () => {
      const { result } = renderHook(() => useRoutineStore());

      act(() => {
        result.current.startDraft('  Chest Day  ');
      });

      expect(result.current.draftName).toBe('Chest Day');
    });

    it('should reset draft exercises', () => {
      const { result } = renderHook(() => useRoutineStore());

      act(() => {
        result.current.startDraft('Routine 1');
        result.current.addExerciseToDraft(mockExercise);
      });

      expect(result.current.draftExercises).toHaveLength(1);

      act(() => {
        result.current.startDraft('Routine 2');
      });

      expect(result.current.draftName).toBe('Routine 2');
      expect(result.current.draftExercises).toEqual([]);
    });
  });

  describe('setDraftName', () => {
    it('should update draft name', () => {
      const { result } = renderHook(() => useRoutineStore());

      act(() => {
        result.current.setDraftName('Upper Body');
      });

      expect(result.current.draftName).toBe('Upper Body');
    });
  });

  describe('addExerciseToDraft', () => {
    it('should add exercise to draft', () => {
      const { result } = renderHook(() => useRoutineStore());

      act(() => {
        result.current.addExerciseToDraft(mockExercise);
      });

      expect(result.current.draftExercises).toHaveLength(1);
      expect(result.current.draftExercises[0].exercise).toEqual(mockExercise);
      expect(result.current.draftExercises[0].notes).toBe('');
      expect(result.current.draftExercises[0].sets).toEqual([]);
    });

    it('should generate unique IDs for each added exercise', () => {
      const { result } = renderHook(() => useRoutineStore());

      act(() => {
        result.current.addExerciseToDraft(mockExercise);
        result.current.addExerciseToDraft(mockExercise2);
      });

      expect(result.current.draftExercises).toHaveLength(2);
      expect(result.current.draftExercises[0].id).not.toBe(result.current.draftExercises[1].id);
    });

    it('should add multiple exercises', () => {
      const { result } = renderHook(() => useRoutineStore());

      act(() => {
        result.current.addExerciseToDraft(mockExercise);
        result.current.addExerciseToDraft(mockExercise2);
      });

      expect(result.current.draftExercises).toHaveLength(2);
    });
  });

  describe('removeExerciseFromDraft', () => {
    it('should remove exercise by ID', () => {
      const { result } = renderHook(() => useRoutineStore());

      act(() => {
        result.current.addExerciseToDraft(mockExercise);
      });

      expect(result.current.draftExercises).toHaveLength(1);

      const exerciseId = result.current.draftExercises[0].id;

      act(() => {
        result.current.removeExerciseFromDraft(exerciseId);
      });

      expect(result.current.draftExercises).toHaveLength(0);
    });

    it('should not crash when removing non-existent exercise', () => {
      const { result } = renderHook(() => useRoutineStore());

      expect(() => {
        act(() => {
          result.current.removeExerciseFromDraft('non-existent-id');
        });
      }).not.toThrow();
    });
  });

  describe('updateDraftExerciseNotes', () => {
    it('should update notes for specific exercise', () => {
      const { result } = renderHook(() => useRoutineStore());

      act(() => {
        result.current.addExerciseToDraft(mockExercise);
      });

      const exerciseId = result.current.draftExercises[0].id;

      act(() => {
        result.current.updateDraftExerciseNotes(exerciseId, 'Do 3 sets');
      });

      expect(result.current.draftExercises[0].notes).toBe('Do 3 sets');
    });

    it('should not crash when updating non-existent exercise', () => {
      const { result } = renderHook(() => useRoutineStore());

      expect(() => {
        act(() => {
          result.current.updateDraftExerciseNotes('non-existent-id', 'Notes');
        });
      }).not.toThrow();
    });
  });

  describe('addSetToDraftExercise', () => {
    it('should add set to exercise', () => {
      const { result } = renderHook(() => useRoutineStore());

      act(() => {
        result.current.addExerciseToDraft(mockExercise);
      });

      const exerciseId = result.current.draftExercises[0].id;

      act(() => {
        result.current.addSetToDraftExercise(exerciseId);
      });

      expect(result.current.draftExercises[0].sets).toHaveLength(1);
      expect(result.current.draftExercises[0].sets[0].setNumber).toBe(1);
    });

    it('should increment set number for each new set', () => {
      const { result } = renderHook(() => useRoutineStore());

      act(() => {
        result.current.addExerciseToDraft(mockExercise);
      });

      const exerciseId = result.current.draftExercises[0].id;

      act(() => {
        result.current.addSetToDraftExercise(exerciseId);
        result.current.addSetToDraftExercise(exerciseId);
        result.current.addSetToDraftExercise(exerciseId);
      });

      expect(result.current.draftExercises[0].sets).toHaveLength(3);
      expect(result.current.draftExercises[0].sets[0].setNumber).toBe(1);
      expect(result.current.draftExercises[0].sets[1].setNumber).toBe(2);
      expect(result.current.draftExercises[0].sets[2].setNumber).toBe(3);
    });
  });

  describe('updateDraftSet', () => {
    it('should update weight and reps for specific set', () => {
      const { result } = renderHook(() => useRoutineStore());

      act(() => {
        result.current.addExerciseToDraft(mockExercise);
      });

      const exerciseId = result.current.draftExercises[0].id;

      act(() => {
        result.current.addSetToDraftExercise(exerciseId);
      });

      act(() => {
        result.current.updateDraftSet(exerciseId, 1, { weightKg: 50, reps: 10 });
      });

      expect(result.current.draftExercises[0].sets[0].weightKg).toBe(50);
      expect(result.current.draftExercises[0].sets[0].reps).toBe(10);
    });

    it('should update only weight', () => {
      const { result } = renderHook(() => useRoutineStore());

      act(() => {
        result.current.addExerciseToDraft(mockExercise);
      });

      const exerciseId = result.current.draftExercises[0].id;

      act(() => {
        result.current.addSetToDraftExercise(exerciseId);
      });

      act(() => {
        result.current.updateDraftSet(exerciseId, 1, { weightKg: 60 });
      });

      expect(result.current.draftExercises[0].sets[0].weightKg).toBe(60);
      expect(result.current.draftExercises[0].sets[0].reps).toBeNull();
    });
  });

  describe('removeDraftSet', () => {
    it('should remove set and renumber remaining sets', () => {
      const { result } = renderHook(() => useRoutineStore());

      act(() => {
        result.current.addExerciseToDraft(mockExercise);
      });

      const exerciseId = result.current.draftExercises[0].id;

      act(() => {
        result.current.addSetToDraftExercise(exerciseId);
        result.current.addSetToDraftExercise(exerciseId);
        result.current.addSetToDraftExercise(exerciseId);
      });

      act(() => {
        result.current.removeDraftSet(exerciseId, 2);
      });

      expect(result.current.draftExercises[0].sets).toHaveLength(2);
      expect(result.current.draftExercises[0].sets[0].setNumber).toBe(1);
      expect(result.current.draftExercises[0].sets[1].setNumber).toBe(2);
    });
  });

  describe('saveDraft', () => {
    it('should save valid draft to routines', () => {
      const { result } = renderHook(() => useRoutineStore());

      act(() => {
        result.current.startDraft('Gym Routine');
        result.current.addExerciseToDraft(mockExercise);
      });

      const exerciseId = result.current.draftExercises[0].id;

      act(() => {
        result.current.addSetToDraftExercise(exerciseId);
      });

      let savedRoutine: WorkoutRoutine | null = null;

      act(() => {
        savedRoutine = result.current.saveDraft();
      });

      expect(savedRoutine).not.toBeNull();
      expect(savedRoutine?.name).toBe('Gym Routine');
      expect(savedRoutine?.exercises).toHaveLength(1);
      expect(result.current.routines).toHaveLength(1);
    });

    it('should return null for empty draft', () => {
      const { result } = renderHook(() => useRoutineStore());

      let savedRoutine: WorkoutRoutine | null = null;

      act(() => {
        result.current.startDraft('');
        savedRoutine = result.current.saveDraft();
      });

      expect(savedRoutine).toBeNull();
      expect(result.current.routines).toHaveLength(0);
    });

    it('should return null when no exercises', () => {
      const { result } = renderHook(() => useRoutineStore());

      let savedRoutine: WorkoutRoutine | null = null;

      act(() => {
        result.current.startDraft('Empty Routine');
        savedRoutine = result.current.saveDraft();
      });

      expect(savedRoutine).toBeNull();
      expect(result.current.routines).toHaveLength(0);
    });
  });

  describe('discardDraft', () => {
    it('should clear draft data', () => {
      const { result } = renderHook(() => useRoutineStore());

      act(() => {
        result.current.startDraft('Routine');
        result.current.addExerciseToDraft(mockExercise);
      });

      expect(result.current.draftExercises).toHaveLength(1);

      act(() => {
        result.current.discardDraft();
      });

      expect(result.current.draftName).toBe('New Routine');
      expect(result.current.draftExercises).toEqual([]);
    });
  });
});
