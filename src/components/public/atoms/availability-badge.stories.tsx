import type React from 'react';
import {
  AvailabilityBadge,
  type AvailabilityBadgeProps,
} from './availability-badge';

const meta = {
  title: 'public/atoms/AvailabilityBadge',
  component: AvailabilityBadge,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

type Story = {
  render?: (args: AvailabilityBadgeProps) => React.ReactElement;
  args?: Partial<AvailabilityBadgeProps>;
  name?: string;
};

export const Immediate: Story = {
  name: 'Immediate',
  args: { variant: 'immediate' },
};

export const AfterWaiting: Story = {
  name: 'AfterWaiting',
  args: { variant: 'after-waiting' },
};
