import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAddExerciseToRoutine } from '@/hooks/useAddExerciseToRoutine';
import gitfitService from '@/services/gitfit.service';
import type { AddExerciseToRoutinePayload, RoutineExercise } from '@/services/gitfit.service';
import React from 'react';

jest.mock('@/services/gitfit.service');

const mockGitfitService = gitfitService as jest.Mocked<typeof gitfitService>;

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useAddExerciseToRoutine hook', () => {
  const routineId = 'routine-123';

  const mockRoutineExercise: RoutineExercise = {
    id: 'routine-ex-1',
    routineId: routineId,
    exerciseId: 'ex-1',
    exercise: {
      id: 'ex-1',
      name: 'Bench Press',
      gifUrl: 'https://example.com/bench.gif',
    },
    sets: 3,
    repsTarget: '8-10',
    weightTarget: 50,
    restSeconds: 90,
    orderIndex: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add exercise to routine', async () => {
    const payload: AddExerciseToRoutinePayload = {
      exerciseId: 'ex-1',
      sets: 3,
      repsTarget: '8-10',
      weightTarget: 50,
      restSeconds: 90,
    };

    mockGitfitService.addExerciseToRoutine.mockResolvedValueOnce(mockRoutineExercise);

    const { result } = renderHook(() => useAddExerciseToRoutine(routineId), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(payload);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGitfitService.addExerciseToRoutine).toHaveBeenCalledWith(routineId, payload);
    expect(result.current.data).toEqual(mockRoutineExercise);
  });

  it('should handle add exercise error', async () => {
    const payload: AddExerciseToRoutinePayload = {
      exerciseId: 'ex-invalid',
      sets: 3,
    };

    const error = new Error('Exercise not found');
    mockGitfitService.addExerciseToRoutine.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useAddExerciseToRoutine(routineId), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(payload);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Exercise not found');
  });

  it('should track isPending state', async () => {
    const payload: AddExerciseToRoutinePayload = {
      exerciseId: 'ex-1',
      sets: 3,
    };

    mockGitfitService.addExerciseToRoutine.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockRoutineExercise), 100);
        }),
    );

    const { result } = renderHook(() => useAddExerciseToRoutine(routineId), { wrapper: createWrapper() });

    expect(result.current.isPending).toBe(false);

    await act(async () => {
      result.current.mutate(payload);
      // Give React Query time to update isPending
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });

  it('should support onSuccess callback', async () => {
    const payload: AddExerciseToRoutinePayload = {
      exerciseId: 'ex-1',
      sets: 3,
      repsTarget: '8-10',
    };

    mockGitfitService.addExerciseToRoutine.mockResolvedValueOnce(mockRoutineExercise);

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useAddExerciseToRoutine(routineId), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(payload, { onSuccess });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });

    // React Query v5 passes (data, variables, context)
    const call = onSuccess.mock.calls[0];
    expect(call[0]).toEqual(mockRoutineExercise);
  });

  it('should support onError callback', async () => {
    const payload: AddExerciseToRoutinePayload = {
      exerciseId: 'ex-1',
      sets: 3,
    };

    const error = new Error('Failed to add exercise');
    mockGitfitService.addExerciseToRoutine.mockRejectedValueOnce(error);

    const onError = jest.fn();
    const { result } = renderHook(() => useAddExerciseToRoutine(routineId), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(payload, { onError });
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });

    // React Query v5 passes (error, variables, context)
    const call = onError.mock.calls[0];
    expect(call[0]?.message).toBe('Failed to add exercise');
  });

  it('should add exercise with full payload', async () => {
    const payload: AddExerciseToRoutinePayload = {
      exerciseId: 'ex-2',
      sets: 4,
      repsTarget: '12-15',
      weightTarget: 40,
      restSeconds: 60,
    };

    const expectedResult: RoutineExercise = {
      ...mockRoutineExercise,
      ...payload,
      id: 'routine-ex-2',
      exerciseId: 'ex-2',
      exercise: {
        id: 'ex-2',
        name: 'Dumbbell Curl',
        gifUrl: 'https://example.com/curl.gif',
      },
    };

    mockGitfitService.addExerciseToRoutine.mockResolvedValueOnce(expectedResult);

    const { result } = renderHook(() => useAddExerciseToRoutine(routineId), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(payload);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGitfitService.addExerciseToRoutine).toHaveBeenCalledWith(routineId, expect.objectContaining({
      exerciseId: 'ex-2',
      sets: 4,
      repsTarget: '12-15',
      weightTarget: 40,
      restSeconds: 60,
    }));
  });

  it('should add exercise with minimal payload', async () => {
    const payload: AddExerciseToRoutinePayload = {
      exerciseId: 'ex-3',
    };

    mockGitfitService.addExerciseToRoutine.mockResolvedValueOnce({
      ...mockRoutineExercise,
      exerciseId: 'ex-3',
      sets: null,
      repsTarget: null,
      weightTarget: null,
      restSeconds: null,
    });

    const { result } = renderHook(() => useAddExerciseToRoutine(routineId), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(payload);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGitfitService.addExerciseToRoutine).toHaveBeenCalledWith(routineId, {
      exerciseId: 'ex-3',
    });
  });
});
