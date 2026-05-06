/**
 * Storybook stories for FormSection molecule.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow CSF and will be picked up once Storybook is installed.
 */

import type React from 'react';
import { FormSection } from './FormSection';

const meta = {
  title: 'Admin - Planos de Assinatura/Molecules/FormSection',
  component: FormSection,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

type Story = {
  render?: () => React.ReactElement;
  name?: string;
};

/** Seção aberta por padrão */
export const DefaultOpen: Story = {
  name: 'Aberta',
  render: () => (
    <FormSection title="Informações Básicas" description="Nome e configurações gerais do plano" defaultOpen>
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Conteúdo da seção aqui...</p>
      </div>
    </FormSection>
  ),
};

/** Seção fechada por padrão */
export const DefaultClosed: Story = {
  name: 'Fechada',
  render: () => (
    <FormSection title="Opções Avançadas" description="Ciclos, tentativas e metadados" defaultOpen={false}>
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Conteúdo avançado aqui...</p>
      </div>
    </FormSection>
  ),
};

/** Múltiplas seções empilhadas */
export const MultipleSections: Story = {
  name: 'Múltiplas Seções',
  render: () => (
    <div className="space-y-3">
      <FormSection title="Básico" defaultOpen>
        <p className="text-sm text-muted-foreground">Configurações básicas do plano.</p>
      </FormSection>
      <FormSection title="Precificação" defaultOpen={false}>
        <p className="text-sm text-muted-foreground">Itens e valores.</p>
      </FormSection>
      <FormSection title="Avançado" defaultOpen={false}>
        <p className="text-sm text-muted-foreground">Opções avançadas.</p>
      </FormSection>
    </div>
  ),
};

/** Sem descrição */
export const WithoutDescription: Story = {
  name: 'Sem Descrição',
  render: () => (
    <FormSection title="Básico">
      <p className="text-sm text-muted-foreground">Conteúdo sem descrição no cabeçalho.</p>
    </FormSection>
  ),
};
