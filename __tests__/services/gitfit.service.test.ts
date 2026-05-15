import gitfitService from '@/services/gitfit.service';
import { apiClient } from '@/utils/apiClient';
import type {
  UserProfile,
  AuthResult,
  LoginPayload,
  RegisterPayload,
  RoutineDetail,
  CreateRoutinePayload,
  UpdateProfilePayload,
} from '@/services/gitfit.service';

jest.mock('@/utils/apiClient');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('gitfitService', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    fullName: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  const mockProfile: UserProfile = {
    ...mockUser,
    dateOfBirth: '1990-01-01',
    gender: 'M',
    heightCm: 180,
    weightKg: 80,
    fitnessGoal: 'Build muscle',
    experienceLevel: 'Intermediate',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockRoutineDetail: RoutineDetail = {
    id: 'routine-123',
    name: 'Chest Day',
    programId: null,
    dayOfWeek: null,
    orderInProgram: null,
    userId: 'user-123',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    routineExercises: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login user with email and password', async () => {
      const loginPayload: LoginPayload = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            accessToken: 'access-token-123',
            refreshToken: 'refresh-token-456',
          },
        },
      });

      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockProfile,
        },
      });

      const result = await gitfitService.login(loginPayload);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', loginPayload);
      expect(mockApiClient.get).toHaveBeenCalledWith('/users/me');

      expect(result).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          fullName: mockUser.fullName,
          avatarUrl: mockUser.avatarUrl,
        },
      });
    });

    it('should throw error on login failure', async () => {
      const loginPayload: LoginPayload = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockApiClient.post.mockRejectedValueOnce(new Error('Invalid credentials'));

      await expect(gitfitService.login(loginPayload)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should register new user', async () => {
      const registerPayload: RegisterPayload = {
        email: 'newuser@example.com',
        password: 'password123',
        username: 'newuser',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            user: {
              id: 'user-new',
              email: 'newuser@example.com',
              username: 'newuser',
            },
            accessToken: 'access-token-new',
            refreshToken: 'refresh-token-new',
          },
        },
      });

      const result = await gitfitService.register(registerPayload);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register', registerPayload);

      expect(result).toEqual({
        accessToken: 'access-token-new',
        refreshToken: 'refresh-token-new',
        user: {
          id: 'user-new',
          email: 'newuser@example.com',
          username: 'newuser',
          fullName: null,
          avatarUrl: null,
        },
      });
    });
  });

  describe('getMyProfile', () => {
    it('should get current user profile', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockProfile,
        },
      });

      const result = await gitfitService.getMyProfile();

      expect(mockApiClient.get).toHaveBeenCalledWith('/users/me');
      expect(result).toEqual(mockProfile);
    });
  });

  describe('updateMyProfile', () => {
    it('should update user profile', async () => {
      const updatePayload: UpdateProfilePayload = {
        fullName: 'Updated Name',
        heightCm: 185,
        weightKg: 85,
      };

      const updatedProfile: UserProfile = {
        ...mockProfile,
        ...updatePayload,
      };

      mockApiClient.patch.mockResolvedValueOnce({
        data: {
          success: true,
          data: updatedProfile,
        },
      });

      const result = await gitfitService.updateMyProfile(updatePayload);

      expect(mockApiClient.patch).toHaveBeenCalledWith('/users/me', updatePayload);
      expect(result).toEqual(updatedProfile);
    });
  });

  describe('Routine operations', () => {
    it('should list routines', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: [mockRoutineDetail],
        },
      });

      const result = await gitfitService.listRoutines();

      expect(mockApiClient.get).toHaveBeenCalledWith('/routines', {
        params: undefined,
      });

      expect(result).toHaveLength(1);
    });

    it('should create routine', async () => {
      const createPayload: CreateRoutinePayload = {
        name: 'Chest Day',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockRoutineDetail,
        },
      });

      const result = await gitfitService.createRoutine(createPayload);

      expect(mockApiClient.post).toHaveBeenCalledWith('/routines', createPayload);
      expect(result).toEqual(mockRoutineDetail);
    });

    it('should get routine by id', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockRoutineDetail,
        },
      });

      const result = await gitfitService.getRoutineById('routine-123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/routines/routine-123');
      expect(result).toEqual(mockRoutineDetail);
    });

    it('should update routine', async () => {
      const updatePayload = { name: 'Updated Chest Day' };

      mockApiClient.patch.mockResolvedValueOnce({
        data: {
          success: true,
          data: { ...mockRoutineDetail, name: 'Updated Chest Day' },
        },
      });

      const result = await gitfitService.updateRoutine('routine-123', updatePayload);

      expect(mockApiClient.patch).toHaveBeenCalledWith('/routines/routine-123', updatePayload);
      expect(result.name).toBe('Updated Chest Day');
    });

    it('should delete routine', async () => {
      mockApiClient.delete.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockRoutineDetail,
        },
      });

      const result = await gitfitService.deleteRoutine('routine-123');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/routines/routine-123');
      expect(result).toEqual(mockRoutineDetail);
    });
  });

  describe('Routine Exercise operations', () => {
    it('should add exercise to routine', async () => {
      const addPayload = {
        exerciseId: 'ex-1',
        sets: 3,
        repsTarget: '8-10',
        weightTarget: 50,
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: 'routine-ex-1',
            routineId: 'routine-123',
            exerciseId: 'ex-1',
            exercise: { id: 'ex-1', name: 'Bench Press', gifUrl: null },
            ...addPayload,
            orderIndex: 0,
          },
        },
      });

      const result = await gitfitService.addExerciseToRoutine('routine-123', addPayload);

      expect(mockApiClient.post).toHaveBeenCalledWith('/routines/routine-123/exercises', addPayload);
      expect(result.exerciseId).toBe('ex-1');
    });

    it('should remove exercise from routine', async () => {
      mockApiClient.delete.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: 'routine-ex-1',
            routineId: 'routine-123',
            exerciseId: 'ex-1',
            exercise: { id: 'ex-1', name: 'Bench Press', gifUrl: null },
            sets: 3,
            repsTarget: '8-10',
            weightTarget: 50,
            orderIndex: 0,
          },
        },
      });

      await gitfitService.removeExerciseFromRoutine('routine-123', 'ex-1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/routines/routine-123/exercises/ex-1');
    });
  });

  describe('Workout Session operations', () => {
    it('should create workout session', async () => {
      const createPayload = { routineId: 'routine-123' };

      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: 'session-123',
            userId: 'user-123',
            routineId: 'routine-123',
            name: 'Chest Day',
            startedAt: '2024-01-01T10:00:00Z',
            finishedAt: null,
            durationSeconds: null,
            totalVolumeKg: null,
            notes: null,
            status: 'IN_PROGRESS',
            createdAt: '2024-01-01T10:00:00Z',
            workoutSets: [],
          },
        },
      });

      const result = await gitfitService.createWorkoutSession(createPayload);

      expect(mockApiClient.post).toHaveBeenCalledWith('/workout-sessions', createPayload);
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should finish workout session', async () => {
      mockApiClient.patch.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: 'session-123',
            userId: 'user-123',
            routineId: 'routine-123',
            name: 'Chest Day',
            startedAt: '2024-01-01T10:00:00Z',
            finishedAt: '2024-01-01T11:00:00Z',
            durationSeconds: 3600,
            totalVolumeKg: 5000,
            notes: null,
            status: 'COMPLETED',
            createdAt: '2024-01-01T10:00:00Z',
            workoutSets: [],
          },
        },
      });

      const result = await gitfitService.finishWorkoutSession('session-123');

      expect(mockApiClient.patch).toHaveBeenCalledWith('/workout-sessions/session-123/finish');
      expect(result.status).toBe('COMPLETED');
    });

    it('should log set for session', async () => {
      const logPayload = {
        exerciseId: 'ex-1',
        setNumber: 1,
        reps: 10,
        weightKg: 50,
        isWarmup: false,
        isPr: false,
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: 'set-1',
            ...logPayload,
            durationSeconds: null,
            distanceMeters: null,
            rpe: null,
            loggedAt: '2024-01-01T10:15:00Z',
          },
        },
      });

      const result = await gitfitService.logSet('session-123', logPayload);

      expect(mockApiClient.post).toHaveBeenCalledWith('/workout-sessions/session-123/sets', logPayload);
      expect(result.exerciseId).toBe('ex-1');
    });
  });

  describe('Stats operations', () => {
    it('should get personal records', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            {
              id: 'pr-1',
              userId: 'user-123',
              exerciseId: 'ex-1',
              recordType: 'weight',
              value: 100,
              unit: 'kg',
              achievedAt: '2024-01-01T10:00:00Z',
              sessionId: 'session-123',
              exercise: {
                id: 'ex-1',
                name: 'Bench Press',
                gifUrl: null,
                targetMuscles: ['pectoralis'],
              },
            },
          ],
        },
      });

      const result = await gitfitService.getPersonalRecords();

      expect(mockApiClient.get).toHaveBeenCalledWith('/personal-records', {
        params: undefined,
      });

      expect(result).toHaveLength(1);
    });

    it('should get weekly volume', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            { week: '2024-W01', totalVolumeKg: 10000 },
            { week: '2024-W02', totalVolumeKg: 12000 },
          ],
        },
      });

      const result = await gitfitService.getWeeklyVolume(2);

      expect(mockApiClient.get).toHaveBeenCalledWith('/stats/weekly-volume', {
        params: { weeks: 2 },
      });

      expect(result).toHaveLength(2);
    });

    it('should get workout streak', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            currentStreak: 5,
            longestStreak: 30,
          },
        },
      });

      const result = await gitfitService.getWorkoutStreak();

      expect(mockApiClient.get).toHaveBeenCalledWith('/stats/workout-streak');
      expect(result.currentStreak).toBe(5);
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: { message: 'Logged out successfully' },
        },
      });

      await gitfitService.logout('refresh-token-123');

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/logout', {
        refreshToken: 'refresh-token-123',
      });
    });
  });
});
