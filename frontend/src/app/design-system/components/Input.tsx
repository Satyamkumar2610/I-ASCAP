'use client';

/**
 * Input Component for I-ASCAP Rainfall Analytics Platform
 * 
 * A flexible, accessible input component with validation support, addons, and helper text.
 * Supports error states, required fields, and proper ARIA attributes for accessibility.
 */

import React, { forwardRef, useId } from 'react';
import { cn } from '../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  isRequired?: boolean;
  isInvalid?: boolean;
}

// ============================================================================
// Input Component
// ============================================================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftAddon,
      rightAddon,
      isRequired = false,
      isInvalid = false,
      disabled,
      className,
      id: providedId,
      ...props
    },
    ref
  ) => {
    // Generate unique IDs for accessibility
    const generatedId = useId();
    const inputId = providedId || generatedId;
    const errorId = `${inputId}-error`;
    const helperTextId = `${inputId}-helper`;

    // Determine if input is in error state
    const hasError = isInvalid || !!error;

    // Base input styles
    const baseInputStyles = cn(
      'w-full',
      'px-3 py-2',
      'text-base',
      'font-normal',
      'text-[var(--color-text-primary)]',
      'bg-[var(--color-background-primary)]',
      'border border-[var(--color-border-default)]',
      'rounded-[var(--radius-md)]',
      'transition-all duration-200',
      'placeholder:text-[var(--color-text-tertiary)]',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--color-background-secondary)]'
    );

    // State-specific styles
    const stateStyles = hasError
      ? cn(
          'border-[var(--color-error-500)]',
          'focus:border-[var(--color-error-500)]',
          'focus:ring-[var(--color-error-500)]'
        )
      : cn(
          'hover:border-[var(--color-border-hover)]',
          'focus:border-[var(--color-border-focus)]',
          'focus:ring-[var(--color-primary-500)]'
        );

    // Addon padding adjustments
    const addonPaddingStyles = [
      leftAddon && 'pl-10',
      rightAddon && 'pr-10'
    ].filter(Boolean).join(' ');

    // Combine input styles
    const inputClasses = cn(
      baseInputStyles,
      stateStyles,
      addonPaddingStyles,
      className
    );

    // Label styles
    const labelStyles = cn(
      'block',
      'text-sm',
      'font-medium',
      'text-[var(--color-text-primary)]',
      'mb-1.5',
      disabled && 'opacity-50 cursor-not-allowed'
    );

    // Helper text styles
    const helperTextStyles = cn(
      'mt-1.5',
      'text-sm',
      'text-[var(--color-text-secondary)]'
    );

    // Error text styles
    const errorTextStyles = cn(
      'mt-1.5',
      'text-sm',
      'text-[var(--color-error-600)]',
      'flex items-start gap-1'
    );

    // Addon wrapper styles
    const addonWrapperStyles = cn(
      'absolute top-1/2 -translate-y-1/2',
      'flex items-center justify-center',
      'text-[var(--color-text-tertiary)]',
      'pointer-events-none'
    );

    const leftAddonStyles = cn(addonWrapperStyles, 'left-3');
    const rightAddonStyles = cn(addonWrapperStyles, 'right-3');

    // Build ARIA attributes
    const ariaAttributes = {
      'aria-invalid': hasError,
      'aria-required': isRequired,
      'aria-describedby': cn(
        error && errorId,
        helperText && !error && helperTextId
      ) || undefined,
    };

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className={labelStyles}>
            {label}
            {isRequired && (
              <span className="text-[var(--color-error-500)] ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* Input wrapper for addons */}
        <div className="relative">
          {/* Left addon */}
          {leftAddon && (
            <div className={leftAddonStyles} aria-hidden="true">
              {leftAddon}
            </div>
          )}

          {/* Input element */}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={inputClasses}
            {...ariaAttributes}
            {...props}
          />

          {/* Right addon */}
          {rightAddon && (
            <div className={rightAddonStyles} aria-hidden="true">
              {rightAddon}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div id={errorId} className={errorTextStyles} role="alert" aria-live="polite">
            <svg
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Helper text (only shown when no error) */}
        {helperText && !error && (
          <div id={helperTextId} className={helperTextStyles}>
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
