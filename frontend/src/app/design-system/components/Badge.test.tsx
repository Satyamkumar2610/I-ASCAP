import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge Component', () => {
  describe('Variants', () => {
    it('renders default variant with correct styles', () => {
      render(<Badge variant="default">Default Badge</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-[var(--color-neutral-100)]');
      expect(badge).toHaveClass('text-[var(--color-neutral-800)]');
      expect(badge).toHaveClass('border-[var(--color-neutral-300)]');
    });

    it('renders success variant with correct styles', () => {
      render(<Badge variant="success">Success Badge</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveClass('bg-[var(--color-success-100)]');
      expect(badge).toHaveClass('text-[var(--color-success-800)]');
      expect(badge).toHaveClass('border-[var(--color-success-300)]');
    });

    it('renders warning variant with correct styles', () => {
      render(<Badge variant="warning">Warning Badge</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveClass('bg-[var(--color-warning-100)]');
      expect(badge).toHaveClass('text-[var(--color-warning-900)]');
      expect(badge).toHaveClass('border-[var(--color-warning-300)]');
    });

    it('renders error variant with correct styles', () => {
      render(<Badge variant="error">Error Badge</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveClass('bg-[var(--color-error-100)]');
      expect(badge).toHaveClass('text-[var(--color-error-800)]');
      expect(badge).toHaveClass('border-[var(--color-error-300)]');
    });

    it('renders info variant with correct styles', () => {
      render(<Badge variant="info">Info Badge</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveClass('bg-[var(--color-info-100)]');
      expect(badge).toHaveClass('text-[var(--color-info-800)]');
      expect(badge).toHaveClass('border-[var(--color-info-300)]');
    });
  });

  describe('Sizes', () => {
    it('renders sm size with correct dimensions', () => {
      render(<Badge size="sm">Small Badge</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveClass('px-2');
      expect(badge).toHaveClass('py-0.5');
      expect(badge).toHaveClass('text-xs');
    });

    it('renders md size with correct dimensions (default)', () => {
      render(<Badge size="md">Medium Badge</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveClass('px-2.5');
      expect(badge).toHaveClass('py-1');
      expect(badge).toHaveClass('text-sm');
    });

    it('renders lg size with correct dimensions', () => {
      render(<Badge size="lg">Large Badge</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveClass('px-3');
      expect(badge).toHaveClass('py-1.5');
      expect(badge).toHaveClass('text-base');
    });

    it('uses md size by default', () => {
      render(<Badge>Default Size</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveClass('px-2.5');
      expect(badge).toHaveClass('py-1');
      expect(badge).toHaveClass('text-sm');
    });
  });

  describe('Dot Indicator', () => {
    it('renders dot when dot prop is true', () => {
      render(<Badge dot>Badge with Dot</Badge>);
      const badge = screen.getByRole('status');
      const dot = badge.querySelector('span[aria-hidden="true"]');
      
      expect(dot).toBeInTheDocument();
      expect(dot).toHaveClass('rounded-full');
    });

    it('does not render dot by default', () => {
      render(<Badge>Badge without Dot</Badge>);
      const badge = screen.getByRole('status');
      const dot = badge.querySelector('span[aria-hidden="true"]');
      
      expect(dot).not.toBeInTheDocument();
    });

    it('renders dot with correct color for success variant', () => {
      render(
        <Badge variant="success" dot>
          Success
        </Badge>
      );
      const badge = screen.getByRole('status');
      const dot = badge.querySelector('span[aria-hidden="true"]');
      
      expect(dot).toHaveClass('bg-[var(--color-success-500)]');
    });

    it('renders dot with correct color for warning variant', () => {
      render(
        <Badge variant="warning" dot>
          Warning
        </Badge>
      );
      const badge = screen.getByRole('status');
      const dot = badge.querySelector('span[aria-hidden="true"]');
      
      expect(dot).toHaveClass('bg-[var(--color-warning-500)]');
    });

    it('renders dot with correct color for error variant', () => {
      render(
        <Badge variant="error" dot>
          Error
        </Badge>
      );
      const badge = screen.getByRole('status');
      const dot = badge.querySelector('span[aria-hidden="true"]');
      
      expect(dot).toHaveClass('bg-[var(--color-error-500)]');
    });

    it('renders dot with correct color for info variant', () => {
      render(
        <Badge variant="info" dot>
          Info
        </Badge>
      );
      const badge = screen.getByRole('status');
      const dot = badge.querySelector('span[aria-hidden="true"]');
      
      expect(dot).toHaveClass('bg-[var(--color-info-500)]');
    });

    it('renders dot with correct color for default variant', () => {
      render(
        <Badge variant="default" dot>
          Default
        </Badge>
      );
      const badge = screen.getByRole('status');
      const dot = badge.querySelector('span[aria-hidden="true"]');
      
      expect(dot).toHaveClass('bg-[var(--color-neutral-500)]');
    });

    it('renders small dot for sm size', () => {
      render(
        <Badge size="sm" dot>
          Small
        </Badge>
      );
      const badge = screen.getByRole('status');
      const dot = badge.querySelector('span[aria-hidden="true"]');
      
      expect(dot).toHaveClass('w-1.5');
      expect(dot).toHaveClass('h-1.5');
    });

    it('renders medium dot for md size', () => {
      render(
        <Badge size="md" dot>
          Medium
        </Badge>
      );
      const badge = screen.getByRole('status');
      const dot = badge.querySelector('span[aria-hidden="true"]');
      
      expect(dot).toHaveClass('w-2');
      expect(dot).toHaveClass('h-2');
    });

    it('renders large dot for lg size', () => {
      render(
        <Badge size="lg" dot>
          Large
        </Badge>
      );
      const badge = screen.getByRole('status');
      const dot = badge.querySelector('span[aria-hidden="true"]');
      
      expect(dot).toHaveClass('w-2.5');
      expect(dot).toHaveClass('h-2.5');
    });

    it('adds gap spacing when dot is present', () => {
      render(
        <Badge size="sm" dot>
          With Gap
        </Badge>
      );
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveClass('gap-1');
    });
  });

  describe('ARIA Attributes and Accessibility', () => {
    it('has role="status" for semantic meaning', () => {
      render(<Badge>Status Badge</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveAttribute('role', 'status');
    });

    it('has aria-label for success variant', () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveAttribute('aria-label', 'Success status');
    });

    it('has aria-label for warning variant', () => {
      render(<Badge variant="warning">Warning</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveAttribute('aria-label', 'Warning status');
    });

    it('has aria-label for error variant', () => {
      render(<Badge variant="error">Error</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveAttribute('aria-label', 'Error status');
    });

    it('has aria-label for info variant', () => {
      render(<Badge variant="info">Info</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveAttribute('aria-label', 'Information status');
    });

    it('does not have aria-label for default variant', () => {
      render(<Badge variant="default">Default</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).not.toHaveAttribute('aria-label');
    });

    it('hides dot from screen readers', () => {
      render(
        <Badge dot>Badge with Dot</Badge>
      );
      const badge = screen.getByRole('status');
      const dot = badge.querySelector('span[aria-hidden="true"]');
      
      expect(dot).toHaveAttribute('aria-hidden', 'true');
    });

    it('provides semantic meaning through text content', () => {
      render(<Badge variant="success">Active</Badge>);
      const badge = screen.getByRole('status');
      
      // Text content provides meaning beyond color
      expect(badge.textContent).toBe('Active');
    });
  });

  describe('WCAG AA Color Contrast', () => {
    it('uses high contrast colors for success variant', () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByRole('status');
      
      // Light background (100) with dark text (800) ensures WCAG AA compliance
      expect(badge).toHaveClass('bg-[var(--color-success-100)]');
      expect(badge).toHaveClass('text-[var(--color-success-800)]');
    });

    it('uses high contrast colors for warning variant', () => {
      render(<Badge variant="warning">Warning</Badge>);
      const badge = screen.getByRole('status');
      
      // Light background (100) with very dark text (900) ensures WCAG AA compliance
      expect(badge).toHaveClass('bg-[var(--color-warning-100)]');
      expect(badge).toHaveClass('text-[var(--color-warning-900)]');
    });

    it('uses high contrast colors for error variant', () => {
      render(<Badge variant="error">Error</Badge>);
      const badge = screen.getByRole('status');
      
      // Light background (100) with dark text (800) ensures WCAG AA compliance
      expect(badge).toHaveClass('bg-[var(--color-error-100)]');
      expect(badge).toHaveClass('text-[var(--color-error-800)]');
    });

    it('uses high contrast colors for info variant', () => {
      render(<Badge variant="info">Info</Badge>);
      const badge = screen.getByRole('status');
      
      // Light background (100) with dark text (800) ensures WCAG AA compliance
      expect(badge).toHaveClass('bg-[var(--color-info-100)]');
      expect(badge).toHaveClass('text-[var(--color-info-800)]');
    });

    it('uses high contrast colors for default variant', () => {
      render(<Badge variant="default">Default</Badge>);
      const badge = screen.getByRole('status');
      
      // Light background (100) with dark text (800) ensures WCAG AA compliance
      expect(badge).toHaveClass('bg-[var(--color-neutral-100)]');
      expect(badge).toHaveClass('text-[var(--color-neutral-800)]');
    });
  });

  describe('Base Styles', () => {
    it('has inline-flex display', () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveClass('inline-flex');
    });

    it('has centered content', () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveClass('items-center');
      expect(badge).toHaveClass('justify-center');
    });

    it('has rounded full border radius', () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveClass('rounded-[var(--radius-full)]');
    });

    it('has transition for color changes', () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveClass('transition-colors');
      expect(badge).toHaveClass('duration-200');
    });

    it('prevents text wrapping', () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveClass('whitespace-nowrap');
    });

    it('has medium font weight', () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveClass('font-medium');
    });
  });

  describe('Custom ClassName', () => {
    it('merges custom className with default classes', () => {
      render(<Badge className="custom-class">Custom Badge</Badge>);
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveClass('custom-class');
      expect(badge).toHaveClass('inline-flex'); // Base class
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to span element', () => {
      const ref = { current: null as HTMLSpanElement | null };
      
      render(<Badge ref={ref}>Badge with Ref</Badge>);
      
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
      expect(ref.current?.textContent).toBe('Badge with Ref');
    });
  });

  describe('Children Rendering', () => {
    it('renders text children correctly', () => {
      render(<Badge>Text Content</Badge>);
      
      expect(screen.getByText(/text content/i)).toBeInTheDocument();
    });

    it('renders numeric children correctly', () => {
      render(<Badge>{42}</Badge>);
      
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders complex children correctly', () => {
      render(
        <Badge>
          <span data-testid="icon">✓</span>
          <span>Verified</span>
        </Badge>
      );
      
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText(/verified/i)).toBeInTheDocument();
    });
  });

  describe('Variant and Size Combinations', () => {
    it('renders success variant with small size', () => {
      render(
        <Badge variant="success" size="sm">
          Success Small
        </Badge>
      );
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveClass('bg-[var(--color-success-100)]');
      expect(badge).toHaveClass('text-xs');
    });

    it('renders error variant with large size', () => {
      render(
        <Badge variant="error" size="lg">
          Error Large
        </Badge>
      );
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveClass('bg-[var(--color-error-100)]');
      expect(badge).toHaveClass('text-base');
    });

    it('renders warning variant with dot and medium size', () => {
      render(
        <Badge variant="warning" size="md" dot>
          Warning Dot
        </Badge>
      );
      const badge = screen.getByRole('status');
      const dot = badge.querySelector('span[aria-hidden="true"]');
      
      expect(badge).toHaveClass('bg-[var(--color-warning-100)]');
      expect(badge).toHaveClass('text-sm');
      expect(dot).toBeInTheDocument();
      expect(dot).toHaveClass('bg-[var(--color-warning-500)]');
    });
  });

  describe('HTML Attributes', () => {
    it('accepts and applies custom HTML attributes', () => {
      render(
        <Badge data-testid="custom-badge" id="badge-1">
          Custom Attrs
        </Badge>
      );
      const badge = screen.getByTestId('custom-badge');
      
      expect(badge).toHaveAttribute('id', 'badge-1');
    });

    it('accepts custom event handlers', () => {
      const handleClick = vi.fn();
      render(<Badge onClick={handleClick}>Clickable Badge</Badge>);
      
      const badge = screen.getByRole('status');
      badge.click();
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
