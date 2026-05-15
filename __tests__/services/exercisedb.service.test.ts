jest.mock('axios');

import * as ExerciseDbService from '@/services/exercisedb.service';
import type { ExternalExercise, PaginatedResponse } from '@/types/exercise.types';
import { mockAxiosInstance } from '@/__mocks__/axios';

// Set up the mock client for the service
ExerciseDbService.__setClient(mockAxiosInstance);
const mockGet = mockAxiosInstance.get;

describe('ExerciseDbService', () => {
  const mockExercise: ExternalExercise = {
    exerciseId: 'ex-1',
    name: 'Push-ups',
    gifUrl: 'https://example.com/pushups.gif',
    bodyParts: ['chest'],
    targetMuscles: ['pectoralis'],
  };

  const mockPaginatedResponse: PaginatedResponse<ExternalExercise> = {
    success: true,
    data: [mockExercise],
    meta: {
      total: 100,
      page: 1,
      limit: 10,
      totalPages: 10,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockClear();
  });

  describe('searchExercises', () => {
    it('should search exercises with query', async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });

      const result = await ExerciseDbService.searchExercises('push', 1, 10);

      expect(mockGet).toHaveBeenCalledWith(
        '/exercises/search',
        expect.objectContaining({
          params: expect.objectContaining({
            q: 'push',
            offset: 0,
            limit: 10,
          }),
        }),
      );

      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should use default pagination when not provided', async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });

      await ExerciseDbService.searchExercises('bench');

      expect(mockGet).toHaveBeenCalledWith(
        '/exercises/search',
        expect.objectContaining({
          params: expect.objectContaining({
            q: 'bench',
            offset: 0,
            limit: 10,
          }),
        }),
      );
    });

    it('should calculate correct offset for pagination', async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });

      await ExerciseDbService.searchExercises('squat', 3, 20);

      expect(mockGet).toHaveBeenCalledWith(
        '/exercises/search',
        expect.objectContaining({
          params: expect.objectContaining({
            offset: 40, // (3-1) * 20 = 40
            limit: 20,
          }),
        }),
      );
    });

    it('should throw error when API fails', async () => {
      const error = new Error('API Error');
      mockGet.mockRejectedValue(error);

      await expect(ExerciseDbService.searchExercises('test')).rejects.toThrow('API Error');
    });
  });

  describe('getExercises', () => {
    it('should fetch all exercises', async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });

      const result = await ExerciseDbService.getExercises(1, 10);

      expect(mockGet).toHaveBeenCalledWith(
        '/exercises',
        expect.objectContaining({
          params: expect.objectContaining({
            offset: 0,
            limit: 10,
          }),
        }),
      );

      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should use default limit and page', async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });

      await ExerciseDbService.getExercises();

      expect(mockGet).toHaveBeenCalledWith(
        '/exercises',
        expect.objectContaining({
          params: expect.objectContaining({
            offset: 0,
            limit: 10,
          }),
        }),
      );
    });
  });

  describe('getExercisesByBodyPart', () => {
    it('should fetch exercises by body part', async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });

      await ExerciseDbService.getExercisesByBodyPart('chest', 1, 10);

      expect(mockGet).toHaveBeenCalledWith(
        '/bodyparts/chest/exercises',
        expect.objectContaining({
          params: expect.objectContaining({
            offset: 0,
            limit: 10,
          }),
        }),
      );
    });

    it('should encode body part in URL', async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });

      await ExerciseDbService.getExercisesByBodyPart('lower back', 1, 10);

      expect(mockGet).toHaveBeenCalledWith(
        '/bodyparts/lower%20back/exercises',
        expect.anything(),
      );
    });

    it('should use default pagination', async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });

      await ExerciseDbService.getExercisesByBodyPart('legs');

      expect(mockGet).toHaveBeenCalledWith(
        '/bodyparts/legs/exercises',
        expect.objectContaining({
          params: expect.objectContaining({
            offset: 0,
            limit: 10,
          }),
        }),
      );
    });
  });

  describe('getExercisesByEquipment', () => {
    it('should fetch exercises by equipment', async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });

      await ExerciseDbService.getExercisesByEquipment('barbell', 1, 10);

      expect(mockGet).toHaveBeenCalledWith(
        '/equipments/barbell/exercises',
        expect.objectContaining({
          params: expect.objectContaining({
            offset: 0,
            limit: 10,
          }),
        }),
      );
    });

    it('should encode equipment in URL', async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });

      await ExerciseDbService.getExercisesByEquipment('dumbbell', 1, 10);

      expect(mockGet).toHaveBeenCalledWith(
        '/equipments/dumbbell/exercises',
        expect.anything(),
      );
    });
  });

  describe('getExercisesByMuscle', () => {
    it('should fetch exercises by target muscle', async () => {
      mockGet.mockResolvedValue({ data: mockPaginatedResponse });

      await ExerciseDbService.getExercisesByMuscle('pectoralis', 1, 10);

      expect(mockGet).toHaveBeenCalledWith(
        '/muscles/pectoralis/exercises',
        expect.objectContaining({
          params: expect.objectContaining({
            offset: 0,
            limit: 10,
          }),
        }),
      );
    });
  });

  describe('getBodyParts', () => {
    it('should fetch list of body parts', async () => {
      const mockResponse = {
        success: true,
        data: [{ name: 'chest' }, { name: 'back' }, { name: 'legs' }],
      };

      mockGet.mockResolvedValue({ data: mockResponse });

      const result = await ExerciseDbService.getBodyParts();

      expect(mockGet).toHaveBeenCalledWith('/bodyparts');
      expect(result).toEqual({
        success: true,
        data: ['chest', 'back', 'legs'],
      });
    });
  });

  describe('getEquipments', () => {
    it('should fetch list of equipment', async () => {
      const mockResponse = {
        success: true,
        data: [{ name: 'barbell' }, { name: 'dumbbell' }],
      };

      mockGet.mockResolvedValue({ data: mockResponse });

      const result = await ExerciseDbService.getEquipments();

      expect(mockGet).toHaveBeenCalledWith('/equipments');
      expect(result).toEqual({
        success: true,
        data: ['barbell', 'dumbbell'],
      });
    });
  });

  describe('getMuscles', () => {
    it('should fetch list of target muscles', async () => {
      const mockResponse = {
        success: true,
        data: [{ name: 'pectoralis' }, { name: 'quadriceps' }],
      };

      mockGet.mockResolvedValue({ data: mockResponse });

      const result = await ExerciseDbService.getMuscles();

      expect(mockGet).toHaveBeenCalledWith('/muscles');
      expect(result).toEqual({
        success: true,
        data: ['pectoralis', 'quadriceps'],
      });
    });
  });
});
