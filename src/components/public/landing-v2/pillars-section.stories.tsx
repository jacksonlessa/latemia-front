import type React from 'react';
import { PillarsSection } from './pillars-section';

const meta = {
  title: 'public/landing-v2/PillarsSection',
  component: PillarsSection,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = {
  render?: () => React.ReactElement;
  name?: string;
};

export const Default: Story = {
  name: 'Default',
};
