/**
 * Theme Configuration for I-ASCAP Rainfall Analytics Platform
 * 
 * This file defines the complete design system theme including:
 * - Color palettes (light and dark modes)
 * - Typography scales
 * - Spacing system
 * - Breakpoints
 * - Shadows and border radii
 * - Transitions
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface ColorShades {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface ColorPalette {
  primary: ColorShades;
  secondary: ColorShades;
  success: ColorShades;
  warning: ColorShades;
  error: ColorShades;
  info: ColorShades;
  neutral: ColorShades;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
  };
  border: {
    default: string;
    hover: string;
    focus: string;
  };
}

export interface TypographyScale {
  fontFamily: {
    sans: string;
    mono: string;
    display: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface SpacingScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface Breakpoints {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface ShadowScale {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface RadiusScale {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface TransitionConfig {
  fast: string;
  base: string;
  slow: string;
  slower: string;
}

export interface ThemeConfig {
  colors: ColorPalette;
  typography: TypographyScale;
  spacing: SpacingScale;
  breakpoints: Breakpoints;
  shadows: ShadowScale;
  radii: RadiusScale;
  transitions: TransitionConfig;
}

export interface ThemeTokens {
  colors: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    secondary: string;
    background: string;
    surface: string;
    border: string;
    text: string;
    textSecondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// ============================================================================
// Color Palettes
// ============================================================================

const primaryColors: ColorShades = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
};

const secondaryColors: ColorShades = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
};

const successColors: ColorShades = {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',
  600: '#16a34a',
  700: '#15803d',
  800: '#166534',
  900: '#14532d',
};

const warningColors: ColorShades = {
  50: '#fffbeb',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d',
  400: '#fbbf24',
  500: '#f59e0b',
  600: '#d97706',
  700: '#b45309',
  800: '#92400e',
  900: '#78350f',
};

const errorColors: ColorShades = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444',
  600: '#dc2626',
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
};

const infoColors: ColorShades = {
  50: '#f0f9ff',
  100: '#e0f2fe',
  200: '#bae6fd',
  300: '#7dd3fc',
  400: '#38bdf8',
  500: '#0ea5e9',
  600: '#0284c7',
  700: '#0369a1',
  800: '#075985',
  900: '#0c4a6e',
};

const neutralColors: ColorShades = {
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#e5e5e5',
  300: '#d4d4d4',
  400: '#a3a3a3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
};

// ============================================================================
// Light Theme Configuration
// ============================================================================

export const lightTheme: ThemeConfig = {
  colors: {
    primary: primaryColors,
    secondary: secondaryColors,
    success: successColors,
    warning: warningColors,
    error: errorColors,
    info: infoColors,
    neutral: neutralColors,
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b',
      disabled: '#cbd5e1',
    },
    border: {
      default: '#e2e8f0',
      hover: '#cbd5e1',
      focus: '#3b82f6',
    },
  },
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"Fira Code", "Courier New", monospace',
      display: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  radii: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    full: '9999px',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// ============================================================================
// Dark Theme Configuration
// ============================================================================

export const darkTheme: ThemeConfig = {
  colors: {
    primary: primaryColors,
    secondary: secondaryColors,
    success: successColors,
    warning: warningColors,
    error: errorColors,
    info: infoColors,
    neutral: neutralColors,
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
      disabled: '#475569',
    },
    border: {
      default: '#334155',
      hover: '#475569',
      focus: '#3b82f6',
    },
  },
  typography: lightTheme.typography,
  spacing: lightTheme.spacing,
  breakpoints: lightTheme.breakpoints,
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  radii: lightTheme.radii,
  transitions: lightTheme.transitions,
};

// ============================================================================
// Theme Utility Functions
// ============================================================================

/**
 * Get theme configuration based on theme mode
 */
export function getThemeConfig(mode: 'light' | 'dark'): ThemeConfig {
  return mode === 'light' ? lightTheme : darkTheme;
}

/**
 * Extract theme tokens for runtime access
 */
export function getThemeTokens(config: ThemeConfig): ThemeTokens {
  return {
    colors: {
      primary: config.colors.primary[500],
      primaryHover: config.colors.primary[600],
      primaryActive: config.colors.primary[700],
      secondary: config.colors.secondary[500],
      background: config.colors.background.primary,
      surface: config.colors.background.secondary,
      border: config.colors.border.default,
      text: config.colors.text.primary,
      textSecondary: config.colors.text.secondary,
      success: config.colors.success[500],
      warning: config.colors.warning[500],
      error: config.colors.error[500],
      info: config.colors.info[500],
    },
    spacing: {
      xs: config.spacing.xs,
      sm: config.spacing.sm,
      md: config.spacing.md,
      lg: config.spacing.lg,
      xl: config.spacing.xl,
    },
    borderRadius: {
      sm: config.radii.sm,
      md: config.radii.md,
      lg: config.radii.lg,
      full: config.radii.full,
    },
    shadows: {
      sm: config.shadows.sm,
      md: config.shadows.md,
      lg: config.shadows.lg,
      xl: config.shadows.xl,
    },
  };
}

/**
 * Generate CSS custom properties from theme config
 */
export function generateCSSVariables(config: ThemeConfig): Record<string, string> {
  const vars: Record<string, string> = {};

  // Color variables
  Object.entries(config.colors.primary).forEach(([shade, value]) => {
    vars[`--color-primary-${shade}`] = value;
  });
  Object.entries(config.colors.secondary).forEach(([shade, value]) => {
    vars[`--color-secondary-${shade}`] = value;
  });
  Object.entries(config.colors.success).forEach(([shade, value]) => {
    vars[`--color-success-${shade}`] = value;
  });
  Object.entries(config.colors.warning).forEach(([shade, value]) => {
    vars[`--color-warning-${shade}`] = value;
  });
  Object.entries(config.colors.error).forEach(([shade, value]) => {
    vars[`--color-error-${shade}`] = value;
  });
  Object.entries(config.colors.info).forEach(([shade, value]) => {
    vars[`--color-info-${shade}`] = value;
  });
  Object.entries(config.colors.neutral).forEach(([shade, value]) => {
    vars[`--color-neutral-${shade}`] = value;
  });

  // Background variables
  vars['--color-background-primary'] = config.colors.background.primary;
  vars['--color-background-secondary'] = config.colors.background.secondary;
  vars['--color-background-tertiary'] = config.colors.background.tertiary;

  // Text variables
  vars['--color-text-primary'] = config.colors.text.primary;
  vars['--color-text-secondary'] = config.colors.text.secondary;
  vars['--color-text-tertiary'] = config.colors.text.tertiary;
  vars['--color-text-disabled'] = config.colors.text.disabled;

  // Border variables
  vars['--color-border-default'] = config.colors.border.default;
  vars['--color-border-hover'] = config.colors.border.hover;
  vars['--color-border-focus'] = config.colors.border.focus;

  // Spacing variables
  Object.entries(config.spacing).forEach(([key, value]) => {
    vars[`--spacing-${key}`] = value;
  });

  // Shadow variables
  Object.entries(config.shadows).forEach(([key, value]) => {
    vars[`--shadow-${key}`] = value;
  });

  // Radius variables
  Object.entries(config.radii).forEach(([key, value]) => {
    vars[`--radius-${key}`] = value;
  });

  // Typography variables
  vars['--font-sans'] = config.typography.fontFamily.sans;
  vars['--font-mono'] = config.typography.fontFamily.mono;
  vars['--font-display'] = config.typography.fontFamily.display;

  return vars;
}

/**
 * Apply CSS variables to document root
 */
export function applyCSSVariables(config: ThemeConfig): void {
  const vars = generateCSSVariables(config);
  const root = document.documentElement;

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

// ============================================================================
// Exports
// ============================================================================

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export type ThemeMode = keyof typeof themes;
