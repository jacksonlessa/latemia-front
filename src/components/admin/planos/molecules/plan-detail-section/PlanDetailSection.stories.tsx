/**
 * Storybook stories for PlanDetailSection molecule.
 *
 * NOTE: Storybook is not yet configured in this project.
 */

import type React from 'react';
import { PlanDetailSection } from './PlanDetailSection';

const meta = {
  title: 'Admin - Planos/Molecules/PlanDetailSection',
  component: PlanDetailSection,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

interface Args {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

type Story = {
  render?: (args: Args) => React.ReactElement;
  args?: Partial<Args>;
  name?: string;
};

export const Default: Story = {
  name: 'Default',
  args: {
    title: 'Pet',
    children: <p className="text-sm text-[#2C2C2E]">Conteúdo da seção.</p>,
  },
};

export const WithSubtitle: Story = {
  name: 'With subtitle',
  args: {
    title: 'Contrato',
    subtitle: 'Consultado em disputas ou reclamações',
    children: <p className="text-sm text-[#2C2C2E]">Detalhes do contrato.</p>,
  },
};

export const WithAction: Story = {
  name: 'With action',
  args: {
    title: 'Uso do Benefício',
    action: (
      <button
        type="button"
        className="rounded-md bg-[#4E8C75] px-3 py-1.5 text-xs font-medium text-white"
      >
        + Registrar uso
      </button>
    ),
    children: <p className="text-sm text-[#2C2C2E]">Tabela aqui.</p>,
  },
};

export const Empty: Story = {
  name: 'Empty body',
  args: {
    title: 'Sem dados',
    children: (
      <p className="py-6 text-center text-sm text-[#6B6B6E]">
        Nada para exibir ainda.
      </p>
    ),
  },
};
