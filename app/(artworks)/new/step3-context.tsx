import { useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Screen } from '@/components/ui/Screen';
import { Input } from '@/components/ui/Input';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useNewArtworkStore } from '@/store/useNewArtworkStore';

export default function Step3ContextScreen() {
  const theme = useTheme();
  const router = useRouter();

  const {
    location,
    forSale,
    price,
    setLocation,
    setForSale,
    setPrice,
  } = useNewArtworkStore();

  const handleDone = () => {
    router.push('/(artworks)/new/success');
  };

  return (
    <Screen scrollable edges={['top']}>
      <View
        style={[
          styles.container,
          {
            paddingHorizontal: theme.spacing.screenPaddingHorizontal,
            paddingTop: theme.spacing['2xl'],
            paddingBottom: theme.spacing['2xl'],
          },
        ]}
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              {
                fontSize: theme.typography.heading1.fontSize,
                fontWeight: theme.typography.heading1.fontWeight,
                color: theme.colors.text,
                marginBottom: theme.spacing.base,
              },
            ]}
          >
            Additional Context
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing['2xl'],
              },
            ]}
          >
            Step 3 of 3: Optional Information
          </Text>
        </View>

        <View style={styles.content}>
          <Input
            label="Location"
            placeholder="e.g., New York, NY"
            value={location}
            onChangeText={setLocation}
          />

          <View
            style={[
              styles.switchContainer,
              {
                paddingVertical: theme.spacing.base,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
                marginBottom: theme.spacing.base,
              },
            ]}
          >
            <View style={styles.switchLabelContainer}>
              <Text
                style={[
                  styles.switchLabel,
                  {
                    fontSize: theme.typography.fontSize.base,
                    color: theme.colors.text,
                    fontWeight: theme.typography.fontWeight.medium,
                  },
                ]}
              >
                For Sale
              </Text>
              <Text
                style={[
                  styles.switchDescription,
                  {
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textSecondary,
                    marginTop: theme.spacing.xs,
                  },
                ]}
              >
                Mark this artwork as available for purchase
              </Text>
            </View>
            <Switch
              value={forSale}
              onValueChange={setForSale}
              trackColor={{
                false: theme.colors.surfaceMuted,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.surface}
            />
          </View>

          {forSale && (
            <Input
              label="Price"
              placeholder="e.g., 5000"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          )}
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButton title="Done" onPress={handleDone} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 32,
  },
  content: {
    flex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    marginBottom: 4,
  },
  switchDescription: {
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 32,
  },
});

