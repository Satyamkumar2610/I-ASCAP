/**
 * Theme Module Exports
 * 
 * Centralized exports for theme configuration and provider
 */

// Configuration
export {
  type ColorShades,
  type ColorPalette,
  type TypographyScale,
  type SpacingScale,
  type Breakpoints,
  type ShadowScale,
  type RadiusScale,
  type TransitionConfig,
  type ThemeConfig,
  type ThemeTokens,
  type ThemeMode,
  lightTheme,
  darkTheme,
  themes,
  getThemeConfig,
  getThemeTokens,
  generateCSSVariables,
  applyCSSVariables,
} from './config';

// Provider
export {
  type ThemeProviderProps,
  type ThemeContextValue,
  ThemeProvider,
  useTheme,
  themeInitScript,
} from './ThemeProvider';
