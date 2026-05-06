/**
 * Storybook stories for UncoveredOptionsBanner molecule.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow CSF and will be picked up once Storybook is installed.
 */

import type React from 'react';
import { UncoveredOptionsBanner } from './UncoveredOptionsBanner';

const meta = {
  title: 'Admin - Planos de Assinatura/Molecules/UncoveredOptionsBanner',
  component: UncoveredOptionsBanner,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

type Story = {
  render?: () => React.ReactElement;
  name?: string;
};

/** Banner padrão */
export const Default: Story = {
  name: 'Default',
  render: () => <UncoveredOptionsBanner />,
};

/** Banner com classe extra para largura máxima */
export const Constrained: Story = {
  name: 'Com Largura Máxima',
  render: () => <UncoveredOptionsBanner className="max-w-lg" />,
};
