/**
 * Storybook stories for the PublicCancelPlanForm organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 *
 * Because PublicCancelPlanForm manages internal form state (reason, aware,
 * formState), stories with non-default states use parameter docs to guide
 * manual visual QA.
 */

import type React from 'react';
import type { CancelPlanPreview } from '@/domain/plan/preview-cancel-plan.use-case';
import { PublicCancelPlanForm } from './PublicCancelPlanForm';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const previewWithCoveredUntil: CancelPlanPreview = {
  clientName: 'J*** L***',
  petName: 'Rex',
  planStatus: 'ativo',
  coveredUntil: '2025-08-31T23:59:59Z',
};

const previewNoCoveredUntil: CancelPlanPreview = {
  clientName: 'M*** S***',
  petName: 'Bolinha',
  planStatus: 'carencia',
  coveredUntil: null,
};

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Public/Plano/Cancelar/PublicCancelPlanForm',
  component: PublicCancelPlanForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Organism de autosserviço para cancelamento de plano via link tokenizado. ' +
          'Exibe dados mascarados do plano (LGPD), aviso de irreversibilidade, campo ' +
          'de motivo (mínimo 10 caracteres) e checkbox de ciência antes de confirmar.',
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story type helper (minimal — no @storybook/react dependency)
// ---------------------------------------------------------------------------

type Story = {
  render?: () => React.ReactElement;
  args?: Partial<React.ComponentProps<typeof PublicCancelPlanForm>>;
  name?: string;
  parameters?: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Estado inicial — formulário vazio, botão desabilitado. */
export const Default: Story = {
  name: 'Padrão (idle)',
  args: {
    preview: previewWithCoveredUntil,
    token: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  },
};

/** Dados do plano sem data de cobertura conhecida. */
export const SemCoberturaAte: Story = {
  name: 'Sem data de cobertura',
  args: {
    preview: previewNoCoveredUntil,
    token: 'aaaaaaaa-bbbb-cccc-dddd-ffffffffffff',
  },
};

/**
 * Estado submetendo — botão exibe spinner "Processando…" e campos desabilitados.
 *
 * Para reproduzir: preencha motivo com 10+ caracteres, marque o checkbox
 * e clique "Confirmar cancelamento". Observe o spinner enquanto a requisição
 * está em andamento.
 */
export const Submitting: Story = {
  name: 'Submetendo (loading)',
  parameters: {
    docs: {
      description: {
        story:
          'Para reproduzir: preencha o motivo com 10+ caracteres, marque o checkbox ' +
          'e clique "Confirmar cancelamento". O botão exibe spinner "Processando…" ' +
          'e os campos ficam desabilitados.',
      },
    },
  },
  args: {
    preview: previewWithCoveredUntil,
    token: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  },
};

/**
 * Estado de erro — exibe banner de erro inline acima do formulário.
 *
 * Para reproduzir: configure `cancelPlanWithTokenUseCase` para lançar erro
 * (ex.: PaymentProviderUnavailableError) e confirme o formulário.
 */
export const ErrorState: Story = {
  name: 'Erro (inline)',
  parameters: {
    docs: {
      description: {
        story:
          'Exibe banner de erro inline quando o use case lança exceção. ' +
          'O formulário permanece ativo para nova tentativa. ' +
          'Para reproduzir: simule retorno 503 no endpoint `/v1/plan-cancellation/consume`.',
      },
    },
  },
  args: {
    preview: previewWithCoveredUntil,
    token: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  },
};

/**
 * Estado de sucesso — exibe o componente CancellationSuccess com data de cobertura.
 *
 * Para reproduzir: preencha motivo válido, marque checkbox e confirme.
 * A tela de formulário é substituída pela tela de confirmação de sucesso.
 */
export const SuccessWithCoveredUntil: Story = {
  name: 'Sucesso — com data de cobertura',
  parameters: {
    docs: {
      description: {
        story:
          'Após cancelamento bem-sucedido, o formulário é substituído pela tela ' +
          'CancellationSuccess com a data de fim de cobertura. ' +
          'Para reproduzir: confirme o formulário em ambiente conectado ao backend.',
      },
    },
  },
  args: {
    preview: previewWithCoveredUntil,
    token: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  },
};
