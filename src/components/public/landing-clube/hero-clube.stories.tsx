import type React from 'react';
import { HeroClube } from './hero-clube';

const meta = {
  title: 'public/landing-clube/HeroClube',
  component: HeroClube,
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
