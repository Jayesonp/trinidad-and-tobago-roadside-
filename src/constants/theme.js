// Color palette for RoadSide+ Trinidad & Tobago
export const colors = {
  // Primary brand colors
  primary: {
    main: '#ef4444',      // Red-500
    light: '#fca5a5',     // Red-300
    dark: '#dc2626',      // Red-600
    contrast: '#ffffff',
  },
  
  // Secondary colors
  secondary: {
    main: '#1fb8cd',      // Cyan-500
    light: '#67e8f9',     // Cyan-300
    dark: '#0891b2',      // Cyan-600
    contrast: '#ffffff',
  },
  
  // Background colors
  background: {
    primary: '#0f172a',   // Slate-900
    secondary: '#1e293b', // Slate-800
    tertiary: '#334155',  // Slate-700
  },
  
  // Surface colors
  surface: {
    primary: '#1e293b',   // Slate-800
    secondary: '#334155', // Slate-700
    tertiary: '#475569',  // Slate-600
  },
  
  // Text colors
  text: {
    primary: '#f1f5f9',   // Slate-100
    secondary: '#94a3b8', // Slate-400
    tertiary: '#64748b',  // Slate-500
    inverse: '#0f172a',   // Slate-900
    disabled: '#475569',  // Slate-600
  },
  
  // Status colors
  success: {
    main: '#10b981',      // Emerald-500
    light: '#6ee7b7',     // Emerald-300
    dark: '#059669',      // Emerald-600
  },
  
  error: {
    main: '#ef4444',      // Red-500
    light: '#fca5a5',     // Red-300
    dark: '#dc2626',      // Red-600
  },
  
  warning: {
    main: '#f59e0b',      // Amber-500
    light: '#fcd34d',     // Amber-300
    dark: '#d97706',      // Amber-600
  },
  
  info: {
    main: '#3b82f6',      // Blue-500
    light: '#93c5fd',     // Blue-300
    dark: '#2563eb',      // Blue-600
  },
  
  // Border colors
  border: {
    primary: '#334155',   // Slate-700
    secondary: '#475569', // Slate-600
    light: '#64748b',     // Slate-500
  },
  
  // Shadow
  shadow: {
    color: '#000000',
    opacity: 0.25,
  },
  
  // Trinidad & Tobago flag colors (for special occasions)
  flag: {
    red: '#ce1126',
    white: '#ffffff',
    black: '#000000',
  },
};

// Typography system
export const typography = {
  fonts: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    mono: 'JetBrainsMono_400Regular',
  },
  
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  lineHeights: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    '2xl': 36,
    '3xl': 42,
    '4xl': 48,
    '5xl': 60,
  },
  
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

// Spacing system (based on 4px grid)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

// Border radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.20,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 6,
  },
  xl: {
    shadowColor: colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 10,
  },
};

// Component-specific styles
export const components = {
  button: {
    height: {
      sm: 36,
      md: 44,
      lg: 52,
    },
    borderRadius: borderRadius.md,
    paddingHorizontal: {
      sm: spacing.md,
      md: spacing.lg,
      lg: spacing.xl,
    },
  },
  
  input: {
    height: 44,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
  },
  
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  
  modal: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.xl,
  },
};

// Animation durations
export const animations = {
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
};

// Breakpoints for responsive design
export const breakpoints = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

// Z-index layers
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

// Default theme object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  components,
  animations,
  breakpoints,
  zIndex,
};

export default theme;
