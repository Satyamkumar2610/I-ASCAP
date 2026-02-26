# Theme System

The theme system provides centralized theme management with light/dark mode support, localStorage persistence, and system preference detection.

## Features

- **Light/Dark Mode**: Toggle between light and dark themes
- **Persistence**: Theme preference saved to localStorage
- **System Preference**: Automatically detects system theme preference
- **Dynamic Theming**: CSS custom properties applied dynamically
- **SSR-Safe**: Works with Next.js server-side rendering
- **No Flash**: Prevents flash of unstyled content (FOUC)

## Usage

### 1. Wrap your app with ThemeProvider

In your root layout (`app/layout.tsx`):

```tsx
import { ThemeProvider, themeInitScript } from '@/app/design-system/theme';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of unstyled content */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider defaultTheme="light" storageKey="i-ascap-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 2. Use the theme in components

```tsx
'use client';

import { useTheme } from '@/app/design-system/theme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
```

### 3. Access theme configuration

```tsx
'use client';

import { useTheme } from '@/app/design-system/theme';

export function ThemedComponent() {
  const { config } = useTheme();
  
  return (
    <div style={{ 
      backgroundColor: config.colors.background.primary,
      color: config.colors.text.primary,
      padding: config.spacing.md,
      borderRadius: config.radii.md,
    }}>
      Themed content
    </div>
  );
}
```

### 4. Use CSS custom properties

The theme system automatically applies CSS custom properties to the document root. You can use them in your CSS:

```css
.my-component {
  background-color: var(--color-background-primary);
  color: var(--color-text-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}
```

### 5. Target themes with CSS

```css
/* Light theme styles */
[data-theme="light"] .my-component {
  /* ... */
}

/* Dark theme styles */
[data-theme="dark"] .my-component {
  /* ... */
}
```

## API Reference

### ThemeProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Child components |
| `defaultTheme` | `'light' \| 'dark'` | `'light'` | Default theme when no stored preference |
| `storageKey` | `string` | `'i-ascap-theme'` | localStorage key for persistence |

### useTheme Hook

Returns a `ThemeContextValue` object:

| Property | Type | Description |
|----------|------|-------------|
| `theme` | `'light' \| 'dark'` | Current theme mode |
| `setTheme` | `(theme: 'light' \| 'dark') => void` | Set theme explicitly |
| `toggleTheme` | `() => void` | Toggle between light and dark |
| `config` | `ThemeConfig` | Complete theme configuration |

### CSS Custom Properties

The following CSS custom properties are available:

**Colors:**
- `--color-primary-{50-900}`: Primary color shades
- `--color-secondary-{50-900}`: Secondary color shades
- `--color-success-{50-900}`: Success color shades
- `--color-warning-{50-900}`: Warning color shades
- `--color-error-{50-900}`: Error color shades
- `--color-info-{50-900}`: Info color shades
- `--color-neutral-{50-900}`: Neutral color shades
- `--color-background-{primary,secondary,tertiary}`: Background colors
- `--color-text-{primary,secondary,tertiary,disabled}`: Text colors
- `--color-border-{default,hover,focus}`: Border colors

**Spacing:**
- `--spacing-{xs,sm,md,lg,xl,2xl,3xl,4xl}`: Spacing scale

**Shadows:**
- `--shadow-{sm,md,lg,xl,2xl}`: Shadow scale

**Border Radius:**
- `--radius-{none,sm,md,lg,xl,full}`: Border radius scale

**Typography:**
- `--font-sans`: Sans-serif font family
- `--font-mono`: Monospace font family
- `--font-display`: Display font family

## SSR Considerations

The ThemeProvider is designed to work seamlessly with Next.js:

1. **Hydration Safety**: Uses `suppressHydrationWarning` on the `<html>` tag
2. **Init Script**: Prevents FOUC by setting theme before React hydrates
3. **Client-Only State**: Theme state only initializes on the client
4. **System Preference**: Detects system preference without causing hydration mismatches

## Examples

### Theme Toggle Button

```tsx
'use client';

import { useTheme } from '@/app/design-system/theme';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
```

### Theme Selector

```tsx
'use client';

import { useTheme } from '@/app/design-system/theme';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  
  return (
    <select 
      value={theme} 
      onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
      className="px-3 py-2 rounded-md border"
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  );
}
```

### Themed Card Component

```tsx
'use client';

import { useTheme } from '@/app/design-system/theme';

export function ThemedCard({ children }: { children: React.ReactNode }) {
  const { config } = useTheme();
  
  return (
    <div
      style={{
        backgroundColor: config.colors.background.secondary,
        color: config.colors.text.primary,
        padding: config.spacing.lg,
        borderRadius: config.radii.lg,
        boxShadow: config.shadows.md,
        border: `1px solid ${config.colors.border.default}`,
      }}
    >
      {children}
    </div>
  );
}
```
