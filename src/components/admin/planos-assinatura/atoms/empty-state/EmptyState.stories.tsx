/**
 * Storybook stories for EmptyState atom.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow CSF and will be picked up once Storybook is installed.
 */

import type React from 'react';
import { PackageSearch, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'Admin - Planos de Assinatura/Atoms/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

type Story = {
  render?: () => React.ReactElement;
  args?: Partial<EmptyStateProps>;
  name?: string;
};

/** Estado vazio padrão sem ícone nem ação */
export const Default: Story = {
  name: 'Default',
  args: {
    title: 'Nenhum plano encontrado',
    description: 'Não há planos de assinatura cadastrados no momento.',
  },
};

/** Estado vazio com ícone */
export const WithIcon: Story = {
  name: 'Com ícone',
  args: {
    icon: <PackageSearch size={48} />,
    title: 'Nenhum plano encontrado',
    description: 'Não há planos de assinatura cadastrados no momento.',
  },
};

/** Estado vazio com botão de ação */
export const WithAction: Story = {
  name: 'Com ação',
  render: () => (
    <EmptyState
      icon={<PackageSearch size={48} />}
      title="Nenhum plano encontrado"
      description="Crie o primeiro plano de assinatura para disponibilizá-lo aos clientes."
    >
      <Button>
        <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
        Novo plano
      </Button>
    </EmptyState>
  ),
};

/** Estado vazio sem ícone, apenas texto e ação */
export const WithActionNoIcon: Story = {
  name: 'Com ação sem ícone',
  render: () => (
    <EmptyState
      title="Sem resultados"
      description="Nenhum plano corresponde ao filtro aplicado. Tente ajustar os critérios de busca."
    >
      <Button variant="outline">Limpar filtros</Button>
    </EmptyState>
  ),
};

/** Estado vazio com className customizado */
export const CustomClassName: Story = {
  name: 'Custom className',
  args: {
    icon: <PackageSearch size={48} />,
    title: 'Nenhum resultado',
    description: 'Tente ajustar os filtros de busca.',
    className: 'py-8 bg-gray-50 rounded-xl',
  },
};
