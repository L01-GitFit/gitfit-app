import axios from 'axios';
import type { ExternalExercise, PaginatedResponse } from '../types/exercise.types';

const EXERCISEDB_BASE_URL = 'https://exercisedb-api-mauve.vercel.app/api/v1';

const client = axios.create({ baseURL: EXERCISEDB_BASE_URL });

export async function searchExercises(
  query: string,
  page = 1,
  limit = 10,
): Promise<PaginatedResponse<ExternalExercise>> {
  const { data } = await client.get('/exercises/search', {
    params: { query, page, limit },
  });
  return data;
}

export async function getExercises(
  page = 1,
  limit = 10,
): Promise<PaginatedResponse<ExternalExercise>> {
  const { data } = await client.get('/exercises', { params: { page, limit } });
  return data;
}

export async function getExercisesByBodyPart(
  bodyPart: string,
  page = 1,
  limit = 10,
): Promise<PaginatedResponse<ExternalExercise>> {
  const { data } = await client.get(`/exercises/bodyPart/${encodeURIComponent(bodyPart)}`, {
    params: { page, limit },
  });
  return data;
}

export async function getExercisesByEquipment(
  equipment: string,
  page = 1,
  limit = 10,
): Promise<PaginatedResponse<ExternalExercise>> {
  const { data } = await client.get(`/exercises/equipment/${encodeURIComponent(equipment)}`, {
    params: { page, limit },
  });
  return data;
}

export async function getExercisesByMuscle(
  muscle: string,
  page = 1,
  limit = 10,
): Promise<PaginatedResponse<ExternalExercise>> {
  const { data } = await client.get(`/exercises/muscle/${encodeURIComponent(muscle)}`, {
    params: { page, limit },
  });
  return data;
}

export async function getBodyParts(): Promise<{ success: boolean; data: string[] }> {
  const { data } = await client.get('/exercises/bodyPartList');
  return data;
}

export async function getEquipments(): Promise<{ success: boolean; data: string[] }> {
  const { data } = await client.get('/exercises/equipmentList');
  return data;
}

export async function getMuscles(): Promise<{ success: boolean; data: string[] }> {
  const { data } = await client.get('/exercises/muscleList');
  return data;
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
