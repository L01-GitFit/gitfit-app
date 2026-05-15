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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import ExerciseSelectCard from '@/components/workout/ExerciseSelectCard';
import { useExerciseSearch } from '@/hooks/useExerciseSearch';
import { useEquipments } from '@/hooks/useEquipments';
import { useMuscles } from '@/hooks/useMuscles';
import { useRoutineStore } from '@/store/routine.store';
import { useWorkoutSessionStore } from '@/store/workoutSession.store';
import exerciseDbService from '@/services/exercisedb.service';
import type { ExternalExercise } from '@/types/exercise.types';

type FilterModalType = 'equipment' | 'muscle' | null;
const PAGE_SIZE = 10;

function flattenPages<T>(
  data:
    | {
        pages: Array<{ data: T[] }>;
      }
    | undefined,
): T[] {
  return data?.pages.flatMap((page) => page.data) ?? [];
}

export default function AddExerciseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode } = useLocalSearchParams<{ mode?: 'routine' | 'workout' }>();
  const selectionMode = mode === 'routine' ? 'routine' : 'workout';

  const workoutExercises = useWorkoutSessionStore((s) => s.exercises);
  const addExercise = useWorkoutSessionStore((s) => s.addExercise);
  const addExerciseToDraft = useRoutineStore((s) => s.addExerciseToDraft);

  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [equipmentFilter, setEquipmentFilter] = useState<string | null>(null);
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);
  const [filterModal, setFilterModal] = useState<FilterModalType>(null);

  useFocusEffect(
    useCallback(() => {
      setSelectedIds(new Set());
      setQuery('');
      setEquipmentFilter(null);
      setMuscleFilter(null);
      setFilterModal(null);
    }, []),
  );

  // ----- Data fetching -----
  const searchResult = useExerciseSearch(query, PAGE_SIZE);

  const allExercisesQuery = useInfiniteQuery({
    queryKey: ['exercises', 'all'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => exerciseDbService.getExercises(pageParam, PAGE_SIZE),
    staleTime: 10 * 60 * 1000,
    enabled: query.trim().length <= 1 && !equipmentFilter && !muscleFilter,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.metadata;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });

  const byEquipmentQuery = useInfiniteQuery({
    queryKey: ['exercises', 'equipment', equipmentFilter],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      exerciseDbService.getExercisesByEquipment(equipmentFilter!, pageParam, PAGE_SIZE),
    enabled: !!equipmentFilter && query.trim().length <= 1 && !muscleFilter,
    staleTime: 10 * 60 * 1000,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.metadata;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });

  const byMuscleQuery = useInfiniteQuery({
    queryKey: ['exercises', 'muscle', muscleFilter],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      exerciseDbService.getExercisesByMuscle(muscleFilter!, pageParam, PAGE_SIZE),
    enabled: !!muscleFilter && query.trim().length <= 1,
    staleTime: 10 * 60 * 1000,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.metadata;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });

  const { data: equipments } = useEquipments();
  const { data: muscles } = useMuscles();

  // Determine active data source
  const exercises: ExternalExercise[] = useMemo(() => {
    if (query.trim().length > 1) return flattenPages(searchResult.data);
    if (muscleFilter) return flattenPages(byMuscleQuery.data);
    if (equipmentFilter) return flattenPages(byEquipmentQuery.data);
    return flattenPages(allExercisesQuery.data);
  }, [query, muscleFilter, equipmentFilter, searchResult.data, byMuscleQuery.data, byEquipmentQuery.data, allExercisesQuery.data]);

  const isLoading =
    (query.trim().length > 1 && searchResult.isLoading) ||
    (!!muscleFilter && byMuscleQuery.isLoading) ||
    (!!equipmentFilter && byEquipmentQuery.isLoading) ||
    (!query && !equipmentFilter && !muscleFilter && allExercisesQuery.isLoading);

  const isFetchingNextPage =
    (query.trim().length > 1 && searchResult.isFetchingNextPage) ||
    (!!muscleFilter && byMuscleQuery.isFetchingNextPage) ||
    (!!equipmentFilter && byEquipmentQuery.isFetchingNextPage) ||
    (!query && !equipmentFilter && !muscleFilter && allExercisesQuery.isFetchingNextPage);

  const hasNextPage =
    (query.trim().length > 1 && !!searchResult.hasNextPage) ||
    (!!muscleFilter && !!byMuscleQuery.hasNextPage) ||
    (!!equipmentFilter && !!byEquipmentQuery.hasNextPage) ||
    (!query && !equipmentFilter && !muscleFilter && !!allExercisesQuery.hasNextPage);

  const fetchNextPage = useCallback(() => {
    if (isFetchingNextPage || !hasNextPage) return;

    if (query.trim().length > 1) {
      void searchResult.fetchNextPage();
      return;
    }

    if (muscleFilter) {
      void byMuscleQuery.fetchNextPage();
      return;
    }

    if (equipmentFilter) {
      void byEquipmentQuery.fetchNextPage();
      return;
    }

    void allExercisesQuery.fetchNextPage();
  }, [
    allExercisesQuery,
    byEquipmentQuery,
    byMuscleQuery,
    equipmentFilter,
    hasNextPage,
    isFetchingNextPage,
    muscleFilter,
    query,
    searchResult,
  ]);

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
    if (selectionMode === 'routine') {
      exercises
        .filter((e) => selectedIds.has(e.exerciseId))
        .forEach((e) => addExerciseToDraft(e));
    } else {
      exercises
        .filter((e) => selectedIds.has(e.exerciseId))
        .forEach((e) => addExercise(e));
    }

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
    <SafeAreaView className="flex-1 bg-black" edges={['left', 'right']}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      {/* Header */}
      <View
        className="bg-[#1c1c1e] flex-row items-center px-4"
        style={{
          paddingTop: insets.top + 8,
          minHeight: 61 + insets.top,
          paddingBottom: 8,
          justifyContent: 'space-between',
        }}
      >
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
        <View style={{ width: 48, height: 48 }} />
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
          onEndReached={() => {
            void fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4 items-center justify-center">
                <ActivityIndicator color="#ee9033" size="small" />
              </View>
            ) : null
          }
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
