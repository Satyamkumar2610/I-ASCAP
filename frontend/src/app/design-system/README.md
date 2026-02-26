# Design System

This directory contains the complete design system for the I-ASCAP Rainfall Analytics Platform.

## Directory Structure

```
design-system/
├── theme/              # Theme configuration and provider
│   ├── config.ts       # Theme tokens, colors, typography, spacing
│   ├── ThemeProvider.tsx  # Theme context and provider component
│   └── index.ts        # Theme exports
├── components/         # Atomic and composite components
│   └── index.ts        # Component exports
├── layouts/            # Layout components
│   └── index.ts        # Layout exports
├── utils/              # Utility functions
│   ├── cn.ts           # Class name utility
│   └── index.ts        # Utility exports
└── index.ts            # Main design system entry point
```

## Usage

### Importing Components

```typescript
// Import from the main entry point
import { ThemeProvider, useTheme } from '@/app/design-system';

// Or import specific modules
import { ThemeProvider } from '@/app/design-system/theme';
import { Button, Card } from '@/app/design-system/components';
import { PageLayout } from '@/app/design-system/layouts';
import { cn } from '@/app/design-system/utils';
```

### Theme Integration

The design system uses CSS custom properties for theming, which are defined in `globals.css` and managed by the `ThemeProvider` component.

#### Using Theme Variables in Components

```typescript
// In your component
import { cn } from '@/app/design-system/utils';

export function MyComponent() {
  return (
    <div className={cn(
      'bg-[var(--color-background-primary)]',
      'text-[var(--color-text-primary)]',
      'border-[var(--color-border-default)]'
    )}>
      Content
    </div>
  );
}
```

#### Accessing Theme in JavaScript

```typescript
import { useTheme } from '@/app/design-system/theme';

export function MyComponent() {
  const { theme, setTheme, toggleTheme, config } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

### Tailwind CSS Integration

The design system is integrated with Tailwind CSS 4 through CSS custom properties. All theme tokens are available as CSS variables and can be used with Tailwind's arbitrary value syntax:

```typescript
// Using design system colors
<div className="bg-[var(--color-primary-500)] text-[var(--color-text-primary)]">

// Using design system spacing
<div className="p-[var(--spacing-md)] gap-[var(--spacing-sm)]">

// Using design system shadows
<div className="shadow-[var(--shadow-md)]">

// Using design system border radius
<div className="rounded-[var(--radius-lg)]">
```

## Theme Configuration

The theme system supports light and dark modes with a comprehensive set of design tokens:

- **Colors**: Primary, secondary, success, warning, error, info, neutral (with 50-900 shades)
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale (xs to 4xl)
- **Shadows**: Shadow scale (sm to 2xl)
- **Border Radius**: Radius scale (none to full)
- **Breakpoints**: Responsive breakpoints (sm to 2xl)
- **Transitions**: Animation timing functions

## Component Development Guidelines

When creating new components:

1. **Use the `cn` utility** for combining class names
2. **Reference theme variables** using CSS custom properties
3. **Support theme switching** by using CSS variables instead of hardcoded colors
4. **Follow accessibility best practices** (ARIA labels, keyboard navigation, focus indicators)
5. **Export from the appropriate index file** for clean imports
6. **Document props and usage** with TypeScript interfaces and JSDoc comments

## Adding New Components

1. Create the component file in the appropriate directory:
   - Atomic components: `components/ComponentName.tsx`
   - Composite components: `components/ComponentName.tsx`
   - Layout components: `layouts/LayoutName.tsx`

2. Export the component from the directory's `index.ts`:
   ```typescript
   export { ComponentName } from './ComponentName';
   ```

3. The component will automatically be available through the main design system export

## CSS Custom Properties

All theme tokens are exposed as CSS custom properties and automatically updated when the theme changes. See `globals.css` for the complete list of available variables.

### Variable Naming Convention

- Colors: `--color-{category}-{shade}` (e.g., `--color-primary-500`)
- Backgrounds: `--color-background-{level}` (e.g., `--color-background-primary`)
- Text: `--color-text-{level}` (e.g., `--color-text-primary`)
- Borders: `--color-border-{state}` (e.g., `--color-border-default`)
- Spacing: `--spacing-{size}` (e.g., `--spacing-md`)
- Shadows: `--shadow-{size}` (e.g., `--shadow-md`)
- Radius: `--radius-{size}` (e.g., `--radius-lg`)

## Next Steps

As components are implemented, they will be exported from their respective index files and become available through the main design system entry point.

Refer to the design document (`.kiro/specs/ui-refactor/design.md`) for detailed component specifications and requirements.
