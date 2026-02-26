import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select, SelectOption } from './Select';

describe('Select Component', () => {
  const mockOptions: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4' },
  ];

  const mockOptionsWithDisabled: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4', disabled: true },
  ];

  describe('Basic Rendering', () => {
    it('renders select button with placeholder', () => {
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          placeholder="Select an option"
        />
      );

      const button = screen.getByRole('combobox');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Select an option');
    });

    it('renders select button with selected value', () => {
      render(
        <Select
          options={mockOptions}
          value="option2"
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      expect(button).toHaveTextContent('Option 2');
    });

    it('renders label when provided', () => {
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          label="Choose Option"
        />
      );

      const label = screen.getByText('Choose Option');
      expect(label).toBeInTheDocument();
    });

    it('associates label with select button', () => {
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          label="Choose Option"
        />
      );

      const button = screen.getByRole('combobox');
      const label = screen.getByText('Choose Option');

      expect(button).toHaveAttribute('aria-labelledby', label.id);
    });

    it('renders without label', () => {
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      expect(button).toBeInTheDocument();
      expect(button).not.toHaveAttribute('aria-labelledby');
    });
  });

  describe('Dropdown Behavior', () => {
    it('opens dropdown when button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('closes dropdown when button is clicked again', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');

      // Open dropdown
      await user.click(button);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      // Close dropdown
      await user.click(button);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('displays all options when dropdown is open', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(4);
      expect(options[0]).toHaveTextContent('Option 1');
      expect(options[1]).toHaveTextContent('Option 2');
      expect(options[2]).toHaveTextContent('Option 3');
      expect(options[3]).toHaveTextContent('Option 4');
    });

    it('shows checkmark on selected option', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value="option2"
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const selectedOption = screen.getByRole('option', { name: /option 2/i });
      expect(selectedOption).toHaveAttribute('aria-selected', 'true');

      // Check for checkmark SVG
      const checkmark = selectedOption.querySelector('svg');
      expect(checkmark).toBeInTheDocument();
    });

    it('closes dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Select
            options={mockOptions}
            value=""
            onChange={() => { }}
          />
          <button>Outside Button</button>
        </div>
      );

      const selectButton = screen.getByRole('combobox');
      await user.click(selectButton);

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      const outsideButton = screen.getByRole('button', { name: /outside button/i });
      await user.click(outsideButton);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Option Selection', () => {
    it('calls onChange when option is selected', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Select
          options={mockOptions}
          value=""
          onChange={handleChange}
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const option = screen.getByRole('option', { name: /option 2/i });
      await user.click(option);

      expect(handleChange).toHaveBeenCalledWith('option2');
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('closes dropdown after selecting an option', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const option = screen.getByRole('option', { name: /option 1/i });
      await user.click(option);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('does not call onChange for disabled options', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Select
          options={mockOptionsWithDisabled}
          value=""
          onChange={handleChange}
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const disabledOption = screen.getByRole('option', { name: /option 4/i });
      await user.click(disabledOption);

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('marks disabled options with aria-disabled', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptionsWithDisabled}
          value=""
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const disabledOption = screen.getByRole('option', { name: /option 4/i });
      expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Keyboard Navigation', () => {
    it('opens dropdown with Enter key', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      button.focus();

      await user.keyboard('{Enter}');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('opens dropdown with Space key', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      button.focus();

      await user.keyboard(' ');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('closes dropdown with Escape key', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      button.focus();

      await user.keyboard('{Enter}');
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('navigates options with ArrowDown key', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      button.focus();

      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      // Press ArrowDown again to highlight first option (initial highlightedIndex is -1)
      await user.keyboard('{ArrowDown}');

      // First option should be highlighted
      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveClass('bg-[var(--color-background-secondary)]');
    });

    it('navigates options with ArrowUp key', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      button.focus();

      await user.keyboard('{ArrowUp}');
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      // Press ArrowUp again - wraps around from -1 to last option (index 3)
      await user.keyboard('{ArrowUp}');

      // Last option should be highlighted
      const options = screen.getAllByRole('option');
      expect(options[options.length - 1]).toHaveClass('bg-[var(--color-background-secondary)]');
    });

    it('cycles through options with ArrowDown', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      button.focus();

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');

      const options = screen.getAllByRole('option');
      expect(options[1]).toHaveClass('bg-[var(--color-background-secondary)]');
    });

    it('selects highlighted option with Enter key', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Select
          options={mockOptions}
          value=""
          onChange={handleChange}
        />
      );

      const button = screen.getByRole('combobox');
      button.focus();

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(handleChange).toHaveBeenCalledWith('option1');
    });

    it('jumps to first option with Home key', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      button.focus();

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Home}');

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveClass('bg-[var(--color-background-secondary)]');
    });

    it('jumps to last option with End key', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      button.focus();

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{End}');

      const options = screen.getAllByRole('option');
      // Last option should be highlighted
      expect(options[options.length - 1]).toHaveClass('bg-[var(--color-background-secondary)]');
    });
  });

  describe('Search Functionality', () => {
    it('renders search input when isSearchable is true', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          isSearchable
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', 'Search...');
    });

    it('does not render search input when isSearchable is false', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          isSearchable={false}
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    });

    it('filters options based on search query', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          isSearchable
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, '2');

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent('Option 2');
    });

    it('shows "No options found" when search has no results', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          isSearchable
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'xyz');

      const noResults = screen.getByText('No options found');
      expect(noResults).toBeInTheDocument();
    });

    it('search is case-insensitive', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          isSearchable
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'OPTION 3');

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent('Option 3');
    });

    it('clears search query when dropdown closes', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          isSearchable
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'option 2');

      await user.keyboard('{Escape}');
      await user.click(button);

      const newSearchInput = screen.getByRole('searchbox');
      expect(newSearchInput).toHaveValue('');
    });

    it('focuses search input when dropdown opens', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          isSearchable
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toHaveFocus();
    });

    it('allows keyboard navigation from search input', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          isSearchable
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toHaveFocus();

      await user.keyboard('{ArrowDown}');

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveClass('bg-[var(--color-background-secondary)]');
    });

    it('closes dropdown with Escape from search input', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          isSearchable
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'test');
      await user.keyboard('{Escape}');

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility Attributes', () => {
    it('has correct ARIA role', () => {
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      expect(button).toHaveAttribute('role', 'combobox');
    });

    it('sets aria-expanded correctly', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      expect(button).toHaveAttribute('aria-expanded', 'false');

      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('sets aria-haspopup attribute', () => {
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('sets aria-controls to listbox id', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const listbox = screen.getByRole('listbox');
      expect(button).toHaveAttribute('aria-controls', listbox.id);
    });

    it('sets aria-invalid when error is present', () => {
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          error="Please select an option"
        />
      );

      const button = screen.getByRole('combobox');
      expect(button).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-describedby when error is present', () => {
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          error="Please select an option"
        />
      );

      const button = screen.getByRole('combobox');
      const errorMessage = screen.getByText('Please select an option');

      expect(button).toHaveAttribute('aria-describedby');
      expect(button.getAttribute('aria-describedby')).toContain(errorMessage.id);
    });

    it('has screen reader announcement region', () => {
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      const announcement = document.querySelector('[role="status"][aria-live="polite"]');
      expect(announcement).toBeInTheDocument();
    });

    it('hides chevron icon from screen readers', () => {
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      const chevron = button.querySelector('svg');

      expect(chevron).toHaveAttribute('aria-hidden', 'true');
    });

    it('hides checkmark icon from screen readers', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value="option1"
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const selectedOption = screen.getByRole('option', { name: /option 1/i });
      const checkmark = selectedOption.querySelector('svg');

      expect(checkmark).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Error State', () => {
    it('renders error message when error prop is provided', () => {
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          error="This field is required"
        />
      );

      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toBeInTheDocument();
    });

    it('applies error styles to button', () => {
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          error="This field is required"
        />
      );

      const button = screen.getByRole('combobox');
      expect(button).toHaveClass('border-[var(--color-error-500)]');
    });

    it('displays error icon with error message', () => {
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          error="This field is required"
        />
      );

      const errorContainer = screen.getByText('This field is required').parentElement;
      const errorIcon = errorContainer?.querySelector('svg');

      expect(errorIcon).toBeInTheDocument();
      expect(errorIcon).toHaveAttribute('aria-hidden', 'true');
    });

    it('announces error to screen readers', () => {
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          error="This field is required"
        />
      );

      const errorContainer = screen.getByText('This field is required').parentElement;
      expect(errorContainer).toHaveAttribute('role', 'alert');
      expect(errorContainer).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Disabled State', () => {
    it('disables button when isDisabled is true', () => {
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          isDisabled
        />
      );

      const button = screen.getByRole('combobox');
      expect(button).toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          isDisabled
        />
      );

      const button = screen.getByRole('combobox');
      expect(button).toHaveClass('opacity-50');
      expect(button).toHaveClass('cursor-not-allowed');
    });

    it('does not open dropdown when disabled', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          isDisabled
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('does not respond to keyboard when disabled', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          isDisabled
        />
      );

      const button = screen.getByRole('combobox');
      button.focus();

      await user.keyboard('{Enter}');

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('applies disabled styles to label', () => {
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
          label="Choose Option"
          isDisabled
        />
      );

      const label = screen.getByText('Choose Option');
      expect(label).toHaveClass('opacity-50');
      expect(label).toHaveClass('cursor-not-allowed');
    });
  });

  describe('Chevron Icon Animation', () => {
    it('rotates chevron when dropdown is open', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      const chevron = button.querySelector('svg');

      expect(chevron).not.toHaveClass('rotate-180');

      await user.click(button);
      expect(chevron).toHaveClass('rotate-180');
    });
  });

  describe('Mouse Interaction', () => {
    it('highlights option on mouse enter', async () => {
      const user = userEvent.setup();
      render(
        <Select
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const option = screen.getByRole('option', { name: /option 2/i });
      await user.hover(option);

      expect(option).toHaveClass('bg-[var(--color-background-secondary)]');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to button element', () => {
      const ref = { current: null as HTMLButtonElement | null };

      render(
        <Select
          ref={ref}
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('allows programmatic focus via ref', () => {
      const ref = { current: null as HTMLButtonElement | null };

      render(
        <Select
          ref={ref}
          options={mockOptions}
          value=""
          onChange={() => { }}
        />
      );

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });

  describe('Generic Type Support', () => {
    it('works with number values', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const numberOptions: SelectOption<number>[] = [
        { value: 1, label: 'One' },
        { value: 2, label: 'Two' },
        { value: 3, label: 'Three' },
      ];

      render(
        <Select
          options={numberOptions}
          value={1}
          onChange={handleChange}
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const option = screen.getByRole('option', { name: /two/i });
      await user.click(option);

      expect(handleChange).toHaveBeenCalledWith(2);
    });

    it('works with object values', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      type CustomValue = { id: string; name: string };
      const obj1: CustomValue = { id: '1', name: 'First' };
      const obj2: CustomValue = { id: '2', name: 'Second' };

      const objectOptions: SelectOption<CustomValue>[] = [
        { value: obj1, label: 'First Option' },
        { value: obj2, label: 'Second Option' },
      ];

      render(
        <Select
          options={objectOptions}
          value={obj1}
          onChange={handleChange}
        />
      );

      const button = screen.getByRole('combobox');
      await user.click(button);

      const option = screen.getByRole('option', { name: /second option/i });
      await user.click(option);

      expect(handleChange).toHaveBeenCalledWith(obj2);
    });
  });
});
