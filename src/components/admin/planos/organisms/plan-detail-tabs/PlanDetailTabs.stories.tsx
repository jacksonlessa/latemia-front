/**
 * Storybook stories for PlanDetailTabs organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 */

import type React from 'react';
import { PlanDetailTabs, type PlanDetailTabDefinition } from './PlanDetailTabs';

const meta = {
  title: 'Admin - Planos/Organisms/PlanDetailTabs',
  component: PlanDetailTabs,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

interface Args {
  tabs: PlanDetailTabDefinition[];
  activeTab?: string;
  onActiveTabChange?: (id: string) => void;
}

type Story = {
  render?: (args: Args) => React.ReactElement;
  args?: Partial<Args>;
  name?: string;
};

const sampleTabs: PlanDetailTabDefinition[] = [
  { id: 'geral', label: 'Visão Geral', content: <p>Conteúdo geral.</p> },
  {
    id: 'pagamentos',
    label: 'Pagamentos',
    count: 3,
    content: <p>Tabela de pagamentos.</p>,
  },
  {
    id: 'beneficio',
    label: 'Benefício',
    count: 1,
    content: <p>Tabela de uso do benefício.</p>,
  },
  { id: 'eventos', label: 'Eventos', count: 12, content: <p>Eventos.</p> },
];

export const Default: Story = {
  name: 'Default · com counts',
  args: { tabs: sampleTabs },
};

export const SemCounts: Story = {
  name: 'Sem counts',
  args: {
    tabs: sampleTabs.map((t) => ({ ...t, count: undefined })),
  },
};

export const SemEventos: Story = {
  name: 'Atendente · sem aba de eventos',
  args: {
    tabs: sampleTabs.filter((t) => t.id !== 'eventos'),
  },
};

export const Empty: Story = {
  name: 'Counts zero',
  args: {
    tabs: sampleTabs.map((t) => ({
      ...t,
      count: t.count !== undefined ? 0 : undefined,
    })),
  },
};
