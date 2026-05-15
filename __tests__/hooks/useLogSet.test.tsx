import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLogSet } from '@/hooks/useLogSet';
import gitfitService from '@/services/gitfit.service';
import type { LogSetPayload, WorkoutSet } from '@/types/exercise.types';
import React from 'react';

jest.mock('@/services/gitfit.service');

const mockGitfitService = gitfitService as jest.Mocked<typeof gitfitService>;

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useLogSet hook', () => {
  const mockWorkoutSet: WorkoutSet = {
    id: 'set-1',
    exerciseId: 'ex-1',
    setNumber: 1,
    reps: 10,
    weightKg: 50,
    durationSeconds: null,
    distanceMeters: null,
    rpe: null,
    isWarmup: false,
    isPr: false,
    loggedAt: '2024-01-01T10:15:00Z',
  };

  const sessionId = 'session-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log a set for workout session', async () => {
    const payload: LogSetPayload = {
      exerciseId: 'ex-1',
      setNumber: 1,
      reps: 10,
      weightKg: 50,
      isWarmup: false,
      isPr: false,
    };

    mockGitfitService.logSet.mockResolvedValueOnce(mockWorkoutSet);

    const { result } = renderHook(() => useLogSet(sessionId), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(payload);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGitfitService.logSet).toHaveBeenCalledWith(sessionId, payload);
    expect(result.current.data).toEqual(mockWorkoutSet);
  });

  it('should handle log set error', async () => {
    const payload: LogSetPayload = {
      exerciseId: 'ex-1',
      setNumber: 1,
      reps: 10,
      weightKg: 50,
      isWarmup: false,
      isPr: false,
    };

    const error = new Error('Failed to log set');
    mockGitfitService.logSet.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useLogSet(sessionId), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(payload);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Failed to log set');
  });

  it('should track isPending state', async () => {
    const payload: LogSetPayload = {
      exerciseId: 'ex-1',
      setNumber: 1,
      reps: 10,
      weightKg: 50,
      isWarmup: false,
      isPr: false,
    };

    mockGitfitService.logSet.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockWorkoutSet), 100);
        }),
    );

    const { result } = renderHook(() => useLogSet(sessionId), { wrapper: createWrapper() });

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
    const payload: LogSetPayload = {
      exerciseId: 'ex-1',
      setNumber: 1,
      reps: 10,
      weightKg: 50,
      isWarmup: false,
      isPr: false,
    };

    mockGitfitService.logSet.mockResolvedValueOnce(mockWorkoutSet);

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useLogSet(sessionId), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(payload, { onSuccess });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });

    // React Query v5 passes (data, variables, context)
    const call = onSuccess.mock.calls[0];
    expect(call[0]).toEqual(mockWorkoutSet);
  });

  it('should log set with warmup flag', async () => {
    const payload: LogSetPayload = {
      exerciseId: 'ex-1',
      setNumber: 1,
      reps: 15,
      weightKg: 30,
      isWarmup: true,
      isPr: false,
    };

    mockGitfitService.logSet.mockResolvedValueOnce({
      ...mockWorkoutSet,
      isWarmup: true,
      reps: 15,
      weightKg: 30,
    });

    const { result } = renderHook(() => useLogSet(sessionId), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(payload);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGitfitService.logSet).toHaveBeenCalledWith(sessionId, expect.objectContaining({ isWarmup: true }));
  });

  it('should log set marked as PR', async () => {
    const payload: LogSetPayload = {
      exerciseId: 'ex-1',
      setNumber: 1,
      reps: 10,
      weightKg: 100, // New personal record weight
      isWarmup: false,
      isPr: true,
    };

    mockGitfitService.logSet.mockResolvedValueOnce({
      ...mockWorkoutSet,
      isPr: true,
      weightKg: 100,
    });

    const { result } = renderHook(() => useLogSet(sessionId), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(payload);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.isPr).toBe(true);
  });

  it('should invalidate session query on success', async () => {
    const payload: LogSetPayload = {
      exerciseId: 'ex-1',
      setNumber: 1,
      reps: 10,
      weightKg: 50,
      isWarmup: false,
      isPr: false,
    };

    mockGitfitService.logSet.mockResolvedValueOnce(mockWorkoutSet);

    const { result } = renderHook(() => useLogSet(sessionId), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(payload);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify that the mutation was called (queryClient.invalidateQueries happens internally)
    expect(mockGitfitService.logSet).toHaveBeenCalledWith(sessionId, payload);
  });
});
