'use client';

/**
 * Button Component for I-ASCAP Rainfall Analytics Platform
 * 
 * A flexible, accessible button component with multiple variants, sizes, and states.
 * Supports loading states, icons, keyboard navigation, and ARIA attributes.
 */

import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// ============================================================================
// Spinner Component
// ============================================================================

const Spinner: React.FC<{ size: 'xs' | 'sm' | 'md' | 'lg' }> = ({ size }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <svg
      className={cn('animate-spin', sizeClasses[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// ============================================================================
// Button Component
// ============================================================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Validate accessible label
    const hasAccessibleLabel = children || props['aria-label'];
    if (!hasAccessibleLabel && process.env.NODE_ENV === 'development') {
      console.warn('Button: Must have accessible label (text or aria-label)');
    }

    // Disable interaction when loading
    const isDisabled = disabled || isLoading;

    // Base styles
    const baseStyles = cn(
      'inline-flex items-center justify-center',
      'font-medium',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'select-none'
    );

    // Variant styles
    const variantStyles = {
      primary: cn(
        'bg-[var(--color-primary-500)] text-white',
        'hover:bg-[var(--color-primary-600)]',
        'active:bg-[var(--color-primary-700)]',
        'focus:ring-[var(--color-primary-500)]',
        'disabled:hover:bg-[var(--color-primary-500)]'
      ),
      secondary: cn(
        'bg-[var(--color-secondary-500)] text-white',
        'hover:bg-[var(--color-secondary-600)]',
        'active:bg-[var(--color-secondary-700)]',
        'focus:ring-[var(--color-secondary-500)]',
        'disabled:hover:bg-[var(--color-secondary-500)]'
      ),
      outline: cn(
        'bg-transparent border-2 border-[var(--color-border-default)]',
        'text-[var(--color-text-primary)]',
        'hover:bg-[var(--color-background-secondary)] hover:border-[var(--color-border-hover)]',
        'active:bg-[var(--color-background-tertiary)]',
        'focus:ring-[var(--color-primary-500)]',
        'disabled:hover:bg-transparent disabled:hover:border-[var(--color-border-default)]'
      ),
      ghost: cn(
        'bg-transparent text-[var(--color-text-primary)]',
        'hover:bg-[var(--color-background-secondary)]',
        'active:bg-[var(--color-background-tertiary)]',
        'focus:ring-[var(--color-primary-500)]',
        'disabled:hover:bg-transparent'
      ),
      danger: cn(
        'bg-[var(--color-error-500)] text-white',
        'hover:bg-[var(--color-error-600)]',
        'active:bg-[var(--color-error-700)]',
        'focus:ring-[var(--color-error-500)]',
        'disabled:hover:bg-[var(--color-error-500)]'
      ),
    };

    // Size styles
    const sizeStyles = {
      xs: 'px-2 py-1 text-xs rounded-[var(--radius-sm)] gap-1',
      sm: 'px-3 py-1.5 text-sm rounded-[var(--radius-md)] gap-1.5',
      md: 'px-4 py-2 text-base rounded-[var(--radius-md)] gap-2',
      lg: 'px-6 py-3 text-lg rounded-[var(--radius-lg)] gap-2.5',
    };

    // Width styles
    const widthStyles = fullWidth ? 'w-full' : '';

    // Combine all styles
    const buttonClasses = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      widthStyles,
      className
    );

    // Icon wrapper styles
    const iconWrapperClasses = 'inline-flex items-center justify-center';

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={buttonClasses}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        {...props}
      >
        {/* Left icon or loading spinner */}
        {isLoading && !rightIcon && (
          <span className={iconWrapperClasses}>
            <Spinner size={size} />
          </span>
        )}
        {!isLoading && leftIcon && (
          <span className={iconWrapperClasses} aria-hidden="true">
            {leftIcon}
          </span>
        )}

        {/* Button text */}
        {children && <span>{children}</span>}

        {/* Right icon or loading spinner */}
        {isLoading && rightIcon && (
          <span className={iconWrapperClasses}>
            <Spinner size={size} />
          </span>
        )}
        {!isLoading && rightIcon && (
          <span className={iconWrapperClasses} aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

