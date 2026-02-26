/**
 * Class Name Utility
 * 
 * Utility function for conditionally joining class names together.
 * Useful for combining Tailwind CSS classes with conditional logic.
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[];

/**
 * Combines multiple class names into a single string, filtering out falsy values.
 * 
 * @param classes - Class names to combine
 * @returns Combined class name string
 * 
 * @example
 * cn('base-class', isActive && 'active-class', 'another-class')
 * // Returns: 'base-class active-class another-class' (if isActive is true)
 * 
 * @example
 * cn('btn', variant === 'primary' && 'btn-primary', disabled && 'btn-disabled')
 * // Returns: 'btn btn-primary' (if variant is 'primary' and disabled is false)
 */
export function cn(...classes: ClassValue[]): string {
  return classes
    .flat()
    .filter((cls): cls is string | number => {
      return cls !== null && cls !== undefined && cls !== false && cls !== '';
    })
    .join(' ')
    .trim();
}
