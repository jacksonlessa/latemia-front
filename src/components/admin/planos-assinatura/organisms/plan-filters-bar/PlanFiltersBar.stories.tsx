/**
 * Storybook stories for PlanFiltersBar organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow CSF and will be picked up once Storybook is installed.
 */

import type React from 'react';
import { useState } from 'react';
import { PlanFiltersBar } from './PlanFiltersBar';

const meta = {
  title: 'Admin - Planos de Assinatura/Organisms/PlanFiltersBar',
  component: PlanFiltersBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

type Story = {
  render?: () => React.ReactElement;
  name?: string;
};

/** Barra de filtros vazia */
export const Empty: Story = {
  name: 'Empty',
  render: () => {
    const [filter, setFilter] = useState('');
    return (
      <PlanFiltersBar
        nameFilter={filter}
        onNameFilterChange={setFilter}
      />
    );
  },
};

/** Com valor preenchido */
export const WithValue: Story = {
  name: 'Com Valor',
  render: () => {
    const [filter, setFilter] = useState('Plano Mensal');
    return (
      <PlanFiltersBar
        nameFilter={filter}
        onNameFilterChange={setFilter}
      />
    );
  },
};

/** Desabilitada */
export const Disabled: Story = {
  name: 'Desabilitada',
  render: () => (
    <PlanFiltersBar
      nameFilter=""
      onNameFilterChange={() => undefined}
      disabled
    />
  ),
};
