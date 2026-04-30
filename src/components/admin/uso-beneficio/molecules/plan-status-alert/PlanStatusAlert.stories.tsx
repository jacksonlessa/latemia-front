/**
 * Storybook stories for PlanStatusAlert molecule.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow CSF and will be picked up once Storybook is installed.
 */

import type React from 'react';
import { PlanStatusAlert } from './PlanStatusAlert';
import type { PlanStatus } from '@/lib/types/plan';

const meta = {
  title: 'Admin - Uso do Benefício/Molecules/PlanStatusAlert',
  component: PlanStatusAlert,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

interface PlanStatusAlertProps {
  status: PlanStatus;
  className?: string;
}

type Story = {
  render?: (args: PlanStatusAlertProps) => React.ReactElement | null;
  args?: Partial<PlanStatusAlertProps>;
  name?: string;
};

/** Banner amarelo de carência */
export const Carencia: Story = {
  name: 'Em carência',
  args: { status: 'carencia' },
};

/** Banner vermelho de inadimplência */
export const Inadimplente: Story = {
  name: 'Inadimplente',
  args: { status: 'inadimplente' },
};

/** Não renderiza nada para plano ativo */
export const Ativo: Story = {
  name: 'Ativo (no-op)',
  render: () => (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Para status &quot;ativo&quot; o componente não renderiza nada (retorna null).
      </p>
      <div className="rounded border border-dashed border-gray-200 p-4 text-xs text-gray-500">
        <PlanStatusAlert status="ativo" />
        (vazio)
      </div>
    </div>
  ),
};

/** Todas as variantes empilhadas */
export const AllVariants: Story = {
  name: 'Todas as variantes',
  render: () => (
    <div className="flex flex-col gap-3">
      <PlanStatusAlert status="carencia" />
      <PlanStatusAlert status="inadimplente" />
    </div>
  ),
};
