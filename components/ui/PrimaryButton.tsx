import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
  textStyle,
}: PrimaryButtonProps) {
  const theme = useTheme();

  const getButtonStyle = () => {
    if (variant === 'outline') {
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.border,
      };
    }
    if (variant === 'secondary') {
      return {
        backgroundColor: theme.colors.surfaceMuted,
      };
    }
    return {
      backgroundColor: theme.colors.primary,
    };
  };

  const getTextStyle = () => {
    if (variant === 'outline' || variant === 'secondary') {
      return {
        color: theme.colors.text,
      };
    }
    return {
      color: theme.colors.textOnPrimary,
    };
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          borderRadius: theme.borderRadius.button,
          paddingVertical: theme.spacing.base,
          paddingHorizontal: theme.spacing.xl,
        },
        getButtonStyle(),
        (disabled || loading) && {
          opacity: 0.5,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? theme.colors.textOnPrimary : theme.colors.text}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold,
            },
            getTextStyle(),
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  text: {
    textAlign: 'center',
  },
});

