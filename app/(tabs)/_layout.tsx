import { Tabs } from 'expo-router';
import BottomTabBar from '@/components/BottomTabBar';

/**
 * Main app tab layout.
 * The custom BottomTabBar renders its own icons; tabBarIcon is not needed.
 * Add <Tabs.Screen> entries here whenever a new tab route is added.
 */
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#000' },
        headerTintColor: '#fff',
      }}>
      {/* Tab 1 — Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      {/* Tab 2 — Workout */}
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          headerShown: false,
        }}
      />
      {/* Tab 3 — Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
