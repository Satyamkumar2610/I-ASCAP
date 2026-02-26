/**
 * Card Component Tests
 * 
 * Tests for the Card component including:
 * - Variant rendering
 * - Padding options
 * - Hoverable and clickable states
 * - Semantic HTML rendering
 * - Keyboard navigation
 * - Accessibility
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card';

describe('Card Component', () => {
  // ============================================================================
  // Basic Rendering Tests
  // ============================================================================

  it('renders children correctly', () => {
    render(<Card>Test Content</Card>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders as div by default', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('renders as article when specified', () => {
    const { container } = render(<Card as="article">Content</Card>);
    expect(container.firstChild?.nodeName).toBe('ARTICLE');
  });

  it('renders as section when specified', () => {
    const { container } = render(<Card as="section">Content</Card>);
    expect(container.firstChild?.nodeName).toBe('SECTION');
  });

  // ============================================================================
  // Variant Tests
  // ============================================================================

  it('applies default variant styles', () => {
    const { container } = render(<Card variant="default">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-[var(--color-background-primary)]');
    expect(card.className).toContain('border');
  });

  it('applies elevated variant styles', () => {
    const { container } = render(<Card variant="elevated">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('shadow-[var(--shadow-md)]');
  });

  it('applies outlined variant styles', () => {
    const { container } = render(<Card variant="outlined">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-2');
  });

  it('applies ghost variant styles', () => {
    const { container } = render(<Card variant="ghost">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-transparent');
  });

  // ============================================================================
  // Padding Tests
  // ============================================================================

  it('applies medium padding by default', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('p-4');
  });

  it('applies no padding when specified', () => {
    const { container } = render(<Card padding="none">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).not.toContain('p-');
  });

  it('applies small padding when specified', () => {
    const { container } = render(<Card padding="sm">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('p-3');
  });

  it('applies large padding when specified', () => {
    const { container } = render(<Card padding="lg">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('p-6');
  });

  // ============================================================================
  // Hoverable Tests
  // ============================================================================

  it('applies hover styles when hoverable is true', () => {
    const { container } = render(<Card hoverable>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('hover:bg-[var(--color-background-secondary)]');
  });

  it('does not apply hover styles when hoverable is false', () => {
    const { container } = render(<Card hoverable={false}>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).not.toContain('hover:bg-[var(--color-background-secondary)]');
  });

  it('applies elevated hover effect for elevated variant', () => {
    const { container } = render(<Card variant="elevated" hoverable>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('hover:shadow-[var(--shadow-lg)]');
    expect(card.className).toContain('hover:translate-y-[-2px]');
  });

  // ============================================================================
  // Clickable Tests
  // ============================================================================

  it('applies cursor pointer when clickable is true', () => {
    const { container } = render(<Card clickable>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('cursor-pointer');
  });

  it('applies cursor pointer when onClick is provided', () => {
    const { container } = render(<Card onClick={() => {}}>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('cursor-pointer');
  });

  it('calls onClick when card is clicked', () => {
    const handleClick = vi.fn();
    const { container } = render(<Card onClick={handleClick}>Content</Card>);
    
    const card = container.firstChild as HTMLElement;
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies focus styles when clickable', () => {
    const { container } = render(<Card clickable>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('focus:outline-none');
    expect(card.className).toContain('focus:ring-2');
  });

  it('applies active scale effect when clickable', () => {
    const { container } = render(<Card clickable>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('active:scale-[0.98]');
  });

  // ============================================================================
  // Keyboard Navigation Tests
  // ============================================================================

  it('is keyboard accessible when clickable', () => {
    const { container } = render(<Card clickable>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.tabIndex).toBe(0);
  });

  it('calls onClick when Enter key is pressed', () => {
    const handleClick = vi.fn();
    const { container } = render(<Card onClick={handleClick}>Content</Card>);
    
    const card = container.firstChild as HTMLElement;
    fireEvent.keyDown(card, { key: 'Enter' });
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Space key is pressed', () => {
    const handleClick = vi.fn();
    const { container } = render(<Card onClick={handleClick}>Content</Card>);
    
    const card = container.firstChild as HTMLElement;
    fireEvent.keyDown(card, { key: ' ' });
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick for other keys', () => {
    const handleClick = vi.fn();
    const { container } = render(<Card onClick={handleClick}>Content</Card>);
    
    const card = container.firstChild as HTMLElement;
    fireEvent.keyDown(card, { key: 'a' });
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  it('has button role when onClick is provided', () => {
    const { container } = render(<Card onClick={() => {}}>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.getAttribute('role')).toBe('button');
  });

  it('does not have button role when not clickable', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.getAttribute('role')).toBeNull();
  });

  // ============================================================================
  // Custom Props Tests
  // ============================================================================

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('custom-class');
  });

  it('forwards additional HTML attributes', () => {
    const { container } = render(
      <Card data-testid="custom-card" aria-label="Test Card">
        Content
      </Card>
    );
    const card = container.firstChild as HTMLElement;
    expect(card.getAttribute('data-testid')).toBe('custom-card');
    expect(card.getAttribute('aria-label')).toBe('Test Card');
  });

  // ============================================================================
  // Combined Props Tests
  // ============================================================================

  it('combines multiple props correctly', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <Card
        variant="elevated"
        padding="lg"
        hoverable
        clickable
        onClick={handleClick}
        className="custom-class"
      >
        Content
      </Card>
    );
    
    const card = container.firstChild as HTMLElement;
    
    // Check variant
    expect(card.className).toContain('shadow-[var(--shadow-md)]');
    
    // Check padding
    expect(card.className).toContain('p-6');
    
    // Check hoverable
    expect(card.className).toContain('hover:bg-[var(--color-background-secondary)]');
    
    // Check clickable
    expect(card.className).toContain('cursor-pointer');
    expect(card.tabIndex).toBe(0);
    
    // Check custom class
    expect(card.className).toContain('custom-class');
    
    // Check onClick
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
