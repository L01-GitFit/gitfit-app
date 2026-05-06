import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

// Figma asset URLs — replace with real API-backed assets
const AVATAR = 'https://www.figma.com/api/mcp/asset/16efc627-d90b-4134-94e2-1e7c0a2ae85e';
const IMG = {
  benchPress: 'https://www.figma.com/api/mcp/asset/b78e02d0-351e-47e6-960d-afe5f5d18575',
  legExtension: 'https://www.figma.com/api/mcp/asset/d5be2dce-a4a1-457f-98bc-89f145fc567a',
  lyingLegCurl: 'https://www.figma.com/api/mcp/asset/a5df2313-1563-4a06-b595-e368c044965e',
  squatSmith: 'https://www.figma.com/api/mcp/asset/db813a95-aa12-42ed-81b4-01d5dee86e88',
  latPulldown: 'https://www.figma.com/api/mcp/asset/fe9f1097-a326-4c3f-91ff-72073c253ace',
  straightArmPull: 'https://www.figma.com/api/mcp/asset/470c4059-6aad-49b2-91f7-7c8f690fba31',
  tBarRow: 'https://www.figma.com/api/mcp/asset/b78e02d0-351e-47e6-960d-afe5f5d18575',
};

type Exercise = { id: string; image: string; label: string };
type WorkoutSession = {
  id: string;
  name: string;
  time: string;
  volume: string;
  records?: number;
  exercises: Exercise[];
  moreCount?: number;
};
type WorkoutLog = { username: string; timeAgo: string; sessions: WorkoutSession[] };

// TODO: replace with real data from API / store
const MOCK_LOG: WorkoutLog = {
  username: 'didiude',
  timeAgo: '2 days ago',
  sessions: [
    {
      id: 's1',
      name: 'Morning workout',
      time: '3min 6s',
      volume: '960kg',
      exercises: [
        { id: 'e1', image: IMG.benchPress, label: '2 sets Bench Press (Barbell)' },
      ],
    },
    {
      id: 's2',
      name: 'Afternoon workout',
      time: '53min',
      volume: '6.795kg',
      records: 4,
      exercises: [
        { id: 'e2', image: IMG.legExtension, label: '3 sets Leg Extension (Machine)' },
        { id: 'e3', image: IMG.lyingLegCurl, label: '3 sets Lying Leg Curl (Machine)' },
        { id: 'e4', image: IMG.squatSmith, label: '3 sets Squat (Smith Machine)' },
      ],
      moreCount: 3,
    },
    {
      id: 's3',
      name: 'Morning workout',
      time: '36min',
      volume: '3.600kg',
      records: 1,
      exercises: [
        { id: 'e5', image: IMG.latPulldown, label: '3 sets Lat Pulldown (Machine)' },
        { id: 'e6', image: IMG.straightArmPull, label: '3 sets Straight arm lat pull down (Cable)' },
        { id: 'e7', image: IMG.tBarRow, label: '3 sets Chest support T-bar row' },
      ],
      moreCount: 2,
    },
  ],
};

function StatItem({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View className="gap-[7px]">
      <Text className="text-[rgba(244,244,244,0.5)] text-xs font-light">{label}</Text>
      <Text className={`text-[#f4f4f4] text-xs ${bold ? 'font-bold' : 'font-semibold'}`}>
        {value}
      </Text>
    </View>
  );
}

function WorkoutCard({ session }: { session: WorkoutSession }) {
  return (
    <View className="border-b-2 border-[#1c1c1e] pb-3">
      {/* Session header */}
      <View className="border-b-2 border-[#1c1c1e] py-2 gap-[15px]">
        <Text className="text-[#ee9033] text-xl font-semibold">{session.name}</Text>
        <View className="flex-row gap-[10px] items-center">
          <StatItem label="Time" value={session.time} />
          <StatItem label="Volume" value={session.volume} bold />
          {session.records !== undefined && (
            <View className="gap-[7px]">
              <Text className="text-[rgba(244,244,244,0.5)] text-xs font-light">Records</Text>
              <View className="flex-row items-center">
                <MaterialIcons name="emoji-events" size={20} color="#ee9033" />
                <Text className="text-[#f4f4f4] text-xs font-bold">{session.records}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Exercise list */}
      <View className="gap-[37px] mt-[10px]">
        {session.exercises.map((ex) => (
          <View key={ex.id} className="flex-row items-center gap-[10px]">
            <Image
              source={{ uri: ex.image }}
              style={{ width: 60, height: 60, borderRadius: 30 }}
            />
            <Text className="text-[#f4f4f4] text-xs flex-1">{ex.label}</Text>
          </View>
        ))}
      </View>

      {/* See more */}
      {!!session.moreCount && (
        <TouchableOpacity className="items-center mt-[10px]">
          <Text className="text-[rgba(244,244,244,0.5)] text-xs">
            See {session.moreCount} more exercises
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const { username, timeAgo, sessions } = MOCK_LOG;

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <Text className="text-white text-2xl font-bold mt-2 mb-4">Home</Text>

        {/* User info */}
        <View className="flex-row gap-2 items-start mb-3">
          <Image
            source={{ uri: AVATAR }}
            style={{ width: 50, height: 50, borderRadius: 25 }}
          />
          <View>
            <Text className="text-[#ee9033] text-xs">{username}</Text>
            <Text className="text-[#d9d9d9] text-xs">{timeAgo}</Text>
          </View>
        </View>

        {/* Workout session cards */}
        {sessions.map((session) => (
          <WorkoutCard key={session.id} session={session} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
