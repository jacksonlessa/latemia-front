import type React from 'react';
import { ClinicaHero } from './clinica-hero';

const meta = {
  title: 'public/landing-clinica/ClinicaHero',
  component: ClinicaHero,
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
