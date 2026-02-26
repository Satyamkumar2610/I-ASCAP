'use client';

/**
 * Badge Component for I-ASCAP Rainfall Analytics Platform
 * 
 * A flexible badge component for status indicators and labels with multiple variants,
 * sizes, and an optional dot indicator. Ensures WCAG AA color contrast and semantic
 * meaning beyond color alone through text labels and ARIA attributes.
 */

import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

// ============================================================================
// Badge Component
// ============================================================================

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      dot = false,
      className,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = cn(
      'inline-flex items-center justify-center',
      'font-medium',
      'rounded-[var(--radius-full)]',
      'transition-colors duration-200',
      'whitespace-nowrap'
    );

    // Variant styles with WCAG AA compliant colors
    const variantStyles = {
      default: cn(
        'bg-[var(--color-neutral-100)] text-[var(--color-neutral-800)]',
        'border border-[var(--color-neutral-300)]'
      ),
      success: cn(
        'bg-[var(--color-success-100)] text-[var(--color-success-800)]',
        'border border-[var(--color-success-300)]'
      ),
      warning: cn(
        'bg-[var(--color-warning-100)] text-[var(--color-warning-900)]',
        'border border-[var(--color-warning-300)]'
      ),
      error: cn(
        'bg-[var(--color-error-100)] text-[var(--color-error-800)]',
        'border border-[var(--color-error-300)]'
      ),
      info: cn(
        'bg-[var(--color-info-100)] text-[var(--color-info-800)]',
        'border border-[var(--color-info-300)]'
      ),
    };

    // Size styles
    const sizeStyles = {
      sm: cn(
        'px-2 py-0.5 text-xs',
        dot && 'gap-1'
      ),
      md: cn(
        'px-2.5 py-1 text-sm',
        dot && 'gap-1.5'
      ),
      lg: cn(
        'px-3 py-1.5 text-base',
        dot && 'gap-2'
      ),
    };

    // Dot indicator styles based on variant
    const dotStyles = {
      default: 'bg-[var(--color-neutral-500)]',
      success: 'bg-[var(--color-success-500)]',
      warning: 'bg-[var(--color-warning-500)]',
      error: 'bg-[var(--color-error-500)]',
      info: 'bg-[var(--color-info-500)]',
    };

    // Dot size based on badge size
    const dotSizeStyles = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5',
    };

    // Combine all styles
    const badgeClasses = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      className
    );

    // Get semantic label for status variants (for screen readers)
    const getAriaLabel = () => {
      if (variant === 'default') return undefined;
      
      const statusLabels = {
        success: 'Success status',
        warning: 'Warning status',
        error: 'Error status',
        info: 'Information status',
      };
      
      return statusLabels[variant];
    };

    return (
      <span
        ref={ref}
        className={badgeClasses}
        role="status"
        aria-label={getAriaLabel()}
        {...props}
      >
        {/* Dot indicator */}
        {dot && (
          <span
            className={cn(
              'rounded-full',
              dotStyles[variant],
              dotSizeStyles[size]
            )}
            aria-hidden="true"
          />
        )}
        
        {/* Badge content */}
        <span>{children}</span>
      </span>
    );
  }
);

Badge.displayName = 'Badge';
