import { apiClient } from '../utils/apiClient';
import type {
  AddExerciseToRoutinePayload,
  LogSetPayload,
  WorkoutSet,
} from '../types/exercise.types';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

function unwrapData<T>(body: ApiEnvelope<T>): T {
  return body.data;
}

export interface RoutineExercise {
  id: string;
  routineId: string;
  exerciseId: string;
  exercise: {
    id: string;
    name: string;
    gifUrl: string | null;
  };
  sets: number | null;
  repsTarget: string | null;
  weightTarget: number | null;
  restSeconds: number | null;
  orderIndex: number;
}

export type WorkoutSessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  heightCm: number | null;
  weightKg: number | null;
  fitnessGoal: string | null;
  experienceLevel: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  fitnessGoal?: string;
  experienceLevel?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
}

export interface RoutineSummary {
  id: string;
  name: string;
  programId: string | null;
  dayOfWeek: number | null;
  orderInProgram: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineExerciseDetail {
  id: string;
  exerciseId: string;
  sets: number | null;
  repsTarget: string | null;
  weightTarget: number | null;
  restSeconds: number | null;
  orderIndex: number;
  exercise: {
    id: string;
    name: string;
    gifUrl: string | null;
    targetMuscles: string[];
    bodyParts: string[];
  };
}

export interface RoutineDetail extends RoutineSummary {
  userId: string;
  routineExercises: RoutineExerciseDetail[];
}

export interface CreateRoutinePayload {
  name: string;
  programId?: string;
  dayOfWeek?: number;
  orderInProgram?: number;
}

export interface UpdateRoutinePayload {
  name?: string;
  programId?: string;
  dayOfWeek?: number;
  orderInProgram?: number;
}

export interface UpdateRoutineExercisePayload {
  sets?: number;
  repsTarget?: string;
  weightTarget?: number;
  restSeconds?: number;
  orderIndex?: number;
}

export interface WorkoutSessionsQuery {
  status?: WorkoutSessionStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface WorkoutSessionSummary {
  id: string;
  name: string;
  startedAt: string;
  finishedAt: string | null;
  durationSeconds: number | null;
  totalVolumeKg: number | null;
  status: WorkoutSessionStatus;
  createdAt: string;
}

export interface WorkoutSessionSet {
  id: string;
  exerciseId: string;
  setNumber: number;
  reps: number | null;
  weightKg: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
  rpe: number | null;
  isWarmup: boolean;
  isPr: boolean;
  loggedAt: string;
  exercise: {
    id: string;
    name: string;
    gifUrl: string | null;
  };
}

export interface WorkoutSessionDetail {
  id: string;
  userId: string;
  routineId: string | null;
  name: string;
  startedAt: string;
  finishedAt: string | null;
  durationSeconds: number | null;
  totalVolumeKg: number | null;
  notes: string | null;
  status: WorkoutSessionStatus;
  createdAt: string;
  workoutSets: WorkoutSessionSet[];
}

export interface WorkoutSessionsListResponse {
  data: WorkoutSessionSummary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateWorkoutSessionPayload {
  routineId?: string;
  notes?: string;
}

export interface StatsWeeklyVolumeItem {
  week: string;
  totalVolumeKg: number;
}

export interface StatsExerciseProgressItem {
  date: string;
  maxWeightKg: number;
  totalVolume: number;
}

export interface StatsMuscleFrequencyItem {
  muscle: string;
  count: number;
}

export interface StatsWorkoutStreak {
  currentStreak: number;
  longestStreak: number;
}

export interface PersonalRecordItem {
  id: string;
  userId: string;
  exerciseId: string;
  recordType: string;
  value: number;
  unit: string;
  achievedAt: string;
  sessionId: string | null;
  exercise: {
    id: string;
    name: string;
    gifUrl: string | null;
    targetMuscles: string[];
  };
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  username: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

async function getMyProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get<ApiEnvelope<UserProfile>>('/users/me');
  return unwrapData(data);
}

async function getMyProfileWithAccessToken(accessToken: string): Promise<UserProfile> {
  const { data } = await apiClient.get<ApiEnvelope<UserProfile>>('/users/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return unwrapData(data);
}

async function login(payload: LoginPayload): Promise<AuthResult> {
  const { data } = await apiClient.post<ApiEnvelope<{ accessToken: string; refreshToken: string }>>('/auth/login', payload);
  const tokens = unwrapData(data);
  const profile = await getMyProfileWithAccessToken(tokens.accessToken);
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
    },
  };
}

async function register(payload: RegisterPayload): Promise<AuthResult> {
  const { data } = await apiClient.post<
    ApiEnvelope<{
      user: {
        id: string;
        email: string;
        username: string;
      };
      accessToken: string;
      refreshToken: string;
    }>
  >('/auth/register', payload);

  const body = unwrapData(data);
  return {
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    user: {
      id: body.user.id,
      email: body.user.email,
      username: body.user.username,
      fullName: null,
      avatarUrl: null,
    },
  };
}

async function updateMyProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  const { data } = await apiClient.patch<ApiEnvelope<UserProfile>>('/users/me', payload);
  return unwrapData(data);
}

async function listRoutines(programId?: string): Promise<RoutineSummary[]> {
  const { data } = await apiClient.get<ApiEnvelope<RoutineSummary[]>>('/routines', {
    params: programId ? { programId } : undefined,
  });
  return unwrapData(data);
}

async function createRoutine(payload: CreateRoutinePayload): Promise<RoutineDetail> {
  const { data } = await apiClient.post<ApiEnvelope<RoutineDetail>>('/routines', payload);
  return unwrapData(data);
}

async function getRoutineById(routineId: string): Promise<RoutineDetail> {
  const { data } = await apiClient.get<ApiEnvelope<RoutineDetail>>(`/routines/${routineId}`);
  return unwrapData(data);
}

async function updateRoutine(routineId: string, payload: UpdateRoutinePayload): Promise<RoutineDetail> {
  const { data } = await apiClient.patch<ApiEnvelope<RoutineDetail>>(`/routines/${routineId}`, payload);
  return unwrapData(data);
}

async function deleteRoutine(routineId: string): Promise<RoutineDetail> {
  const { data } = await apiClient.delete<ApiEnvelope<RoutineDetail>>(`/routines/${routineId}`);
  return unwrapData(data);
}

async function addExerciseToRoutine(
  routineId: string,
  payload: AddExerciseToRoutinePayload,
): Promise<RoutineExercise> {
  const { data } = await apiClient.post<ApiEnvelope<RoutineExercise>>(
    `/routines/${routineId}/exercises`,
    payload,
  );
  return unwrapData(data);
}

async function updateRoutineExercise(
  routineId: string,
  exerciseId: string,
  payload: UpdateRoutineExercisePayload,
): Promise<RoutineExercise> {
  const { data } = await apiClient.patch<ApiEnvelope<RoutineExercise>>(
    `/routines/${routineId}/exercises/${exerciseId}`,
    payload,
  );
  return unwrapData(data);
}

async function removeExerciseFromRoutine(routineId: string, exerciseId: string): Promise<RoutineExercise> {
  const { data } = await apiClient.delete<ApiEnvelope<RoutineExercise>>(
    `/routines/${routineId}/exercises/${exerciseId}`,
  );
  return unwrapData(data);
}

async function createWorkoutSession(payload: CreateWorkoutSessionPayload): Promise<WorkoutSessionDetail> {
  const { data } = await apiClient.post<ApiEnvelope<WorkoutSessionDetail>>('/workout-sessions', payload);
  return unwrapData(data);
}

async function finishWorkoutSession(sessionId: string): Promise<WorkoutSessionDetail> {
  const { data } = await apiClient.patch<ApiEnvelope<WorkoutSessionDetail>>(
    `/workout-sessions/${sessionId}/finish`,
  );
  return unwrapData(data);
}

async function cancelWorkoutSession(sessionId: string): Promise<WorkoutSessionDetail> {
  const { data } = await apiClient.patch<ApiEnvelope<WorkoutSessionDetail>>(
    `/workout-sessions/${sessionId}/cancel`,
  );
  return unwrapData(data);
}

async function logSet(sessionId: string, payload: LogSetPayload): Promise<WorkoutSet> {
  const { data } = await apiClient.post<ApiEnvelope<WorkoutSet>>(
    `/workout-sessions/${sessionId}/sets`,
    payload,
  );
  return unwrapData(data);
}

async function getWorkoutSessions(
  params: WorkoutSessionsQuery,
): Promise<WorkoutSessionsListResponse> {
  const { data } = await apiClient.get<ApiEnvelope<WorkoutSessionSummary[]>>('/workout-sessions', {
    params,
  });
  return {
    data: unwrapData(data),
    meta: data.meta ?? {
      total: 0,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      totalPages: 0,
    },
  };
}

async function getWorkoutSessionById(sessionId: string): Promise<WorkoutSessionDetail> {
  const { data } = await apiClient.get<ApiEnvelope<WorkoutSessionDetail>>(`/workout-sessions/${sessionId}`);
  return unwrapData(data);
}

async function getPersonalRecords(exerciseId?: string): Promise<PersonalRecordItem[]> {
  const { data } = await apiClient.get<ApiEnvelope<PersonalRecordItem[]>>('/personal-records', {
    params: exerciseId ? { exerciseId } : undefined,
  });
  return unwrapData(data);
}

async function getWeeklyVolume(weeks = 8): Promise<StatsWeeklyVolumeItem[]> {
  const { data } = await apiClient.get<ApiEnvelope<StatsWeeklyVolumeItem[]>>('/stats/weekly-volume', {
    params: { weeks },
  });
  return unwrapData(data);
}

async function getExerciseProgress(exerciseId: string): Promise<StatsExerciseProgressItem[]> {
  const { data } = await apiClient.get<ApiEnvelope<StatsExerciseProgressItem[]>>(
    `/stats/exercise-progress/${exerciseId}`,
  );
  return unwrapData(data);
}

async function getMuscleFrequency(days = 30): Promise<StatsMuscleFrequencyItem[]> {
  const { data } = await apiClient.get<ApiEnvelope<StatsMuscleFrequencyItem[]>>('/stats/muscle-frequency', {
    params: { days },
  });
  return unwrapData(data);
}

async function getWorkoutStreak(): Promise<StatsWorkoutStreak> {
  const { data } = await apiClient.get<ApiEnvelope<StatsWorkoutStreak>>('/stats/workout-streak');
  return unwrapData(data);
}

async function logout(refreshToken: string): Promise<void> {
  await apiClient.post<ApiEnvelope<{ message: string }>>('/auth/logout', { refreshToken });
}

const gitfitService = {
  login,
  register,
  getMyProfile,
  updateMyProfile,
  listRoutines,
  createRoutine,
  getRoutineById,
  updateRoutine,
  deleteRoutine,
  addExerciseToRoutine,
  updateRoutineExercise,
  removeExerciseFromRoutine,
  createWorkoutSession,
  finishWorkoutSession,
  cancelWorkoutSession,
  logSet,
  getWorkoutSessions,
  getWorkoutSessionById,
  getPersonalRecords,
  getWeeklyVolume,
  getExerciseProgress,
  getMuscleFrequency,
  getWorkoutStreak,
  logout,
};

export default gitfitService;
