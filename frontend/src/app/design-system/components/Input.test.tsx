import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input Component', () => {
  describe('Label Association', () => {
    it('associates label with input using htmlFor and id', () => {
      render(<Input label="Email Address" />);
      
      const input = screen.getByLabelText(/email address/i);
      const label = screen.getByText(/email address/i);
      
      expect(input).toBeInTheDocument();
      expect(label).toHaveAttribute('for', input.id);
    });

    it('uses provided id when specified', () => {
      render(<Input label="Username" id="custom-id" />);
      
      const input = screen.getByLabelText(/username/i);
      expect(input).toHaveAttribute('id', 'custom-id');
    });

    it('generates unique id when not provided', () => {
      const { container } = render(
        <>
          <Input label="First Input" />
          <Input label="Second Input" />
        </>
      );
      
      const inputs = container.querySelectorAll('input');
      expect(inputs[0].id).not.toBe(inputs[1].id);
      expect(inputs[0].id).toBeTruthy();
      expect(inputs[1].id).toBeTruthy();
    });

    it('renders without label', () => {
      render(<Input placeholder="No label input" />);
      
      const input = screen.getByPlaceholderText(/no label input/i);
      expect(input).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('renders error message when error prop is provided', () => {
      render(<Input label="Email" error="Invalid email address" />);
      
      const errorMessage = screen.getByText(/invalid email address/i);
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage.parentElement).toHaveAttribute('role', 'alert');
    });

    it('applies error styles when error is present', () => {
      render(<Input label="Email" error="Invalid email" />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveClass('border-[var(--color-error-500)]');
    });

    it('applies error styles when isInvalid is true', () => {
      render(<Input label="Email" isInvalid />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveClass('border-[var(--color-error-500)]');
    });

    it('sets aria-invalid when error is present', () => {
      render(<Input label="Email" error="Invalid email" />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-invalid when isInvalid is true', () => {
      render(<Input label="Email" isInvalid />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('associates error message with input via aria-describedby', () => {
      render(<Input label="Email" error="Invalid email" />);
      
      const input = screen.getByLabelText(/email/i);
      const errorMessage = screen.getByText(/invalid email/i);
      
      expect(input).toHaveAttribute('aria-describedby');
      expect(input.getAttribute('aria-describedby')).toContain(errorMessage.id);
    });

    it('announces error to screen readers with aria-live', () => {
      render(<Input label="Email" error="Invalid email" />);
      
      const errorMessage = screen.getByText(/invalid email/i);
      expect(errorMessage.parentElement).toHaveAttribute('aria-live', 'polite');
    });

    it('displays error icon with error message', () => {
      render(<Input label="Email" error="Invalid email" />);
      
      const errorContainer = screen.getByText(/invalid email/i).parentElement;
      const errorIcon = errorContainer?.querySelector('svg');
      
      expect(errorIcon).toBeInTheDocument();
      expect(errorIcon).toHaveAttribute('aria-hidden', 'true');
    });

    it('hides helper text when error is present', () => {
      render(
        <Input
          label="Email"
          helperText="Enter your email"
          error="Invalid email"
        />
      );
      
      expect(screen.queryByText(/enter your email/i)).not.toBeInTheDocument();
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  describe('Required Field Indicators', () => {
    it('displays asterisk when isRequired is true', () => {
      render(<Input label="Email" isRequired />);
      
      const asterisk = screen.getByText('*');
      expect(asterisk).toBeInTheDocument();
      expect(asterisk).toHaveClass('text-[var(--color-error-500)]');
    });

    it('sets aria-required when isRequired is true', () => {
      render(<Input label="Email" isRequired />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('adds aria-label to required asterisk', () => {
      render(<Input label="Email" isRequired />);
      
      const asterisk = screen.getByLabelText('required');
      expect(asterisk).toBeInTheDocument();
    });

    it('does not display asterisk when isRequired is false', () => {
      render(<Input label="Email" />);
      
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });

    it('sets aria-required to false by default', () => {
      render(<Input label="Email" />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveAttribute('aria-required', 'false');
    });
  });

  describe('Helper Text', () => {
    it('renders helper text when provided', () => {
      render(<Input label="Password" helperText="Must be at least 8 characters" />);
      
      const helperText = screen.getByText(/must be at least 8 characters/i);
      expect(helperText).toBeInTheDocument();
    });

    it('associates helper text with input via aria-describedby', () => {
      render(<Input label="Password" helperText="Must be at least 8 characters" />);
      
      const input = screen.getByLabelText(/password/i);
      const helperText = screen.getByText(/must be at least 8 characters/i);
      
      expect(input).toHaveAttribute('aria-describedby');
      expect(input.getAttribute('aria-describedby')).toContain(helperText.id);
    });

    it('applies correct styling to helper text', () => {
      render(<Input label="Password" helperText="Helper text" />);
      
      const helperText = screen.getByText(/helper text/i);
      expect(helperText).toHaveClass('text-sm');
      expect(helperText).toHaveClass('text-[var(--color-text-secondary)]');
    });

    it('does not render helper text when not provided', () => {
      render(<Input label="Email" />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('Addon Rendering', () => {
    it('renders left addon', () => {
      const leftAddon = <span data-testid="left-addon">@</span>;
      render(<Input label="Username" leftAddon={leftAddon} />);
      
      const addon = screen.getByTestId('left-addon');
      expect(addon).toBeInTheDocument();
    });

    it('renders right addon', () => {
      const rightAddon = <span data-testid="right-addon">✓</span>;
      render(<Input label="Email" rightAddon={rightAddon} />);
      
      const addon = screen.getByTestId('right-addon');
      expect(addon).toBeInTheDocument();
    });

    it('renders both left and right addons', () => {
      const leftAddon = <span data-testid="left-addon">$</span>;
      const rightAddon = <span data-testid="right-addon">.00</span>;
      
      render(<Input label="Price" leftAddon={leftAddon} rightAddon={rightAddon} />);
      
      expect(screen.getByTestId('left-addon')).toBeInTheDocument();
      expect(screen.getByTestId('right-addon')).toBeInTheDocument();
    });

    it('hides addons from screen readers', () => {
      const leftAddon = <span data-testid="left-addon">@</span>;
      render(<Input label="Username" leftAddon={leftAddon} />);
      
      const addonWrapper = screen.getByTestId('left-addon').parentElement;
      expect(addonWrapper).toHaveAttribute('aria-hidden', 'true');
    });

    it('applies left padding when left addon is present', () => {
      const leftAddon = <span data-testid="left-addon">@</span>;
      render(<Input label="Username" leftAddon={leftAddon} />);
      
      const input = screen.getByLabelText(/username/i);
      expect(input).toHaveClass('pl-10');
    });

    it('applies right padding when right addon is present', () => {
      const rightAddon = <span data-testid="right-addon">✓</span>;
      render(<Input label="Email" rightAddon={rightAddon} />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveClass('pr-10');
    });

    it('applies both paddings when both addons are present', () => {
      const leftAddon = <span data-testid="left-addon">$</span>;
      const rightAddon = <span data-testid="right-addon">.00</span>;
      
      render(<Input label="Price" leftAddon={leftAddon} rightAddon={rightAddon} />);
      
      const input = screen.getByLabelText(/price/i);
      expect(input).toHaveClass('pl-10');
      expect(input).toHaveClass('pr-10');
    });

    it('positions left addon correctly', () => {
      const leftAddon = <span data-testid="left-addon">@</span>;
      render(<Input label="Username" leftAddon={leftAddon} />);
      
      const addonWrapper = screen.getByTestId('left-addon').parentElement;
      expect(addonWrapper).toHaveClass('left-3');
      expect(addonWrapper).toHaveClass('absolute');
    });

    it('positions right addon correctly', () => {
      const rightAddon = <span data-testid="right-addon">✓</span>;
      render(<Input label="Email" rightAddon={rightAddon} />);
      
      const addonWrapper = screen.getByTestId('right-addon').parentElement;
      expect(addonWrapper).toHaveClass('right-3');
      expect(addonWrapper).toHaveClass('absolute');
    });
  });

  describe('Disabled State', () => {
    it('disables input when disabled prop is true', () => {
      render(<Input label="Email" disabled />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toBeDisabled();
    });

    it('applies disabled styles to input', () => {
      render(<Input label="Email" disabled />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveClass('disabled:opacity-50');
      expect(input).toHaveClass('disabled:cursor-not-allowed');
    });

    it('applies disabled styles to label', () => {
      render(<Input label="Email" disabled />);
      
      const label = screen.getByText(/email/i);
      expect(label).toHaveClass('opacity-50');
      expect(label).toHaveClass('cursor-not-allowed');
    });

    it('prevents user input when disabled', async () => {
      const user = userEvent.setup();
      render(<Input label="Email" disabled />);
      
      const input = screen.getByLabelText(/email/i) as HTMLInputElement;
      await user.type(input, 'test');
      
      expect(input.value).toBe('');
    });
  });

  describe('ARIA Attributes', () => {
    it('sets aria-invalid to false by default', () => {
      render(<Input label="Email" />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('sets aria-required to false by default', () => {
      render(<Input label="Email" />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveAttribute('aria-required', 'false');
    });

    it('sets aria-describedby when error is present', () => {
      render(<Input label="Email" error="Invalid email" />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveAttribute('aria-describedby');
      expect(input.getAttribute('aria-describedby')).toContain('-error');
    });

    it('sets aria-describedby when helper text is present', () => {
      render(<Input label="Email" helperText="Enter your email" />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveAttribute('aria-describedby');
      expect(input.getAttribute('aria-describedby')).toContain('-helper');
    });

    it('prioritizes error over helper text in aria-describedby', () => {
      render(
        <Input
          label="Email"
          helperText="Enter your email"
          error="Invalid email"
        />
      );
      
      const input = screen.getByLabelText(/email/i);
      const describedBy = input.getAttribute('aria-describedby');
      
      expect(describedBy).toContain('-error');
      expect(describedBy).not.toContain('-helper');
    });

    it('does not set aria-describedby when no helper text or error', () => {
      render(<Input label="Email" />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('Focus Management', () => {
    it('can be focused with keyboard', async () => {
      const user = userEvent.setup();
      render(<Input label="Email" />);
      
      const input = screen.getByLabelText(/email/i);
      
      await user.tab();
      expect(input).toHaveFocus();
    });

    it('applies focus styles', () => {
      render(<Input label="Email" />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveClass('focus:outline-none');
      expect(input).toHaveClass('focus:ring-2');
    });

    it('applies focus border color for normal state', () => {
      render(<Input label="Email" />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveClass('focus:border-[var(--color-border-focus)]');
      expect(input).toHaveClass('focus:ring-[var(--color-primary-500)]');
    });

    it('applies focus border color for error state', () => {
      render(<Input label="Email" error="Invalid email" />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveClass('focus:border-[var(--color-error-500)]');
      expect(input).toHaveClass('focus:ring-[var(--color-error-500)]');
    });

    it('cannot be focused when disabled', () => {
      render(<Input label="Email" disabled />);
      
      const input = screen.getByLabelText(/email/i);
      input.focus();
      
      expect(input).not.toHaveFocus();
    });
  });

  describe('Value Changes and Input Handling', () => {
    it('accepts user input', async () => {
      const user = userEvent.setup();
      render(<Input label="Email" />);
      
      const input = screen.getByLabelText(/email/i) as HTMLInputElement;
      await user.type(input, 'test@example.com');
      
      expect(input.value).toBe('test@example.com');
    });

    it('calls onChange handler when value changes', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(<Input label="Email" onChange={handleChange} />);
      
      const input = screen.getByLabelText(/email/i);
      await user.type(input, 'a');
      
      expect(handleChange).toHaveBeenCalled();
    });

    it('passes event to onChange handler', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(<Input label="Email" onChange={handleChange} />);
      
      const input = screen.getByLabelText(/email/i);
      await user.type(input, 'a');
      
      expect(handleChange).toHaveBeenCalledWith(expect.any(Object));
    });

    it('supports controlled input with value prop', () => {
      const { rerender } = render(<Input label="Email" value="test@example.com" onChange={() => {}} />);
      
      const input = screen.getByLabelText(/email/i) as HTMLInputElement;
      expect(input.value).toBe('test@example.com');
      
      rerender(<Input label="Email" value="new@example.com" onChange={() => {}} />);
      expect(input.value).toBe('new@example.com');
    });

    it('supports uncontrolled input with defaultValue', () => {
      render(<Input label="Email" defaultValue="default@example.com" />);
      
      const input = screen.getByLabelText(/email/i) as HTMLInputElement;
      expect(input.value).toBe('default@example.com');
    });

    it('accepts placeholder text', () => {
      render(<Input label="Email" placeholder="Enter your email" />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveAttribute('placeholder', 'Enter your email');
    });

    it('supports different input types', () => {
      render(<Input label="Password" type="password" />);
      
      const input = screen.getByLabelText(/password/i);
      expect(input).toHaveAttribute('type', 'password');
    });

    it('supports maxLength attribute', () => {
      render(<Input label="Username" maxLength={20} />);
      
      const input = screen.getByLabelText(/username/i);
      expect(input).toHaveAttribute('maxLength', '20');
    });

    it('supports pattern attribute', () => {
      render(<Input label="Phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" />);
      
      const input = screen.getByLabelText(/phone/i);
      expect(input).toHaveAttribute('pattern', '[0-9]{3}-[0-9]{3}-[0-9]{4}');
    });
  });

  describe('Styling and Layout', () => {
    it('applies base input styles', () => {
      render(<Input label="Email" />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveClass('w-full');
      expect(input).toHaveClass('px-3');
      expect(input).toHaveClass('py-2');
      expect(input).toHaveClass('text-base');
    });

    it('applies border and border radius', () => {
      render(<Input label="Email" />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveClass('border');
      expect(input).toHaveClass('rounded-[var(--radius-md)]');
    });

    it('applies transition styles', () => {
      render(<Input label="Email" />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveClass('transition-all');
      expect(input).toHaveClass('duration-200');
    });

    it('applies hover styles for normal state', () => {
      render(<Input label="Email" />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveClass('hover:border-[var(--color-border-hover)]');
    });

    it('merges custom className with default classes', () => {
      render(<Input label="Email" className="custom-class" />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveClass('custom-class');
      expect(input).toHaveClass('w-full'); // Base class
    });

    it('applies full width to wrapper', () => {
      const { container } = render(<Input label="Email" />);
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('w-full');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to input element', () => {
      const ref = { current: null as HTMLInputElement | null };
      
      render(<Input ref={ref} label="Email" />);
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('allows programmatic focus via ref', () => {
      const ref = { current: null as HTMLInputElement | null };
      
      render(<Input ref={ref} label="Email" />);
      
      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });

    it('allows accessing input value via ref', async () => {
      const user = userEvent.setup();
      const ref = { current: null as HTMLInputElement | null };
      
      render(<Input ref={ref} label="Email" />);
      
      await user.type(ref.current!, 'test@example.com');
      expect(ref.current?.value).toBe('test@example.com');
    });
  });

  describe('Placeholder Styling', () => {
    it('applies placeholder text color', () => {
      render(<Input label="Email" placeholder="Enter email" />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveClass('placeholder:text-[var(--color-text-tertiary)]');
    });
  });

  describe('Background and Text Colors', () => {
    it('applies correct background color', () => {
      render(<Input label="Email" />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveClass('bg-[var(--color-background-primary)]');
    });

    it('applies correct text color', () => {
      render(<Input label="Email" />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveClass('text-[var(--color-text-primary)]');
    });

    it('applies disabled background color', () => {
      render(<Input label="Email" disabled />);
      
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveClass('disabled:bg-[var(--color-background-secondary)]');
    });
  });
});
