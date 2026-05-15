import { renderHook, act } from '@testing-library/react-native';
import { useWorkoutSessionStore } from '@/store/workoutSession.store';
import type { DraftRoutineExercise } from '@/store/routine.store';
import type { ExternalExercise } from '@/types/exercise.types';

describe('useWorkoutSessionStore', () => {
  const mockExercise: ExternalExercise = {
    exerciseId: 'ex-1',
    name: 'Bench Press',
    gifUrl: 'https://example.com/bench.gif',
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
    useWorkoutSessionStore.setState({
      sessionId: null,
      sessionName: '',
      startedAt: null,
      exercises: [],
      isMinimized: false,
    });
  });

  describe('Initial state', () => {
    it('should start with no session', () => {
      const { result } = renderHook(() => useWorkoutSessionStore());
      expect(result.current.sessionId).toBeNull();
      expect(result.current.sessionName).toBe('');
      expect(result.current.startedAt).toBeNull();
    });

    it('should start with empty exercises', () => {
      const { result } = renderHook(() => useWorkoutSessionStore());
      expect(result.current.exercises).toEqual([]);
    });

    it('should start not minimized', () => {
      const { result } = renderHook(() => useWorkoutSessionStore());
      expect(result.current.isMinimized).toBe(false);
    });
  });

  describe('startSession', () => {
    it('should initialize session with id and name', () => {
      const { result } = renderHook(() => useWorkoutSessionStore());

      act(() => {
        result.current.startSession('session-123', 'Chest Day');
      });

      expect(result.current.sessionId).toBe('session-123');
      expect(result.current.sessionName).toBe('Chest Day');
      expect(result.current.startedAt).not.toBeNull();
      expect(result.current.isMinimized).toBe(false);
    });

    it('should set startedAt to current time', () => {
      const { result } = renderHook(() => useWorkoutSessionStore());
      const beforeTime = new Date();

      act(() => {
        result.current.startSession('session-123', 'Chest Day');
      });

      const afterTime = new Date();
      expect(result.current.startedAt).not.toBeNull();
      expect(result.current.startedAt!.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(result.current.startedAt!.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  describe('startSessionFromRoutine', () => {
    it('should initialize session from routine exercises', () => {
      const { result } = renderHook(() => useWorkoutSessionStore());

      const routineExercises: DraftRoutineExercise[] = [
        {
          id: 'draft-ex-1',
          exercise: mockExercise,
          notes: 'Test notes',
          sets: [
            { id: 'set-1', setNumber: 1, weightKg: 50, reps: 10 },
          ],
        },
      ];

      act(() => {
        result.current.startSessionFromRoutine('session-123', 'Routine Session', routineExercises);
      });

      expect(result.current.sessionId).toBe('session-123');
      expect(result.current.sessionName).toBe('Routine Session');
      expect(result.current.exercises).toHaveLength(1);
      expect(result.current.exercises[0].externalExercise).toEqual(mockExercise);
      expect(result.current.exercises[0].sets).toHaveLength(1);
    });

    it('should set sets with proper default values', () => {
      const { result } = renderHook(() => useWorkoutSessionStore());

      const routineExercises: DraftRoutineExercise[] = [
        {
          id: 'draft-ex-1',
          exercise: mockExercise,
          notes: '',
          sets: [
            { id: 'set-1', setNumber: 1, weightKg: 50, reps: 10 },
            { id: 'set-2', setNumber: 2, weightKg: 50, reps: 10 },
          ],
        },
      ];

      act(() => {
        result.current.startSessionFromRoutine('session-123', 'Test', routineExercises);
      });

      const sets = result.current.exercises[0].sets;
      expect(sets[0]).toMatchObject({
        setNumber: 1,
        reps: 10,
        weightKg: 50,
        isWarmup: false,
        isPr: false,
        isCompleted: false,
      });
    });

    it('should handle null weight and reps with defaults', () => {
      const { result } = renderHook(() => useWorkoutSessionStore());

      const routineExercises: DraftRoutineExercise[] = [
        {
          id: 'draft-ex-1',
          exercise: mockExercise,
          notes: '',
          sets: [
            { id: 'set-1', setNumber: 1, weightKg: null, reps: null },
          ],
        },
      ];

      act(() => {
        result.current.startSessionFromRoutine('session-123', 'Test', routineExercises);
      });

      const sets = result.current.exercises[0].sets;
      expect(sets[0].weightKg).toBe(0);
      expect(sets[0].reps).toBe(0);
    });
  });

  describe('minimize and restore', () => {
    it('should set isMinimized to true', () => {
      const { result } = renderHook(() => useWorkoutSessionStore());

      act(() => {
        result.current.startSession('session-123', 'Test');
        result.current.minimize();
      });

      expect(result.current.isMinimized).toBe(true);
    });

    it('should restore isMinimized to false', () => {
      const { result } = renderHook(() => useWorkoutSessionStore());

      act(() => {
        result.current.startSession('session-123', 'Test');
        result.current.minimize();
        result.current.restore();
      });

      expect(result.current.isMinimized).toBe(false);
    });
  });

  describe('addExercise', () => {
    it('should add exercise to session', () => {
      const { result } = renderHook(() => useWorkoutSessionStore());

      act(() => {
        result.current.addExercise(mockExercise);
      });

      expect(result.current.exercises).toHaveLength(1);
      expect(result.current.exercises[0].externalExercise).toEqual(mockExercise);
      expect(result.current.exercises[0].sets).toEqual([]);
    });

    it('should add multiple exercises', () => {
      const { result } = renderHook(() => useWorkoutSessionStore());

      act(() => {
        result.current.addExercise(mockExercise);
        result.current.addExercise(mockExercise2);
      });

      expect(result.current.exercises).toHaveLength(2);
    });
  });

  describe('removeExercise', () => {
    it('should remove exercise by id', () => {
      const { result } = renderHook(() => useWorkoutSessionStore());

      act(() => {
        result.current.addExercise(mockExercise);
      });

      const exerciseId = result.current.exercises[0].id;

      act(() => {
        result.current.removeExercise(exerciseId);
      });

      expect(result.current.exercises).toHaveLength(0);
    });
  });

  describe('addSet', () => {
    it('should add set to exercise', () => {
      const { result } = renderHook(() => useWorkoutSessionStore());

      act(() => {
        result.current.addExercise(mockExercise);
      });

      const exerciseId = result.current.exercises[0].id;

      act(() => {
        result.current.addSet(exerciseId, {
          exerciseDbId: 'ex-1',
          exerciseName: 'Bench Press',
          gifUrl: 'https://example.com/bench.gif',
          setNumber: 1,
          reps: 10,
          weightKg: 50,
          isWarmup: false,
        });
      });

      expect(result.current.exercises[0].sets).toHaveLength(1);
      expect(result.current.exercises[0].sets[0]).toMatchObject({
        setNumber: 1,
        reps: 10,
        weightKg: 50,
        isPr: false,
        isCompleted: false,
      });
    });
  });

  describe('updateSet', () => {
    it('should update set data', () => {
      const { result } = renderHook(() => useWorkoutSessionStore());

      act(() => {
        result.current.addExercise(mockExercise);
      });

      const exerciseId = result.current.exercises[0].id;

      act(() => {
        result.current.addSet(exerciseId, {
          exerciseDbId: 'ex-1',
          exerciseName: 'Bench Press',
          gifUrl: 'https://example.com/bench.gif',
          setNumber: 1,
          reps: 10,
          weightKg: 50,
          isWarmup: false,
        });
      });

      act(() => {
        result.current.updateSet(exerciseId, 1, {
          reps: 12,
          weightKg: 55,
          isCompleted: true,
        });
      });

      expect(result.current.exercises[0].sets[0]).toMatchObject({
        reps: 12,
        weightKg: 55,
        isCompleted: true,
      });
    });
  });

  describe('removeSet', () => {
    it('should remove set and renumber remaining sets', () => {
      const { result } = renderHook(() => useWorkoutSessionStore());

      act(() => {
        result.current.addExercise(mockExercise);
      });

      const exerciseId = result.current.exercises[0].id;

      act(() => {
        result.current.addSet(exerciseId, {
          exerciseDbId: 'ex-1',
          exerciseName: 'Bench',
          gifUrl: 'https://example.com/bench.gif',
          setNumber: 1,
          reps: 10,
          weightKg: 50,
          isWarmup: false,
        });
        result.current.addSet(exerciseId, {
          exerciseDbId: 'ex-1',
          exerciseName: 'Bench',
          gifUrl: 'https://example.com/bench.gif',
          setNumber: 2,
          reps: 10,
          weightKg: 50,
          isWarmup: false,
        });
        result.current.addSet(exerciseId, {
          exerciseDbId: 'ex-1',
          exerciseName: 'Bench',
          gifUrl: 'https://example.com/bench.gif',
          setNumber: 3,
          reps: 10,
          weightKg: 50,
          isWarmup: false,
        });
      });

      act(() => {
        result.current.removeSet(exerciseId, 2);
      });

      expect(result.current.exercises[0].sets).toHaveLength(2);
      expect(result.current.exercises[0].sets[0].setNumber).toBe(1);
      expect(result.current.exercises[0].sets[1].setNumber).toBe(2);
    });
  });

  describe('toggleSet', () => {
    it('should toggle isCompleted for a set', () => {
      const { result } = renderHook(() => useWorkoutSessionStore());

      act(() => {
        result.current.addExercise(mockExercise);
      });

      const exerciseId = result.current.exercises[0].id;

      act(() => {
        result.current.addSet(exerciseId, {
          exerciseDbId: 'ex-1',
          exerciseName: 'Bench',
          gifUrl: 'https://example.com/bench.gif',
          setNumber: 1,
          reps: 10,
          weightKg: 50,
          isWarmup: false,
        });
      });

      expect(result.current.exercises[0].sets[0].isCompleted).toBe(false);

      act(() => {
        result.current.toggleSet(exerciseId, 1);
      });

      expect(result.current.exercises[0].sets[0].isCompleted).toBe(true);
    });
  });

  describe('markSetAsPr', () => {
    it('should mark set as personal record', () => {
      const { result } = renderHook(() => useWorkoutSessionStore());

      act(() => {
        result.current.addExercise(mockExercise);
      });

      const exerciseId = result.current.exercises[0].id;

      act(() => {
        result.current.addSet(exerciseId, {
          exerciseDbId: 'ex-1',
          exerciseName: 'Bench',
          gifUrl: 'https://example.com/bench.gif',
          setNumber: 1,
          reps: 10,
          weightKg: 50,
          isWarmup: false,
        });
      });

      act(() => {
        result.current.markSetAsPr(exerciseId, 1);
      });

      expect(result.current.exercises[0].sets[0].isPr).toBe(true);
    });
  });

  describe('reorderExercises', () => {
    it('should reorder exercises', () => {
      const { result } = renderHook(() => useWorkoutSessionStore());

      act(() => {
        result.current.addExercise(mockExercise);
        result.current.addExercise(mockExercise2);
      });

      const firstExerciseId = result.current.exercises[0].id;
      const secondExerciseId = result.current.exercises[1].id;

      act(() => {
        result.current.reorderExercises(0, 1);
      });

      expect(result.current.exercises[0].id).toBe(secondExerciseId);
      expect(result.current.exercises[1].id).toBe(firstExerciseId);
    });
  });

  describe('finishSession', () => {
    it('should clear session metadata but retain exercises data', () => {
      const { result } = renderHook(() => useWorkoutSessionStore());

      act(() => {
        result.current.startSession('session-123', 'Test');
        result.current.addExercise(mockExercise);
      });

      expect(result.current.sessionId).not.toBeNull();
      expect(result.current.exercises).toHaveLength(1);

      act(() => {
        result.current.finishSession();
      });

      expect(result.current.sessionId).toBeNull();
      expect(result.current.startedAt).toBeNull();
      expect(result.current.exercises).toHaveLength(1);
    });
  });

  describe('resetSession', () => {
    it('should reset to initial state', () => {
      const { result } = renderHook(() => useWorkoutSessionStore());

      act(() => {
        result.current.startSession('session-123', 'Test');
        result.current.addExercise(mockExercise);
        result.current.minimize();
      });

      act(() => {
        result.current.resetSession();
      });

      expect(result.current.sessionId).toBeNull();
      expect(result.current.sessionName).toBe('');
      expect(result.current.startedAt).toBeNull();
      expect(result.current.exercises).toEqual([]);
      expect(result.current.isMinimized).toBe(false);
    });
  });
});
