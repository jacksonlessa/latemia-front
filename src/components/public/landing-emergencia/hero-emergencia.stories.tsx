import type React from 'react';
import { HeroEmergencia } from './hero-emergencia';

const meta = {
  title: 'public/landing-emergencia/HeroEmergencia',
  component: HeroEmergencia,
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
