/**
 * Storybook stories for the HistoricoAlteracoesTable organism.
 *
 * NOTE: Storybook is not yet configured in this project — these stories
 * follow the CSF convention and will be picked up automatically once
 * Storybook is installed.
 */

import type React from 'react';

import type { AlteracaoClubeVantagens } from '@/domain/clube-vantagens/types';
import { HistoricoAlteracoesTable } from './HistoricoAlteracoesTable';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Admin/ClubeVantagens/Organisms/HistoricoAlteracoesTable',
  component: HistoricoAlteracoesTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Organism do painel admin que renderiza o histórico de alterações da ' +
          'Tabela do Clube de Vantagens. Componente puramente apresentacional — ' +
          'a busca dos dados é responsabilidade do orchestrator.',
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story type helper
// ---------------------------------------------------------------------------

type Story = {
  render?: (
    args: React.ComponentProps<typeof HistoricoAlteracoesTable>,
  ) => React.ReactElement;
  args?: Partial<React.ComponentProps<typeof HistoricoAlteracoesTable>>;
  name?: string;
  parameters?: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const sampleItems: AlteracaoClubeVantagens[] = [
  {
    id: 'cv_alt_001',
    versionFrom: 'v1.1',
    versionTo: 'v1.2',
    effectiveDate: '2026-08-01T00:00:00.000Z',
    tipoMudanca: 'reducao_ou_exclusao',
    resumoAlteracoes:
      'Redução do desconto em cirurgias eletivas de 10% para 8%.',
    dispatchedBy: 'usr_admin_jackson',
    dispatchedAt: '2026-06-30T14:23:00.000Z',
    totalClientesAlvo: 87,
    notificacoesEnviadas: 85,
    notificacoesFalhas: 2,
  },
  {
    id: 'cv_alt_000',
    versionFrom: 'v1.0',
    versionTo: 'v1.1',
    effectiveDate: '2026-06-15T00:00:00.000Z',
    tipoMudanca: 'inclusao_ou_aumento',
    resumoAlteracoes: 'Inclusão de desconto de 5% em vacinação eletiva.',
    dispatchedBy: 'usr_admin_jackson',
    dispatchedAt: '2026-05-16T10:08:00.000Z',
    totalClientesAlvo: 72,
    notificacoesEnviadas: 72,
    notificacoesFalhas: 0,
  },
];

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Estado padrão com algumas alterações já registradas. */
export const Default: Story = {
  name: 'Default (com itens)',
  args: {
    items: sampleItems,
    isLoading: false,
    errorMessage: null,
  },
};

/** Estado de loading — exibe spinner enquanto a listagem é buscada. */
export const Loading: Story = {
  name: 'Loading',
  args: {
    items: [],
    isLoading: true,
    errorMessage: null,
  },
};

/** Estado vazio — primeira execução do sistema, nenhuma alteração ainda. */
export const Empty: Story = {
  name: 'Empty (nenhuma alteração registrada)',
  args: {
    items: [],
    isLoading: false,
    errorMessage: null,
  },
};

/** Estado de erro — backend retornou 5xx ou rede caiu. */
export const Error: Story = {
  name: 'Error (falha ao carregar histórico)',
  args: {
    items: [],
    isLoading: false,
    errorMessage:
      'Não foi possível carregar o histórico de alterações. Tente novamente.',
  },
};

/** Variante com apenas inclusão/aumento (estado feliz, zero falhas). */
export const SuccessAllDelivered: Story = {
  name: 'Sucesso — 100% entregues',
  args: {
    items: [
      {
        ...sampleItems[1],
        notificacoesEnviadas: 72,
        notificacoesFalhas: 0,
      },
    ],
    isLoading: false,
    errorMessage: null,
  },
};
