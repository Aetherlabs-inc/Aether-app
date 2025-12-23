import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: theme.colors.tabBarBackground,
          borderRadius: 20,
          marginHorizontal: 16,
          marginBottom: Platform.OS === 'ios' ? 20 : 8,
        },
      ]}
    >
      <View style={styles.tabBarContent}>
        {/* Left side tabs */}
        <View style={styles.leftTabs}>
          {state.routes
            .filter((route) => route.name === 'home' || route.name === 'artworks')
            .map((route) => {
              const { options } = descriptors[route.key];
              const routeIndex = state.routes.findIndex((r) => r.key === route.key);
              const isFocused = state.index === routeIndex;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const iconName = route.name === 'home' ? 'home' : 'images';

              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  onPress={onPress}
                  style={[
                    styles.tabButton,
                    {
                      backgroundColor: isFocused ? theme.colors.background : 'transparent',
                    },
                  ]}
                >
                  <Ionicons
                    name={iconName as any}
                    size={24}
                    color={isFocused ? theme.colors.text : theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              );
            })}
        </View>

        {/* FAB Button */}
        <TouchableOpacity
          style={[
            styles.fabButton,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}
          onPress={() => router.push('/artworks/new')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={theme.colors.textOnPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const theme = useTheme();

  const screenOptions = useMemo(() => ({
    tabBarActiveTintColor: theme?.colors?.primary || '#007AFF',
    tabBarInactiveTintColor: theme?.colors?.textSecondary || '#666',
    tabBarStyle: {
      height: 0,
      display: 'none' as const,
    },
    headerShown: false,
  }), [theme]);

  return (
    <Tabs
      screenOptions={screenOptions}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="artworks"
        options={{
          title: 'Artworks',
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftTabs: {
    flexDirection: 'row',
    gap: 12,
  },
  tabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});


