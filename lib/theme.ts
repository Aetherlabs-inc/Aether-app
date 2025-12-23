// src/theme/theme.ts

// Base palette
const palette = {
    // core neutrals
    white: '#FFFFFF',
    offWhite: '#FAFAFA',
    neutral50: '#F9FAFB',
    neutral100: '#F5F5F5',
    neutral200: '#E5E5E5',
    neutral300: '#D4D4D4',
    neutral400: '#9CA3AF',
    neutral500: '#6B7280',
    neutral600: '#4B5563',
    neutral800: '#1F2933',
    neutral900: '#111827',

    // your palette
    palladian: '#EEE9DF',
    oatmeal: '#C9C1B1',
    blueFantastic: '#2C3B4D',
    burningFlame: '#FFB162',
    truffleTrouble: '#A35139',
    abyssalAnchorfishBlue: '#1B2632',

    // system feedback
    red500: '#C62828',
    red100: '#FFEBEE',
    green500: '#4CAF50',
    amber500: '#FF9800',
    sky500: '#2196F3',
};

const baseTypography = {
    fontFamily: {
        regular: 'System',
        medium: 'System',
        semibold: 'System',
        bold: 'System',
    },

    fontSize: {
        xs: 12,
        sm: 13,
        base: 15,
        md: 16,
        lg: 17,
        xl: 20,
        '2xl': 24,
        '3xl': 32,
        '4xl': 36,
    },

    fontWeight: {
        normal: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },

    lineHeight: {
        tight: 20,
        normal: 24,
        relaxed: 28,
        loose: 44,
    },

    letterSpacing: {
        tight: -0.8,
        normal: -0.2,
        wide: -0.1,
    },

    heading1: {
        fontSize: 28,
        lineHeight: 32,
        fontWeight: '600' as const,
    },
    heading2: {
        fontSize: 22,
        lineHeight: 28,
        fontWeight: '600' as const,
    },
    body: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '400' as const,
    },
    caption: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '400' as const,
    },
};

const baseSpacing = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    screenPaddingHorizontal: 20,
    screenPaddingVertical: 20,
    sectionGap: 16,
};

const baseRadius = {
    sm: 6,
    base: 8,
    md: 12,
    lg: 14,
    xl: 16,
    '2xl': 20,
    full: 9999,
    card: 20,
    button: 16,
    input: 12,
    pill: 9999,
};

const baseShadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    base: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 5,
    },
};

// LIGHT THEME
export const lightTheme = {
    mode: 'light' as const,
    palette,
    colors: {
        // brand intent
        primary: palette.blueFantastic,
        primaryLight: palette.blueFantastic,
        primaryDark: palette.abyssalAnchorfishBlue,

        // accents
        secondary: palette.truffleTrouble,
        accent: palette.burningFlame,

        // backgrounds
        background: palette.palladian,
        backgroundSecondary: palette.oatmeal,
        backgroundTertiary: 'rgba(201, 193, 177, 0.65)',

        // surfaces
        surface: 'rgba(255, 255, 255, 0.55)',
        surfaceMuted: 'rgba(255, 255, 255, 0.35)',
        surfaceElevated: palette.white,

        // text
        text: palette.abyssalAnchorfishBlue,
        textSecondary: 'rgba(27, 38, 50, 0.72)',
        textTertiary: 'rgba(27, 38, 50, 0.52)',
        textInverse: palette.white,
        textOnPrimary: palette.white,

        // borders
        border: 'rgba(27, 38, 50, 0.10)',
        borderLight: 'rgba(27, 38, 50, 0.06)',
        borderDark: 'rgba(27, 38, 50, 0.18)',

        // feedback
        success: palette.green500,
        error: palette.red500,
        warning: palette.amber500,
        info: palette.blueFantastic,
        errorBackground: palette.red100,

        // states
        disabled: 'rgba(27, 38, 50, 0.08)',
        disabledText: 'rgba(27, 38, 50, 0.35)',
        pressed: 'rgba(27, 38, 50, 0.05)',
        overlay: 'rgba(0, 0, 0, 0.45)',

        // components
        inputBackground: 'rgba(255, 255, 255, 0.60)',
        inputBorder: 'rgba(27, 38, 50, 0.10)',
        cardBackground: 'rgba(255, 255, 255, 0.55)',
        tabBarBackground: palette.palladian,
        divider: 'rgba(27, 38, 50, 0.08)',
    },
    typography: baseTypography,
    spacing: baseSpacing,
    borderRadius: baseRadius,
    shadows: baseShadows,
};

// DARK THEME
export const darkTheme = {
    mode: 'dark' as const,
    palette,
    colors: {
        // brand intent
        primary: palette.blueFantastic,
        primaryLight: 'rgba(44, 59, 77, 0.92)',
        primaryDark: palette.abyssalAnchorfishBlue,

        // accents
        secondary: palette.burningFlame,
        accent: palette.truffleTrouble,

        // backgrounds
        background: palette.abyssalAnchorfishBlue,
        backgroundSecondary: palette.blueFantastic,
        backgroundTertiary: 'rgba(44, 59, 77, 0.85)',

        // surfaces
        surface: 'rgba(255, 255, 255, 0.06)',
        surfaceMuted: 'rgba(255, 255, 255, 0.04)',
        surfaceElevated: 'rgba(255, 255, 255, 0.08)',

        // text
        text: palette.palladian,
        textSecondary: 'rgba(238, 233, 223, 0.75)',
        textTertiary: 'rgba(238, 233, 223, 0.55)',
        textInverse: palette.abyssalAnchorfishBlue,
        textOnPrimary: palette.palladian,

        // borders
        border: 'rgba(238, 233, 223, 0.10)',
        borderLight: 'rgba(238, 233, 223, 0.06)',
        borderDark: 'rgba(0, 0, 0, 0.55)',

        // feedback
        success: palette.green500,
        error: palette.red500,
        warning: palette.amber500,
        info: palette.burningFlame,
        errorBackground: 'rgba(198, 40, 40, 0.18)',

        // states
        disabled: 'rgba(238, 233, 223, 0.12)',
        disabledText: 'rgba(238, 233, 223, 0.45)',
        pressed: 'rgba(238, 233, 223, 0.08)',
        overlay: 'rgba(0, 0, 0, 0.70)',

        // components
        inputBackground: 'rgba(255, 255, 255, 0.06)',
        inputBorder: 'rgba(238, 233, 223, 0.12)',
        cardBackground: 'rgba(255, 255, 255, 0.06)',
        tabBarBackground: palette.abyssalAnchorfishBlue,
        divider: 'rgba(238, 233, 223, 0.10)',
    },
    typography: baseTypography,
    spacing: baseSpacing,
    borderRadius: baseRadius,
    shadows: baseShadows,
};

export type Theme = typeof lightTheme | typeof darkTheme;
export type ThemeMode = 'light' | 'dark';
