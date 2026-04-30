import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
const activeBg = require('../assets/active_bg.png');

type TabName = 'home' | 'workout' | 'profile';

const TABS: { name: TabName; routeName: string; label: string; icon: string }[] = [
  { name: 'home', routeName: 'index', label: 'HOME', icon: 'home' },
  { name: 'workout', routeName: 'two', label: 'WORKOUT', icon: 'fitness-center' },
  { name: 'profile', routeName: 'profile', label: 'PROFILE', icon: 'person' },
];

// Figma active tab background image
const imgActiveBg = activeBg;

export default function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {TABS.map((tab, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[index]?.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(tab.routeName);
          }
        };

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={descriptors[state.routes[index]?.key]?.options?.tabBarAccessibilityLabel}>
            {isFocused && (
              <Image
                source={imgActiveBg}
                style={styles.activePill}
                resizeMode="cover"
              />
            )}
            <MaterialIcons
              name={tab.icon as any}
              size={24}
              color={isFocused ? '#ee9033' : 'rgba(244,244,244,0.5)'}
            />
            <Text style={[styles.label, isFocused ? styles.labelActive : styles.labelInactive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1e',
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 27,
    borderTopWidth: 1,
    borderTopColor: 'rgba(72,72,71,0.1)',
    gap: 21,
    // subtle top shadow in orange
    shadowColor: '#ee9033',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 53,
    borderRadius: 8,
    overflow: 'hidden',
    paddingVertical: 8,
    paddingHorizontal: 4,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    inset: 0,
    borderRadius: 8,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  labelActive: {
    color: '#ee9033',
  },
  labelInactive: {
    color: 'rgba(244,244,244,0.5)',
  },
});
