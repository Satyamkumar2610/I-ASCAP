'use client';

/**
 * Design System Test Page
 * 
 * Visual test page for design system components
 */

import React from 'react';
import { Button } from '../design-system/components/Button';
import { Input } from '../design-system/components/Input';
import { Card } from '../design-system/components/Card';
import { Select } from '../design-system/components/Select';
import { ThemeProvider } from '../design-system/theme/ThemeProvider';

export default function DesignSystemTestPage() {
  const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({});
  const [selectValue, setSelectValue] = React.useState('option1');
  const [searchableSelectValue, setSearchableSelectValue] = React.useState('');
  const [disabledSelectValue, setDisabledSelectValue] = React.useState('option2');
  const handleClick = (id: string) => {
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen p-8 bg-[var(--color-background-primary)]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-[var(--color-text-primary)]">
              Design System Test
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              Visual testing for Button component
            </p>
          </div>

          {/* Button Variants */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              Button Variants
            </h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </section>

          {/* Button Sizes */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              Button Sizes
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </section>

          {/* Loading States */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              Loading States
            </h2>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="primary"
                isLoading={loadingStates['loading1']}
                onClick={() => handleClick('loading1')}
              >
                Click to Load
              </Button>
              <Button
                variant="secondary"
                isLoading={loadingStates['loading2']}
                onClick={() => handleClick('loading2')}
              >
                Click to Load
              </Button>
              <Button variant="outline" isLoading>
                Loading...
              </Button>
            </div>
          </section>

          {/* Icons */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              Buttons with Icons
            </h2>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="primary"
                leftIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                }
              >
                With Left Icon
              </Button>
              <Button
                variant="secondary"
                rightIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                }
              >
                With Right Icon
              </Button>
              <Button
                variant="outline"
                leftIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                }
                isLoading={loadingStates['loading3']}
                onClick={() => handleClick('loading3')}
              >
                Icon + Loading
              </Button>
            </div>
          </section>

          {/* Disabled States */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              Disabled States
            </h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" disabled>
                Disabled Primary
              </Button>
              <Button variant="secondary" disabled>
                Disabled Secondary
              </Button>
              <Button variant="outline" disabled>
                Disabled Outline
              </Button>
              <Button variant="ghost" disabled>
                Disabled Ghost
              </Button>
              <Button variant="danger" disabled>
                Disabled Danger
              </Button>
            </div>
          </section>

          {/* Full Width */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              Full Width Button
            </h2>
            <Button variant="primary" fullWidth>
              Full Width Button
            </Button>
          </section>

          {/* Accessibility Test */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              Accessibility
            </h2>
            <div className="space-y-2">
              <p className="text-[var(--color-text-secondary)]">
                Test keyboard navigation: Use Tab to focus, Enter/Space to activate
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Keyboard Test 1</Button>
                <Button variant="secondary">Keyboard Test 2</Button>
                <Button variant="outline">Keyboard Test 3</Button>
              </div>
            </div>
          </section>

          {/* Input Component Tests */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              Input Component
            </h2>

            {/* Basic Input */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-[var(--color-text-primary)]">
                Basic Input
              </h3>
              <div className="max-w-md">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Required Input */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-[var(--color-text-primary)]">
                Required Input
              </h3>
              <div className="max-w-md">
                <Input
                  label="Username"
                  type="text"
                  placeholder="Enter username"
                  isRequired
                />
              </div>
            </div>

            {/* Input with Helper Text */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-[var(--color-text-primary)]">
                Input with Helper Text
              </h3>
              <div className="max-w-md">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  helperText="Must be at least 8 characters long"
                />
              </div>
            </div>

            {/* Input with Error */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-[var(--color-text-primary)]">
                Input with Error
              </h3>
              <div className="max-w-md">
                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  error="Please enter a valid email address"
                  defaultValue="invalid-email"
                />
              </div>
            </div>

            {/* Input with Left Addon */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-[var(--color-text-primary)]">
                Input with Left Addon
              </h3>
              <div className="max-w-md">
                <Input
                  label="Search"
                  type="text"
                  placeholder="Search..."
                  leftAddon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  }
                />
              </div>
            </div>

            {/* Input with Right Addon */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-[var(--color-text-primary)]">
                Input with Right Addon
              </h3>
              <div className="max-w-md">
                <Input
                  label="Website"
                  type="url"
                  placeholder="example.com"
                  rightAddon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  }
                />
              </div>
            </div>

            {/* Disabled Input */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-[var(--color-text-primary)]">
                Disabled Input
              </h3>
              <div className="max-w-md">
                <Input
                  label="Disabled Field"
                  type="text"
                  placeholder="Cannot edit"
                  disabled
                  defaultValue="This field is disabled"
                />
              </div>
            </div>

            {/* Input without Label */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-[var(--color-text-primary)]">
                Input without Label
              </h3>
              <div className="max-w-md">
                <Input
                  type="text"
                  placeholder="No label input"
                  helperText="This input has no label"
                />
              </div>
            </div>
          </section>

          {/* Select Component Tests */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              Select Component
            </h2>

            {/* Basic Select */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-[var(--color-text-primary)]">
                Basic Select
              </h3>
              <div className="max-w-md">
                <Select
                  label="Country"
                  options={[
                    { value: 'option1', label: 'United States' },
                    { value: 'option2', label: 'United Kingdom' },
                    { value: 'option3', label: 'Canada' },
                    { value: 'option4', label: 'Australia' },
                    { value: 'option5', label: 'India' },
                  ]}
                  value={selectValue}
                  onChange={setSelectValue}
                  placeholder="Select a country"
                />
              </div>
            </div>

            {/* Searchable Select */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-[var(--color-text-primary)]">
                Searchable Select
              </h3>
              <div className="max-w-md">
                <Select
                  label="District"
                  isSearchable
                  options={[
                    { value: 'mumbai', label: 'Mumbai' },
                    { value: 'pune', label: 'Pune' },
                    { value: 'nagpur', label: 'Nagpur' },
                    { value: 'nashik', label: 'Nashik' },
                    { value: 'aurangabad', label: 'Aurangabad' },
                    { value: 'solapur', label: 'Solapur' },
                    { value: 'kolhapur', label: 'Kolhapur' },
                    { value: 'ahmednagar', label: 'Ahmednagar' },
                    { value: 'satara', label: 'Satara' },
                    { value: 'sangli', label: 'Sangli' },
                  ]}
                  value={searchableSelectValue}
                  onChange={setSearchableSelectValue}
                  placeholder="Search for a district"
                />
              </div>
            </div>

            {/* Select with Error */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-[var(--color-text-primary)]">
                Select with Error
              </h3>
              <div className="max-w-md">
                <Select
                  label="Crop Type"
                  options={[
                    { value: 'rice', label: 'Rice' },
                    { value: 'wheat', label: 'Wheat' },
                    { value: 'cotton', label: 'Cotton' },
                  ]}
                  value=""
                  onChange={() => {}}
                  error="Please select a crop type"
                />
              </div>
            </div>

            {/* Disabled Select */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-[var(--color-text-primary)]">
                Disabled Select
              </h3>
              <div className="max-w-md">
                <Select
                  label="Season"
                  options={[
                    { value: 'option1', label: 'Kharif' },
                    { value: 'option2', label: 'Rabi' },
                    { value: 'option3', label: 'Zaid' },
                  ]}
                  value={disabledSelectValue}
                  onChange={setDisabledSelectValue}
                  isDisabled
                />
              </div>
            </div>

            {/* Select with Disabled Options */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-[var(--color-text-primary)]">
                Select with Disabled Options
              </h3>
              <div className="max-w-md">
                <Select
                  label="Risk Level"
                  options={[
                    { value: 'low', label: 'Low Risk' },
                    { value: 'medium', label: 'Medium Risk' },
                    { value: 'high', label: 'High Risk', disabled: true },
                    { value: 'critical', label: 'Critical Risk', disabled: true },
                  ]}
                  value="low"
                  onChange={() => {}}
                />
              </div>
            </div>

            {/* Select without Label */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-[var(--color-text-primary)]">
                Select without Label
              </h3>
              <div className="max-w-md">
                <Select
                  options={[
                    { value: '2024', label: '2024' },
                    { value: '2023', label: '2023' },
                    { value: '2022', label: '2022' },
                  ]}
                  value="2024"
                  onChange={() => {}}
                  placeholder="Select year"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Card Component Tests */}
        <div className="max-w-6xl mx-auto space-y-12 mt-12">
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              Card Component
            </h2>

            {/* Card Variants */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-[var(--color-text-primary)]">
                Card Variants
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card variant="default">
                  <h4 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    Default Card
                  </h4>
                  <p className="text-[var(--color-text-secondary)]">
                    This is a default card with border styling.
                  </p>
                </Card>

                <Card variant="elevated">
                  <h4 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    Elevated Card
                  </h4>
                  <p className="text-[var(--color-text-secondary)]">
                    This card has a shadow for elevation effect.
                  </p>
                </Card>

                <Card variant="outlined">
                  <h4 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    Outlined Card
                  </h4>
                  <p className="text-[var(--color-text-secondary)]">
                    This card has a thicker border outline.
                  </p>
                </Card>

                <Card variant="ghost">
                  <h4 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    Ghost Card
                  </h4>
                  <p className="text-[var(--color-text-secondary)]">
                    This card has no background or border.
                  </p>
                </Card>
              </div>
            </div>

            {/* Card Padding Options */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-[var(--color-text-primary)]">
                Card Padding Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card padding="none" variant="outlined">
                  <div className="p-2 bg-[var(--color-primary-100)]">
                    <p className="text-[var(--color-text-primary)]">No Padding</p>
                  </div>
                </Card>

                <Card padding="sm" variant="outlined">
                  <p className="text-[var(--color-text-primary)]">Small Padding</p>
                </Card>

                <Card padding="md" variant="outlined">
                  <p className="text-[var(--color-text-primary)]">Medium Padding (Default)</p>
                </Card>

                <Card padding="lg" variant="outlined">
                  <p className="text-[var(--color-text-primary)]">Large Padding</p>
                </Card>
              </div>
            </div>

            {/* Hoverable Cards */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-[var(--color-text-primary)]">
                Hoverable Cards
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card variant="default" hoverable>
                  <h4 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    Hoverable Default
                  </h4>
                  <p className="text-[var(--color-text-secondary)]">
                    Hover over this card to see the effect.
                  </p>
                </Card>

                <Card variant="elevated" hoverable>
                  <h4 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    Hoverable Elevated
                  </h4>
                  <p className="text-[var(--color-text-secondary)]">
                    This card lifts up on hover.
                  </p>
                </Card>
              </div>
            </div>

            {/* Clickable Cards */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-[var(--color-text-primary)]">
                Clickable Cards
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card
                  variant="elevated"
                  hoverable
                  onClick={() => alert('Card 1 clicked!')}
                >
                  <h4 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    Clickable Card 1
                  </h4>
                  <p className="text-[var(--color-text-secondary)]">
                    Click this card or press Enter/Space when focused.
                  </p>
                </Card>

                <Card
                  variant="outlined"
                  hoverable
                  clickable
                  onClick={() => alert('Card 2 clicked!')}
                >
                  <h4 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    Clickable Card 2
                  </h4>
                  <p className="text-[var(--color-text-secondary)]">
                    This card is keyboard accessible.
                  </p>
                </Card>
              </div>
            </div>

            {/* Semantic HTML */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-[var(--color-text-primary)]">
                Semantic HTML
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card as="div" variant="outlined">
                  <h4 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    Div Element
                  </h4>
                  <p className="text-[var(--color-text-secondary)]">
                    Rendered as &lt;div&gt;
                  </p>
                </Card>

                <Card as="article" variant="outlined">
                  <h4 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    Article Element
                  </h4>
                  <p className="text-[var(--color-text-secondary)]">
                    Rendered as &lt;article&gt;
                  </p>
                </Card>

                <Card as="section" variant="outlined">
                  <h4 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    Section Element
                  </h4>
                  <p className="text-[var(--color-text-secondary)]">
                    Rendered as &lt;section&gt;
                  </p>
                </Card>
              </div>
            </div>

            {/* Complex Card Example */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-[var(--color-text-primary)]">
                Complex Card Example
              </h3>
              <Card variant="elevated" padding="lg" hoverable>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-[var(--color-text-primary)]">
                        Rainfall Analytics Dashboard
                      </h4>
                      <p className="text-[var(--color-text-secondary)] mt-1">
                        District: Maharashtra | Year: 2024
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-[var(--color-success-100)] text-[var(--color-success-700)] rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 py-4 border-y border-[var(--color-border-default)]">
                    <div>
                      <p className="text-sm text-[var(--color-text-secondary)]">Total Rainfall</p>
                      <p className="text-2xl font-bold text-[var(--color-text-primary)]">1,234 mm</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--color-text-secondary)]">Districts</p>
                      <p className="text-2xl font-bold text-[var(--color-text-primary)]">36</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--color-text-secondary)]">Risk Level</p>
                      <p className="text-2xl font-bold text-[var(--color-warning-600)]">Medium</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="primary" size="sm">View Details</Button>
                    <Button variant="outline" size="sm">Export Data</Button>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </ThemeProvider>
  );
}
