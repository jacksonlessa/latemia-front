/**
 * Storybook stories for TerminalStateBanner molecule.
 *
 * NOTE: Storybook is not yet configured in this project.
 */

import type React from 'react';
import { TerminalStateBanner } from './TerminalStateBanner';
import type { PlanStatus } from '@/lib/types/plan';

const meta = {
  title: 'Admin - Planos/Molecules/TerminalStateBanner',
  component: TerminalStateBanner,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

interface TerminalStateBannerProps {
  status: PlanStatus;
}

type Story = {
  render?: (args: TerminalStateBannerProps) => React.ReactElement;
  args?: Partial<TerminalStateBannerProps>;
  name?: string;
};

export const Cancelado: Story = {
  name: 'Cancelado',
  args: { status: 'cancelado' },
};

export const Estornado: Story = {
  name: 'Estornado',
  args: { status: 'estornado' },
};

export const Contestado: Story = {
  name: 'Contestado',
  args: { status: 'contestado' },
};
