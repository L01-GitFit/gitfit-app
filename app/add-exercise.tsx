import { useState, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import ExerciseSelectCard from '@/components/workout/ExerciseSelectCard';
import { useExerciseSearch } from '@/hooks/useExerciseSearch';
import { useEquipments } from '@/hooks/useEquipments';
import { useMuscles } from '@/hooks/useMuscles';
import { useWorkoutSessionStore } from '@/store/workoutSession.store';
import exerciseDbService from '@/services/exercisedb.service';
import type { ExternalExercise } from '@/types/exercise.types';

type FilterModalType = 'equipment' | 'muscle' | null;

export default function AddExerciseScreen() {
  const router = useRouter();
  const addExercise = useWorkoutSessionStore((s) => s.addExercise);

  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [equipmentFilter, setEquipmentFilter] = useState<string | null>(null);
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);
  const [filterModal, setFilterModal] = useState<FilterModalType>(null);

  // ----- Data fetching -----
  const searchResult = useExerciseSearch(query);

  const allExercisesQuery = useQuery({
    queryKey: ['exercises', 'all'],
    queryFn: () => exerciseDbService.getExercises(1, 20),
    staleTime: 10 * 60 * 1000,
    enabled: query.trim().length <= 1 && !equipmentFilter && !muscleFilter,
  });

  const byEquipmentQuery = useQuery({
    queryKey: ['exercises', 'equipment', equipmentFilter],
    queryFn: () => exerciseDbService.getExercisesByEquipment(equipmentFilter!, 1, 20),
    enabled: !!equipmentFilter && query.trim().length <= 1 && !muscleFilter,
    staleTime: 10 * 60 * 1000,
  });

  const byMuscleQuery = useQuery({
    queryKey: ['exercises', 'muscle', muscleFilter],
    queryFn: () => exerciseDbService.getExercisesByMuscle(muscleFilter!, 1, 20),
    enabled: !!muscleFilter && query.trim().length <= 1,
    staleTime: 10 * 60 * 1000,
  });

  const { data: equipments } = useEquipments();
  const { data: muscles } = useMuscles();

  // Determine active data source
  const exercises: ExternalExercise[] = useMemo(() => {
    if (query.trim().length > 1) return searchResult.data?.data ?? [];
    if (muscleFilter) return byMuscleQuery.data?.data ?? [];
    if (equipmentFilter) return byEquipmentQuery.data?.data ?? [];
    return allExercisesQuery.data?.data ?? [];
  }, [query, muscleFilter, equipmentFilter, searchResult.data, byMuscleQuery.data, byEquipmentQuery.data, allExercisesQuery.data]);

  const isLoading =
    (query.trim().length > 1 && searchResult.isLoading) ||
    (!!muscleFilter && byMuscleQuery.isLoading) ||
    (!!equipmentFilter && byEquipmentQuery.isLoading) ||
    (!query && !equipmentFilter && !muscleFilter && allExercisesQuery.isLoading);

  // ----- Selection -----
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ----- Confirm selection -----
  function handleAddExercises() {
    exercises
      .filter((e) => selectedIds.has(e.exerciseId))
      .forEach((e) => addExercise(e));
    router.back();
  }

  // ----- Filter modal -----
  const filterOptions: string[] =
    filterModal === 'equipment'
      ? (equipments?.data ?? [])
      : (muscles?.data ?? []);

  const currentFilter = filterModal === 'equipment' ? equipmentFilter : muscleFilter;

  function applyFilter(value: string) {
    if (filterModal === 'equipment') {
      setEquipmentFilter(value === currentFilter ? null : value);
    } else {
      setMuscleFilter(value === currentFilter ? null : value);
    }
    setFilterModal(null);
  }

  // ----- Render -----
  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      {/* Header */}
      <View className="bg-[#1c1c1e] h-[89px] flex-row items-end pb-3 px-4 gap-14">
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Text style={{ color: '#007ce2', fontSize: 12, fontFamily: 'Lexend_300Light' }}>
            Cancel
          </Text>
        </TouchableOpacity>
        <Text
          style={{ color: '#f4f4f4', fontSize: 24, fontFamily: 'Lexend_400Regular' }}
        >
          Add exercise
        </Text>
      </View>

      {/* Search + Filters */}
      <View className="px-4 pt-3 pb-2 gap-2">
        {/* Search bar */}
        <View className="bg-[#111] border border-[rgba(72,72,71,0.2)] rounded-lg h-10 flex-row items-center px-3 gap-2">
          <MaterialIcons name="search" size={24} color="rgba(244,244,244,0.2)" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search exercise"
            placeholderTextColor="rgba(244,244,244,0.2)"
            style={{
              flex: 1,
              color: '#f4f4f4',
              fontSize: 18,
              fontFamily: 'Lexend_700Bold',
            }}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <MaterialIcons name="close" size={18} color="rgba(244,244,244,0.5)" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter pills */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => setFilterModal('equipment')}
            className="bg-[#111] border border-[rgba(72,72,71,0.2)] rounded-lg h-[30px] flex-1 items-center justify-center"
          >
            <Text
              style={{ color: equipmentFilter ? '#ee9033' : '#f4f4f4', fontSize: 12, fontFamily: 'Lexend_400Regular' }}
              numberOfLines={1}
            >
              {equipmentFilter ?? 'All Equipments'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterModal('muscle')}
            className="bg-[#111] border border-[rgba(72,72,71,0.2)] rounded-lg h-[30px] flex-1 items-center justify-center"
          >
            <Text
              style={{ color: muscleFilter ? '#ee9033' : '#f4f4f4', fontSize: 12, fontFamily: 'Lexend_400Regular' }}
              numberOfLines={1}
            >
              {muscleFilter ?? 'All Muscles'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Exercise list */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ee9033" size="large" />
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.exerciseId}
          renderItem={({ item }) => (
            <ExerciseSelectCard
              exercise={item}
              selected={selectedIds.has(item.exerciseId)}
              onPress={() => toggleSelect(item.exerciseId)}
            />
          )}
          contentContainerStyle={{ paddingBottom: selectedIds.size > 0 ? 80 : 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating CTA */}
      {selectedIds.size > 0 && (
        <View className="absolute bottom-0 left-0 right-0 pb-8 px-4">
          <TouchableOpacity
            onPress={handleAddExercises}
            className="bg-[#ee9033] rounded-lg h-12 items-center justify-center"
          >
            <Text
              style={{ color: '#000', fontFamily: 'Lexend_700Bold', fontSize: 16 }}
            >
              {`ADD ${selectedIds.size} EXERCISE${selectedIds.size > 1 ? 'S' : ''}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter selection modal */}
      <Modal
        visible={filterModal !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModal(null)}
      >
        <TouchableOpacity
          className="flex-1 bg-[rgba(0,0,0,0.6)]"
          activeOpacity={1}
          onPress={() => setFilterModal(null)}
        />
        <View className="bg-[#1c1c1e] rounded-t-2xl max-h-[50%]">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-[rgba(72,72,71,0.3)]">
            <Text style={{ color: '#f4f4f4', fontSize: 16, fontFamily: 'Lexend_600SemiBold' }}>
              {filterModal === 'equipment' ? 'Equipment' : 'Muscle'}
            </Text>
            <TouchableOpacity onPress={() => setFilterModal(null)} hitSlop={8}>
              <MaterialIcons name="close" size={22} color="#f4f4f4" />
            </TouchableOpacity>
          </View>

          {/* Clear filter option */}
          <TouchableOpacity
            onPress={() => applyFilter(currentFilter ?? '')}
            className="px-4 py-3 border-b border-[rgba(72,72,71,0.2)]"
          >
            <Text style={{ color: '#ee9033', fontSize: 14, fontFamily: 'Lexend_400Regular' }}>
              {filterModal === 'equipment' ? 'All Equipments' : 'All Muscles'}
            </Text>
          </TouchableOpacity>

          <FlatList
            data={filterOptions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => applyFilter(item)}
                className="px-4 py-3 flex-row items-center justify-between border-b border-[rgba(72,72,71,0.2)]"
              >
                <Text
                  style={{
                    color: item === currentFilter ? '#ee9033' : '#f4f4f4',
                    fontSize: 14,
                    fontFamily: 'Lexend_400Regular',
                    textTransform: 'capitalize',
                  }}
                >
                  {item}
                </Text>
                {item === currentFilter && (
                  <MaterialIcons name="check" size={18} color="#ee9033" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}
