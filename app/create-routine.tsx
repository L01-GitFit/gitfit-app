import { Alert } from 'react-native';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import RoutineSetRow from '@/components/workout/RoutineSetRow';
import gitfitService from '@/services/gitfit.service';
import { useRoutineStore } from '@/store/routine.store';

const exerciseIcon = require('../assets/exercise.png');

export default function CreateRoutineScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const draftName = useRoutineStore((s) => s.draftName);
  const draftExercises = useRoutineStore((s) => s.draftExercises);
  const setDraftName = useRoutineStore((s) => s.setDraftName);
  const removeExerciseFromDraft = useRoutineStore((s) => s.removeExerciseFromDraft);
  const updateDraftExerciseNotes = useRoutineStore((s) => s.updateDraftExerciseNotes);
  const addSetToDraftExercise = useRoutineStore((s) => s.addSetToDraftExercise);
  const updateDraftSet = useRoutineStore((s) => s.updateDraftSet);
  const removeDraftSet = useRoutineStore((s) => s.removeDraftSet);
  const discardDraft = useRoutineStore((s) => s.discardDraft);

  const createRoutineMutation = useMutation({
    mutationFn: gitfitService.createRoutine,
  });

  const addExerciseMutation = useMutation({
    mutationFn: ({ routineId, payload }: { routineId: string; payload: Parameters<typeof gitfitService.addExerciseToRoutine>[1] }) =>
      gitfitService.addExerciseToRoutine(routineId, payload),
  });

  const canSave = draftName.trim().length > 0 && draftExercises.length > 0;

  function handleCancel() {
    discardDraft();
    router.back();
  }

  async function handleSave() {
    if (!canSave) return;

    try {
      const createdRoutine = await createRoutineMutation.mutateAsync({
        name: draftName.trim(),
      });

      await Promise.all(
        draftExercises.map((draftExercise, index) => {
          const firstSet = draftExercise.sets[0];
          const repsTarget =
            firstSet?.reps != null ? String(firstSet.reps) : undefined;
          const { exercise } = draftExercise;

          // Keep only DTO-allowed fields and ensure required arrays are always present.
          const normalizedExercise = {
            exerciseDbId: String(exercise.exerciseId ?? '').trim(),
            name: String(exercise.name ?? '').trim(),
            gifUrl: exercise.gifUrl ? String(exercise.gifUrl) : undefined,
            targetMuscles: Array.isArray(exercise.targetMuscles) ? exercise.targetMuscles : [],
            bodyParts: Array.isArray(exercise.bodyParts) ? exercise.bodyParts : [],
            equipments: Array.isArray(exercise.equipments) ? exercise.equipments : [],
            secondaryMuscles: Array.isArray(exercise.secondaryMuscles)
              ? exercise.secondaryMuscles
              : [],
            instructions: Array.isArray(exercise.instructions) ? exercise.instructions : [],
          };

          return addExerciseMutation.mutateAsync({
            routineId: createdRoutine.id,
            payload: {
              exercise: normalizedExercise,
              sets: draftExercise.sets.length > 0 ? draftExercise.sets.length : undefined,
              repsTarget,
              weightTarget: firstSet?.weightKg ?? undefined,
              orderIndex: index,
            },
          });
        }),
      );

      await queryClient.invalidateQueries({ queryKey: ['routines'] });
      discardDraft();
      router.back();
    } catch (error) {
      let message = 'Failed to create routine. Please try again.';

      if (error instanceof AxiosError) {
        const apiMessage = error.response?.data?.message;
        if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
          message = apiMessage;
        } else if (Array.isArray(apiMessage) && apiMessage.length > 0) {
          message = String(apiMessage[0]);
        } else if (error.message) {
          message = error.message;
        }
      } else if (error instanceof Error && error.message) {
        message = error.message;
      }

      Alert.alert('Create routine failed', message);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['left', 'right']}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View
        className="bg-[#1c1c1e] flex-row items-center px-4 justify-between"
        style={{
          paddingTop: insets.top + 8,
          minHeight: 61 + insets.top,
          paddingBottom: 8,
        }}
      >
        <TouchableOpacity onPress={handleCancel} hitSlop={8}>
          <Text style={{ color: '#007ce2', fontSize: 12, fontFamily: 'Lexend_300Light' }}>
            Cancel
          </Text>
        </TouchableOpacity>

        <Text style={{ color: '#f4f4f4', fontSize: 24, fontFamily: 'Lexend_400Regular' }}>
          Create Routine
        </Text>

        <TouchableOpacity
          onPress={() => {
            void handleSave();
          }}
          hitSlop={8}
          disabled={!canSave || createRoutineMutation.isPending || addExerciseMutation.isPending}
        >
          <Text
            style={{
              color:
                canSave && !createRoutineMutation.isPending && !addExerciseMutation.isPending
                  ? '#007ce2'
                  : 'rgba(0,124,226,0.45)',
              fontSize: 12,
              fontFamily: 'Lexend_300Light',
            }}
          >
            {createRoutineMutation.isPending || addExerciseMutation.isPending ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        <View className="px-4 pt-2 gap-3">
          <View className="border-b-2 border-[#1c1c1e] px-2 pb-1">
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Routine title"
              placeholderTextColor="rgba(244,244,244,0.5)"
              style={{
                color: '#f4f4f4',
                fontSize: 34,
                lineHeight: 42,
                fontFamily: 'Lexend_400Regular',
                paddingVertical: 0,
              }}
            />
          </View>

          {draftExercises.length === 0 ? (
            <View className="items-center mt-5 px-2">
              <Image source={exerciseIcon} style={{ width: 48, height: 48, marginBottom: 26 }} resizeMode="contain" />
              <Text
                style={{
                  color: 'rgba(244,244,244,0.5)',
                  fontSize: 18,
                  lineHeight: 44,
                  textAlign: 'center',
                  fontFamily: 'Lexend_400Regular',
                  marginBottom: 18,
                }}
              >
                Get started by adding an exercise to your routine.
              </Text>

              <TouchableOpacity
                onPress={() => router.push('/add-exercise?mode=routine')}
                className="bg-[#1c1c1e] border border-[rgba(72,72,71,0.2)] rounded-lg h-[30px] w-[300px] items-center justify-center flex-row gap-2"
              >
                <MaterialIcons name="add" size={14} color="#f4f4f4" />
                <Text style={{ color: '#f4f4f4', fontSize: 18, lineHeight: 28, fontFamily: 'Lexend_700Bold' }}>
                  Add Exercise
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="px-2 mt-1 gap-4">
              {draftExercises.map((draftExercise) => {
                const { id: draftExerciseId, exercise, notes, sets } = draftExercise;

                return (
                <View key={draftExerciseId} className="pt-2 gap-3">
                  <View className="flex-row items-center gap-4">
                    <Image
                      source={{ uri: exercise.gifUrl }}
                      style={{ width: 64, height: 64, borderRadius: 32 }}
                      resizeMode="cover"
                    />

                    <Text
                      style={{
                        flex: 1,
                        color: '#ee9033',
                        fontSize: 20,
                        lineHeight: 28,
                        fontFamily: 'Lexend_400Regular',
                      }}
                      numberOfLines={2}
                    >
                      {exercise.name}
                    </Text>

                    <TouchableOpacity onPress={() => removeExerciseFromDraft(draftExerciseId)} hitSlop={8}>
                      <MaterialIcons name="more-vert" size={24} color="#f4f4f4" />
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    value={notes}
                    onChangeText={(value) => updateDraftExerciseNotes(draftExerciseId, value)}
                    placeholder="Add notes here..."
                    placeholderTextColor="#545454"
                    multiline
                    style={{
                      color: '#545454',
                      fontSize: 20,
                      lineHeight: 28,
                      fontFamily: 'Lexend_400Regular',
                      paddingVertical: 0,
                    }}
                  />

                  <View className="pt-1">
                    <View className="flex-row gap-8 pb-2">
                      <Text style={{ color: '#f4f4f4', fontSize: 16, fontFamily: 'Lexend_400Regular', width: 30 }}>SET</Text>
                      <Text style={{ color: '#f4f4f4', fontSize: 16, fontFamily: 'Lexend_400Regular', width: 24 }}>KG</Text>
                      <Text style={{ color: '#f4f4f4', fontSize: 16, fontFamily: 'Lexend_400Regular', width: 42 }}>REPS</Text>
                    </View>

                    <View style={{ gap: 2 }}>
                      {sets.map((set, index) => (
                        <View key={set.id} style={{ backgroundColor: index % 2 === 1 ? '#1c1c1e' : '#000000' }}>
                          <RoutineSetRow
                            setNumber={set.setNumber}
                            kg={set.weightKg == null ? '' : String(set.weightKg)}
                            reps={set.reps == null ? '' : String(set.reps)}
                            onKgChange={(value) =>
                              updateDraftSet(draftExerciseId, set.setNumber, {
                                weightKg: value.trim() === '' ? null : parseFloat(value) || null,
                              })
                            }
                            onRepsChange={(value) =>
                              updateDraftSet(draftExerciseId, set.setNumber, {
                                reps: value.trim() === '' ? null : parseInt(value, 10) || null,
                              })
                            }
                            onDelete={() => removeDraftSet(draftExerciseId, set.setNumber)}
                          />
                        </View>
                      ))}
                    </View>
                  </View>

                  <View className="items-center pt-1">
                    <TouchableOpacity
                      onPress={() => addSetToDraftExercise(draftExerciseId)}
                      className="bg-[#1c1c1e] border border-[rgba(72,72,71,0.2)] rounded-lg h-[34px] w-[152px] items-center justify-center flex-row gap-2"
                    >
                      <MaterialIcons name="add" size={14} color="#f4f4f4" />
                      <Text style={{ color: '#f4f4f4', fontSize: 18, lineHeight: 28, fontFamily: 'Lexend_700Bold' }}>
                        Add set
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )})}

              <View className="items-center pt-1">
                <TouchableOpacity
                  onPress={() => router.push('/add-exercise?mode=routine')}
                  className="bg-[#1c1c1e] border border-[rgba(72,72,71,0.2)] rounded-lg h-[30px] w-[300px] items-center justify-center flex-row gap-2"
                >
                  <MaterialIcons name="add" size={14} color="#f4f4f4" />
                  <Text style={{ color: '#f4f4f4', fontSize: 18, lineHeight: 28, fontFamily: 'Lexend_700Bold' }}>
                    Add Exercise
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}