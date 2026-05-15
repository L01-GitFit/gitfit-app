import axios from 'axios';
import type { ExternalExercise, PaginatedResponse } from '../types/exercise.types';

const EXERCISEDB_BASE_URL = 'https://exercisedb-api-mauve.vercel.app/api/v1';
const DEFAULT_LIMIT = 10;

let client = axios.create({ baseURL: EXERCISEDB_BASE_URL });

// For testing purposes
export function __setClient(newClient: any) {
  client = newClient;
}

function toOffset(page: number, limit: number): number {
  return Math.max(0, (page - 1) * limit);
}

type NamedListItem = {
  name: string;
};

function mapNamedListResponse(data: { success: boolean; data: NamedListItem[] }) {
  return {
    success: data.success,
    data: data.data.map((item) => item.name),
  };
}

export async function searchExercises(
  query: string,
  page = 1,
  limit = DEFAULT_LIMIT,
): Promise<PaginatedResponse<ExternalExercise>> {
  const { data } = await client.get('/exercises/search', {
    params: { q: query, offset: toOffset(page, limit), limit },
  });
  return data;
}

export async function getExercises(
  page = 1,
  limit = DEFAULT_LIMIT,
): Promise<PaginatedResponse<ExternalExercise>> {
  const { data } = await client.get('/exercises', {
    params: { offset: toOffset(page, limit), limit },
  });
  return data;
}

export async function getExercisesByBodyPart(
  bodyPart: string,
  page = 1,
  limit = DEFAULT_LIMIT,
): Promise<PaginatedResponse<ExternalExercise>> {
  const { data } = await client.get(`/bodyparts/${encodeURIComponent(bodyPart)}/exercises`, {
    params: { offset: toOffset(page, limit), limit },
  });
  return data;
}

export async function getExercisesByEquipment(
  equipment: string,
  page = 1,
  limit = DEFAULT_LIMIT,
): Promise<PaginatedResponse<ExternalExercise>> {
  const { data } = await client.get(`/equipments/${encodeURIComponent(equipment)}/exercises`, {
    params: { offset: toOffset(page, limit), limit },
  });
  return data;
}

export async function getExercisesByMuscle(
  muscle: string,
  page = 1,
  limit = DEFAULT_LIMIT,
): Promise<PaginatedResponse<ExternalExercise>> {
  const { data } = await client.get(`/muscles/${encodeURIComponent(muscle)}/exercises`, {
    params: { offset: toOffset(page, limit), limit },
  });
  return data;
}

export async function getBodyParts(): Promise<{ success: boolean; data: string[] }> {
  const { data } = await client.get('/bodyparts');
  return mapNamedListResponse(data);
}

export async function getEquipments(): Promise<{ success: boolean; data: string[] }> {
  const { data } = await client.get('/equipments');
  return mapNamedListResponse(data);
}

export async function getMuscles(): Promise<{ success: boolean; data: string[] }> {
  const { data } = await client.get('/muscles');
  return mapNamedListResponse(data);
}

const exerciseDbService = {
  searchExercises,
  getExercises,
  getExercisesByBodyPart,
  getExercisesByEquipment,
  getExercisesByMuscle,
  getBodyParts,
  getEquipments,
  getMuscles,
};

export default exerciseDbService;
