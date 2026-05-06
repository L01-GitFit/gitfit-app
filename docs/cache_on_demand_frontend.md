You are a senior frontend engineer working on an existing React Native Expo project for a gym tracking app.

The project uses: React Native Expo (latest SDK), TypeScript (strict), React Query (@tanstack/react-query), Zustand, and an Axios-based API client already configured as `apiClient`.

Your task is to implement the **Cache-on-demand** pattern for exercises — types, ExerciseDB API service, backend API hooks, and Zustand session store. Do NOT create screen components or UI yet. Generate all code completely with no placeholders or TODOs.

---

## ExerciseDB API base URL

Store as a constant:
```
https://exercisedb-api-mauve.vercel.app/api/v1
```

The API returns paginated responses in this shape:
```json
{
  "success": true,
  "data": [...],
  "metadata": {
    "totalExercises": 150,
    "currentPage": 1,
    "totalPages": 15
  }
}
```

---

## File structure to create

```
src/
├── types/
│   └── exercise.types.ts
├── services/
│   ├── exercisedb.service.ts
│   └── gitfit.service.ts          (only exercise-related methods)
├── hooks/
│   ├── useExerciseSearch.ts
│   ├── useExercisesByBodyPart.ts
│   ├── useExercisesByEquipment.ts
│   ├── useExercisesByMuscle.ts
│   ├── useBodyParts.ts
│   ├── useEquipments.ts
│   ├── useMuscles.ts
│   ├── useAddExerciseToRoutine.ts
│   └── useLogSet.ts
└── stores/
    └── workoutSession.store.ts
```

---

## 1. Types

Create `src/types/exercise.types.ts`:

```typescript
// Raw shape returned by ExerciseDB API
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

// Shape returned by gitfit-webservice after upsert
export interface Exercise {
  id: string;                 // internal UUID (FK used in all backend relations)
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

// Payload sent to backend when adding to routine
export interface AddExerciseToRoutinePayload {
  exercise: ExternalExercise;
  sets?: number;
  repsTarget?: string;
  weightTarget?: number;
  restSeconds?: number;
  orderIndex: number;
}

// Payload sent to backend when logging a set
export interface LogSetPayload {
  exercise: ExternalExercise;
  setNumber: number;
  reps?: number;
  weightKg?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  rpe?: number;
  isWarmup?: boolean;
}

// Shape of a logged set returned by backend
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

// Paginated response wrapper
export interface PaginatedResponse {
  success: boolean;
  data: T[];
  metadata: {
    totalExercises: number;
    currentPage: number;
    totalPages: number;
  };
}

// Filter option lists
export type BodyPartList = string[];
export type EquipmentList = string[];
export type MuscleList = string[];
```

---

## 2. ExerciseDB Service

Create `src/services/exercisedb.service.ts`:

Implement all fetch calls with proper query params. Each function returns typed data.

Functions to implement:
- `searchExercises(query: string, page?: number, limit?: number): Promise>`
- `getExercises(page?: number, limit?: number): Promise>`
- `getExercisesByBodyPart(bodyPart: string, page?: number, limit?: number): Promise>`
- `getExercisesByEquipment(equipment: string, page?: number, limit?: number): Promise>`
- `getExercisesByMuscle(muscle: string, page?: number, limit?: number): Promise>`
- `getBodyParts(): Promise<{ success: boolean; data: string[] }>`
- `getEquipments(): Promise<{ success: boolean; data: string[] }>`
- `getMuscles(): Promise<{ success: boolean; data: string[] }>`

Export all as named exports AND as a default object `exerciseDbService`.

---

## 3. GitFit Service — exercise-related methods only

In `src/services/gitfit.service.ts`, add only these two methods (do not define apiClient here — import it from existing config):

```typescript
addExerciseToRoutine(routineId: string, payload: AddExerciseToRoutinePayload): Promise
logSet(sessionId: string, payload: LogSetPayload): Promise
```

Also define the `RoutineExercise` type inline if not already defined elsewhere:

```typescript
export interface RoutineExercise {
  id: string;
  routineId: string;
  exerciseId: string;
  exercise: Exercise;
  sets: number | null;
  repsTarget: string | null;
  weightTarget: number | null;
  restSeconds: number | null;
  orderIndex: number;
}
```

---

## 4. React Query Hooks

### useExerciseSearch.ts
- queryKey: `['exercises', 'search', query, page]`
- enabled: `query.trim().length > 1`
- staleTime: 10 minutes
- Returns paginated result

### useExercisesByBodyPart.ts
- queryKey: `['exercises', 'bodyPart', bodyPart, page]`
- enabled: `!!bodyPart`
- staleTime: 10 minutes

### useExercisesByEquipment.ts
- queryKey: `['exercises', 'equipment', equipment, page]`
- enabled: `!!equipment`
- staleTime: 10 minutes

### useExercisesByMuscle.ts
- queryKey: `['exercises', 'muscle', muscle, page]`
- enabled: `!!muscle`
- staleTime: 10 minutes

### useBodyParts.ts
- queryKey: `['bodyparts']`
- staleTime: `Infinity` (static data)

### useEquipments.ts
- queryKey: `['equipments']`
- staleTime: `Infinity`

### useMuscles.ts
- queryKey: `['muscles']`
- staleTime: `Infinity`

### useAddExerciseToRoutine.ts
Implement as `useMutation`:
- Calls `gitfitService.addExerciseToRoutine(routineId, payload)`
- On success: invalidate `['routines', routineId]`
- Accepts `routineId` as parameter to the hook

```typescript
export const useAddExerciseToRoutine = (routineId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddExerciseToRoutinePayload) =>
      gitfitService.addExerciseToRoutine(routineId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines', routineId] });
    },
  });
};
```

### useLogSet.ts
Implement as `useMutation`:
- Calls `gitfitService.logSet(sessionId, payload)`
- On success:
  1. Invalidate `['session', sessionId]`
  2. If `result.isPr === true`, call `useWorkoutSessionStore.getState().markSetAsPr(payload.exercise.exerciseId, payload.setNumber)`
- Accepts `sessionId` as parameter to the hook

---

## 5. Zustand Store

Create `src/stores/workoutSession.store.ts`:

### State shape

```typescript
interface ActiveSet {
  exerciseDbId: string;
  exerciseName: string;
  gifUrl: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe?: number;
  isWarmup: boolean;
  isPr: boolean;
}

interface ActiveExercise {
  externalExercise: ExternalExercise; // kept in full to send to backend
  sets: ActiveSet[];
}

interface WorkoutSessionState {
  sessionId: string | null;
  sessionName: string;
  startedAt: Date | null;
  exercises: ActiveExercise[];

  // Actions
  startSession: (id: string, name: string) => void;
  addExercise: (exercise: ExternalExercise) => void;
  removeExercise: (exerciseDbId: string) => void;
  addSet: (exerciseDbId: string, set: Omit) => void;
  updateSet: (exerciseDbId: string, setNumber: number, data: Partial) => void;
  removeSet: (exerciseDbId: string, setNumber: number) => void;
  markSetAsPr: (exerciseDbId: string, setNumber: number) => void;
  reorderExercises: (from: number, to: number) => void;
  finishSession: () => void;
  resetSession: () => void;
}
```

### Selectors to export (outside the store)

```typescript
// Computed values — use these in components instead of deriving in render
export const selectTotalSets = (state: WorkoutSessionState) =>
  state.exercises.reduce((acc, e) => acc + e.sets.length, 0);

export const selectTotalVolume = (state: WorkoutSessionState) =>
  state.exercises.reduce((acc, e) =>
    acc + e.sets.reduce((s, set) => s + (set.weightKg * set.reps), 0), 0);

export const selectExerciseByDbId = (exerciseDbId: string) =>
  (state: WorkoutSessionState) =>
    state.exercises.find(e => e.externalExercise.exerciseId === exerciseDbId);

export const selectHasActiveSession = (state: WorkoutSessionState) =>
  state.sessionId !== null;
```

### Implementation notes
- Use `immer` middleware (`import { immer } from 'zustand/middleware/immer'`) for clean state updates
- Use `devtools` middleware wrapping immer for debugging in dev
- `addSet` must default `isPr: false`
- `reorderExercises` swaps exercises array positions by index
- `resetSession` clears everything back to initial state
- `finishSession` only clears sessionId and startedAt, keeps exercises data briefly for summary screen; call `resetSession` explicitly after summary is dismissed

---

## Summary of files to create

- CREATE `src/types/exercise.types.ts`
- CREATE `src/services/exercisedb.service.ts`
- CREATE `src/services/gitfit.service.ts` (exercise methods only)
- CREATE `src/hooks/useExerciseSearch.ts`
- CREATE `src/hooks/useExercisesByBodyPart.ts`
- CREATE `src/hooks/useExercisesByEquipment.ts`
- CREATE `src/hooks/useExercisesByMuscle.ts`
- CREATE `src/hooks/useBodyParts.ts`
- CREATE `src/hooks/useEquipments.ts`
- CREATE `src/hooks/useMuscles.ts`
- CREATE `src/hooks/useAddExerciseToRoutine.ts`
- CREATE `src/hooks/useLogSet.ts`
- CREATE `src/stores/workoutSession.store.ts`

Generate every file completely. Do not create any screen or UI component.