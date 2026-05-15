import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useExercisesByBodyPart } from '@/hooks/useExercisesByBodyPart';
import exerciseDbService from '@/services/exercisedb.service';
import type { PaginatedResponse, ExternalExercise } from '@/types/exercise.types';
import React from 'react';

jest.mock('@/services/exercisedb.service');

const mockExerciseDbService = exerciseDbService as jest.Mocked<typeof exerciseDbService>;

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useExercisesByBodyPart hook', () => {
  const mockExercises: ExternalExercise[] = [
    {
      exerciseId: 'ex-1',
      name: 'Push-ups',
      gifUrl: 'https://example.com/pushups.gif',
      bodyParts: ['chest'],
      targetMuscles: ['pectoralis'],
    },
    {
      exerciseId: 'ex-2',
      name: 'Dips',
      gifUrl: 'https://example.com/dips.gif',
      bodyParts: ['chest'],
      targetMuscles: ['pectoralis'],
    },
  ];

  const mockPaginatedResponse: PaginatedResponse<ExternalExercise> = {
    success: true,
    data: mockExercises,
    meta: {
      total: 100,
      page: 1,
      limit: 10,
      totalPages: 10,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch exercises by body part', async () => {
    mockExerciseDbService.getExercisesByBodyPart.mockResolvedValueOnce(mockPaginatedResponse);

    const { result } = renderHook(() => useExercisesByBodyPart('chest', 1), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockExerciseDbService.getExercisesByBodyPart).toHaveBeenCalledWith('chest', 1);
    expect(result.current.data).toEqual(mockPaginatedResponse);
  });

  it('should not fetch when bodyPart is empty string', async () => {
    const { result } = renderHook(() => useExercisesByBodyPart(''), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockExerciseDbService.getExercisesByBodyPart).not.toHaveBeenCalled();
  });

  it('should handle fetch error', async () => {
    const error = new Error('API Error');
    mockExerciseDbService.getExercisesByBodyPart.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useExercisesByBodyPart('chest', 1), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });

  it('should use default page when not provided', async () => {
    mockExerciseDbService.getExercisesByBodyPart.mockResolvedValueOnce(mockPaginatedResponse);

    const { result } = renderHook(() => useExercisesByBodyPart('back'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockExerciseDbService.getExercisesByBodyPart).toHaveBeenCalledWith('back', 1);
  });

  it('should update query when bodyPart changes', async () => {
    const chestResponse: PaginatedResponse<ExternalExercise> = {
      ...mockPaginatedResponse,
      data: mockExercises,
    };

    const backResponse: PaginatedResponse<ExternalExercise> = {
      ...mockPaginatedResponse,
      data: [
        {
          exerciseId: 'ex-3',
          name: 'Rows',
          gifUrl: 'https://example.com/rows.gif',
          bodyParts: ['back'],
          targetMuscles: ['latissimus'],
        },
      ],
    };

    mockExerciseDbService.getExercisesByBodyPart
      .mockResolvedValueOnce(chestResponse)
      .mockResolvedValueOnce(backResponse);

    const { result, rerender } = renderHook(
      ({ bodyPart, page }) => useExercisesByBodyPart(bodyPart, page),
      {
        initialProps: { bodyPart: 'chest', page: 1 },
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockExerciseDbService.getExercisesByBodyPart).toHaveBeenCalledWith('chest', 1);

    rerender({ bodyPart: 'back', page: 1 });

    await waitFor(() => {
      expect(mockExerciseDbService.getExercisesByBodyPart).toHaveBeenCalledWith('back', 1);
    });
  });

  it('should cache results with staleTime', async () => {
    mockExerciseDbService.getExercisesByBodyPart.mockResolvedValueOnce(mockPaginatedResponse);

    const { result: result1 } = renderHook(() => useExercisesByBodyPart('chest', 1), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
    });

    const callCount1 = mockExerciseDbService.getExercisesByBodyPart.mock.calls.length;

    // Render the same hook again - should use cached data
    const { result: result2 } = renderHook(() => useExercisesByBodyPart('chest', 1), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result2.current.isSuccess).toBe(true);
    });

    // The API should not be called again due to stale time
    expect(mockExerciseDbService.getExercisesByBodyPart.mock.calls.length).toBe(callCount1);
  });

  it('should have correct query key', async () => {
    mockExerciseDbService.getExercisesByBodyPart.mockResolvedValueOnce(mockPaginatedResponse);

    renderHook(() => useExercisesByBodyPart('chest', 2), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockExerciseDbService.getExercisesByBodyPart).toHaveBeenCalled();
    });

    expect(mockExerciseDbService.getExercisesByBodyPart).toHaveBeenCalledWith('chest', 2);
  });

  it('should handle pagination correctly', async () => {
    mockExerciseDbService.getExercisesByBodyPart.mockResolvedValueOnce({
      ...mockPaginatedResponse,
      meta: {
        total: 100,
        page: 2,
        limit: 10,
        totalPages: 10,
      },
    });

    const { result } = renderHook(() => useExercisesByBodyPart('legs', 2), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockExerciseDbService.getExercisesByBodyPart).toHaveBeenCalledWith('legs', 2);
    expect(result.current.data?.meta?.page).toBe(2);
  });

  it('should return empty data gracefully', async () => {
    mockExerciseDbService.getExercisesByBodyPart.mockResolvedValueOnce({
      success: true,
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    });

    const { result } = renderHook(() => useExercisesByBodyPart('unknown', 1), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toEqual([]);
  });
});
