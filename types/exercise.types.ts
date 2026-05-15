export interface ExternalExercise {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  instructions: string[];
}

export interface UpsertExercisePayload {
  exerciseDbId: string;
  name: string;
  gifUrl?: string;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  instructions: string[];
}

export interface Exercise {
  id: string;
  exerciseDbId: string;
  name: string;
  gifUrl: string | null;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  instructions: string[];
  isCustom: boolean;
  createdAt: string;
}

export interface AddExerciseToRoutinePayload {
  exercise: UpsertExercisePayload;
  sets?: number;
  repsTarget?: string;
  weightTarget?: number;
  restSeconds?: number;
  orderIndex: number;
}

export interface LogSetPayload {
  exercise: UpsertExercisePayload;
  setNumber: number;
  reps?: number;
  weightKg?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  rpe?: number;
  isWarmup?: boolean;
}

export interface WorkoutSet {
  id: string;
  sessionId: string;
  exerciseId: string;
  exercise: Exercise;
  setNumber: number;
  reps: number | null;
  weightKg: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
  rpe: number | null;
  isWarmup: boolean;
  isPr: boolean;
  loggedAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  metadata: {
    totalExercises: number;
    currentPage: number;
    totalPages: number;
    previousPage?: string | null;
    nextPage?: string | null;
  };
}

export type BodyPartList = string[];
export type EquipmentList = string[];
export type MuscleList = string[];
