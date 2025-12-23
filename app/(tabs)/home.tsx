import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProfileModal } from '@/components/profile/ProfileModal';

export default function HomeScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notificationCount] = useState(5); // Placeholder notification count
  const [searchQuery, setSearchQuery] = useState('');

  const actionCards = [
    {
      id: 'scan',
      title: 'Scan',
      subtitle: 'Documents, ID cards...',
      icon: 'scan-outline',
      onPress: () => router.push('/(tabs)/scan'),
    },
    {
      id: 'View Artworks',
      title: 'View your artworks',
      subtitle: 'View your artworks',
      icon: 'images-outline',
      onPress: () => router.push('/artworks'),
    },
    {
      id: 'View Certificates',
        title: 'View your certificates',
      subtitle: 'View your certificates',
      icon: 'document-text-outline',
      onPress: () => router.push('/artworks'),
    },
    {
      id: 'Manage Certificates',
      title: 'Manage your certificates',
      subtitle: 'Manage your certificates',
      icon: 'create-outline',
      onPress: () => router.push('/artworks/manage'),
    },
    
    
  ];

  const firstName = user?.full_name?.split(' ')[0] || 'User';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Profile and Notifications */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => setShowProfileModal(true)}
          >
            {user?.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                style={styles.profileAvatar}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.profileAvatarPlaceholder,
                  {
                    backgroundColor: theme.colors.surfaceMuted,
                  },
                ]}
              >
                <Ionicons
                  name="person"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => {
              // TODO: Navigate to notifications
              console.log('Notifications pressed');
            }}
          >
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
            {notificationCount > 0 && (
              <View style={[styles.notificationBadge, { backgroundColor: '#FF9800' }]}>
                <Text style={styles.notificationBadgeText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={[styles.greetingText, { color: theme.colors.textSecondary }]}>
            Hi {firstName},
          </Text>
          <Text style={[styles.greetingSubtext, { color: theme.colors.text }]}>
            How can I help you today?
          </Text>
        </View>

        {/* Action Cards Grid */}
        <View style={styles.actionCardsContainer}>
          {actionCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.actionCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius?.lg || 16,
                  ...theme.shadows.base,
                },
              ]}
              onPress={card.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.actionCardIconContainer, { backgroundColor: theme.colors.surfaceMuted }]}>
                <Ionicons name={card.icon as any} size={28} color={theme.colors.primary} />
              </View>
              <Text style={[styles.actionCardTitle, { color: theme.colors.text }]}>
                {card.title}
              </Text>
              <Text style={[styles.actionCardSubtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {card.subtitle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: theme.colors.surfaceMuted,
                borderRadius: theme.borderRadius?.lg || 16,
              },
            ]}
          >
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search"
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              style={styles.voiceSearchButton}
              onPress={() => {
                // TODO: Implement voice search
                console.log('Voice search pressed');
              }}
            >
              <Ionicons name="mic-outline" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Profile Modal */}
      <ProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
  },
  profileAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  greetingSection: {
    paddingHorizontal: 24,
    paddingTop: 25,
    paddingBottom: 28,
  },
  greetingText: {
    fontSize: 40,
    fontWeight: '600',
    marginBottom: 1,
  },
  greetingSubtext: {
    fontSize: 45,
    fontWeight: 'bold',
  },
  actionCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 40,
  },
  actionCard: {
    width: '47%',
    padding: 20,
    alignItems: 'flex-start',
  },
  actionCardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionCardSubtitle: {
    fontSize: 13,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  voiceSearchButton: {
    padding: 4,
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
});
