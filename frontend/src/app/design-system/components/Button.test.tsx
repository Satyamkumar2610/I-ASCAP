import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button Component', () => {
  describe('Variants', () => {
    it('renders primary variant with correct styles', () => {
      render(<Button variant="primary">Primary Button</Button>);
      const button = screen.getByRole('button', { name: /primary button/i });
      
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-[var(--color-primary-500)]');
      expect(button).toHaveClass('text-white');
    });

    it('renders secondary variant with correct styles', () => {
      render(<Button variant="secondary">Secondary Button</Button>);
      const button = screen.getByRole('button', { name: /secondary button/i });
      
      expect(button).toHaveClass('bg-[var(--color-secondary-500)]');
      expect(button).toHaveClass('text-white');
    });

    it('renders outline variant with correct styles', () => {
      render(<Button variant="outline">Outline Button</Button>);
      const button = screen.getByRole('button', { name: /outline button/i });
      
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('border-2');
      expect(button).toHaveClass('border-[var(--color-border-default)]');
    });

    it('renders ghost variant with correct styles', () => {
      render(<Button variant="ghost">Ghost Button</Button>);
      const button = screen.getByRole('button', { name: /ghost button/i });
      
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('text-[var(--color-text-primary)]');
    });

    it('renders danger variant with correct styles', () => {
      render(<Button variant="danger">Danger Button</Button>);
      const button = screen.getByRole('button', { name: /danger button/i });
      
      expect(button).toHaveClass('bg-[var(--color-error-500)]');
      expect(button).toHaveClass('text-white');
    });
  });

  describe('Sizes', () => {
    it('renders xs size with correct dimensions', () => {
      render(<Button size="xs">Extra Small</Button>);
      const button = screen.getByRole('button', { name: /extra small/i });
      
      expect(button).toHaveClass('px-2');
      expect(button).toHaveClass('py-1');
      expect(button).toHaveClass('text-xs');
    });

    it('renders sm size with correct dimensions', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button', { name: /small/i });
      
      expect(button).toHaveClass('px-3');
      expect(button).toHaveClass('py-1.5');
      expect(button).toHaveClass('text-sm');
    });

    it('renders md size with correct dimensions (default)', () => {
      render(<Button size="md">Medium</Button>);
      const button = screen.getByRole('button', { name: /medium/i });
      
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
      expect(button).toHaveClass('text-base');
    });

    it('renders lg size with correct dimensions', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button', { name: /large/i });
      
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('py-3');
      expect(button).toHaveClass('text-lg');
    });
  });

  describe('Loading State', () => {
    it('shows spinner when loading', () => {
      render(<Button isLoading>Loading Button</Button>);
      const button = screen.getByRole('button', { name: /loading button/i });
      
      // Check for spinner SVG
      const spinner = button.querySelector('svg.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('disables button when loading', () => {
      render(<Button isLoading>Loading Button</Button>);
      const button = screen.getByRole('button', { name: /loading button/i });
      
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('prevents click handler when loading', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <Button isLoading onClick={handleClick}>
          Loading Button
        </Button>
      );
      
      const button = screen.getByRole('button', { name: /loading button/i });
      await user.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('shows spinner on left when no rightIcon', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button', { name: /loading/i });
      const spinner = button.querySelector('svg.animate-spin');
      
      expect(spinner).toBeInTheDocument();
      expect(spinner?.parentElement).toHaveClass('inline-flex');
    });

    it('shows spinner on right when rightIcon is present', () => {
      const icon = <span data-testid="icon">→</span>;
      render(
        <Button isLoading rightIcon={icon}>
          Loading
        </Button>
      );
      
      const button = screen.getByRole('button', { name: /loading/i });
      const spinner = button.querySelector('svg.animate-spin');
      
      expect(spinner).toBeInTheDocument();
      // Icon should not be visible when loading
      expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
    });
  });

  describe('Icon Rendering', () => {
    it('renders left icon correctly', () => {
      const leftIcon = <span data-testid="left-icon">←</span>;
      render(<Button leftIcon={leftIcon}>Button with Left Icon</Button>);
      
      const icon = screen.getByTestId('left-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.parentElement).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders right icon correctly', () => {
      const rightIcon = <span data-testid="right-icon">→</span>;
      render(<Button rightIcon={rightIcon}>Button with Right Icon</Button>);
      
      const icon = screen.getByTestId('right-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.parentElement).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders both left and right icons', () => {
      const leftIcon = <span data-testid="left-icon">←</span>;
      const rightIcon = <span data-testid="right-icon">→</span>;
      
      render(
        <Button leftIcon={leftIcon} rightIcon={rightIcon}>
          Button with Both Icons
        </Button>
      );
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('hides left icon when loading', () => {
      const leftIcon = <span data-testid="left-icon">←</span>;
      render(
        <Button isLoading leftIcon={leftIcon}>
          Loading
        </Button>
      );
      
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
    });

    it('hides right icon when loading', () => {
      const rightIcon = <span data-testid="right-icon">→</span>;
      render(
        <Button isLoading rightIcon={rightIcon}>
          Loading
        </Button>
      );
      
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    });
  });

  describe('Full Width', () => {
    it('applies full width class when fullWidth is true', () => {
      render(<Button fullWidth>Full Width Button</Button>);
      const button = screen.getByRole('button', { name: /full width button/i });
      
      expect(button).toHaveClass('w-full');
    });

    it('does not apply full width class by default', () => {
      render(<Button>Normal Button</Button>);
      const button = screen.getByRole('button', { name: /normal button/i });
      
      expect(button).not.toHaveClass('w-full');
    });
  });

  describe('Disabled State', () => {
    it('disables button when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button', { name: /disabled button/i });
      
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('prevents click handler when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <Button disabled onClick={handleClick}>
          Disabled Button
        </Button>
      );
      
      const button = screen.getByRole('button', { name: /disabled button/i });
      await user.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('applies disabled opacity styles', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button', { name: /disabled button/i });
      
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });
  });

  describe('ARIA Attributes', () => {
    it('has accessible label from children', () => {
      render(<Button>Click Me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      
      expect(button).toBeInTheDocument();
    });

    it('has accessible label from aria-label', () => {
      render(<Button aria-label="Custom Label" />);
      const button = screen.getByRole('button', { name: /custom label/i });
      
      expect(button).toBeInTheDocument();
    });

    it('sets aria-busy when loading', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button', { name: /loading/i });
      
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('sets aria-disabled when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button', { name: /disabled/i });
      
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('sets aria-disabled when loading', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button', { name: /loading/i });
      
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('hides icons from screen readers', () => {
      const leftIcon = <span data-testid="left-icon">←</span>;
      render(<Button leftIcon={leftIcon}>Button</Button>);
      
      const iconWrapper = screen.getByTestId('left-icon').parentElement;
      expect(iconWrapper).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Keyboard Navigation', () => {
    it('can be focused with keyboard', async () => {
      const user = userEvent.setup();
      render(<Button>Focusable Button</Button>);
      
      const button = screen.getByRole('button', { name: /focusable button/i });
      
      await user.tab();
      expect(button).toHaveFocus();
    });

    it('triggers onClick with Enter key', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(<Button onClick={handleClick}>Press Enter</Button>);
      
      const button = screen.getByRole('button', { name: /press enter/i });
      button.focus();
      
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('triggers onClick with Space key', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(<Button onClick={handleClick}>Press Space</Button>);
      
      const button = screen.getByRole('button', { name: /press space/i });
      button.focus();
      
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has focus ring styles', () => {
      render(<Button>Focus Ring</Button>);
      const button = screen.getByRole('button', { name: /focus ring/i });
      
      expect(button).toHaveClass('focus:outline-none');
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-offset-2');
    });

    it('cannot be focused when disabled', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button', { name: /disabled button/i });
      
      button.focus();
      expect(button).not.toHaveFocus();
    });
  });

  describe('Click Handlers', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(<Button onClick={handleClick}>Click Me</Button>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      
      const button = screen.getByRole('button', { name: /disabled/i });
      await user.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <Button isLoading onClick={handleClick}>
          Loading
        </Button>
      );
      
      const button = screen.getByRole('button', { name: /loading/i });
      await user.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('passes event to onClick handler', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(<Button onClick={handleClick}>Click Me</Button>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('Button Type', () => {
    it('defaults to type="button"', () => {
      render(<Button>Default Type</Button>);
      const button = screen.getByRole('button', { name: /default type/i });
      
      expect(button).toHaveAttribute('type', 'button');
    });

    it('accepts custom type prop', () => {
      render(<Button type="submit">Submit Button</Button>);
      const button = screen.getByRole('button', { name: /submit button/i });
      
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('Custom ClassName', () => {
    it('merges custom className with default classes', () => {
      render(<Button className="custom-class">Custom Button</Button>);
      const button = screen.getByRole('button', { name: /custom button/i });
      
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('inline-flex'); // Base class
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to button element', () => {
      const ref = { current: null as HTMLButtonElement | null };
      
      render(<Button ref={ref}>Button with Ref</Button>);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toBe('Button with Ref');
    });
  });

  describe('Spinner Size', () => {
    it('renders spinner with xs size', () => {
      render(
        <Button size="xs" isLoading>
          XS Loading
        </Button>
      );
      const button = screen.getByRole('button', { name: /xs loading/i });
      const spinner = button.querySelector('svg.animate-spin');
      
      expect(spinner).toHaveClass('w-3');
      expect(spinner).toHaveClass('h-3');
    });

    it('renders spinner with sm size', () => {
      render(
        <Button size="sm" isLoading>
          SM Loading
        </Button>
      );
      const button = screen.getByRole('button', { name: /sm loading/i });
      const spinner = button.querySelector('svg.animate-spin');
      
      expect(spinner).toHaveClass('w-4');
      expect(spinner).toHaveClass('h-4');
    });

    it('renders spinner with md size', () => {
      render(
        <Button size="md" isLoading>
          MD Loading
        </Button>
      );
      const button = screen.getByRole('button', { name: /md loading/i });
      const spinner = button.querySelector('svg.animate-spin');
      
      expect(spinner).toHaveClass('w-5');
      expect(spinner).toHaveClass('h-5');
    });

    it('renders spinner with lg size', () => {
      render(
        <Button size="lg" isLoading>
          LG Loading
        </Button>
      );
      const button = screen.getByRole('button', { name: /lg loading/i });
      const spinner = button.querySelector('svg.animate-spin');
      
      expect(spinner).toHaveClass('w-6');
      expect(spinner).toHaveClass('h-6');
    });
  });
});
