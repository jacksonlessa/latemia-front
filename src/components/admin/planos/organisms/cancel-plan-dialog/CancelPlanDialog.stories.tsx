/**
 * Storybook stories for the CancelPlanDialog organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 *
 * Because CancelPlanDialog is fully stateful (reason, acknowledged, submitting,
 * errorMessage are all internal useState), stories that demonstrate non-default
 * internal states use render functions with parameter docs describing how to
 * reproduce them manually during visual QA.
 */

import type React from 'react';
import { CancelPlanDialog } from './CancelPlanDialog';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Admin/Planos/Organisms/CancelPlanDialog',
  component: CancelPlanDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Organism de confirmação dupla para cancelamento de plano no painel admin. ' +
          'Requer motivo (mínimo 10 caracteres) e checkbox de ciência antes de habilitar o botão confirmar.',
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story type helper (minimal — no @storybook/react dependency)
// ---------------------------------------------------------------------------

type Story = {
  render?: (args: React.ComponentProps<typeof CancelPlanDialog>) => React.ReactElement;
  args?: Partial<React.ComponentProps<typeof CancelPlanDialog>>;
  name?: string;
  parameters?: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Dialog fechado — estado padrão. Nenhum conteúdo visível. */
export const Default: Story = {
  name: 'Default (fechado)',
  args: {
    open: false,
    onOpenChange: () => {},
    onSuccess: () => {},
    planId: 'plan-uuid-123',
    coveredUntil: '2025-08-31T23:59:59Z',
  },
};

/**
 * Dialog aberto, campos vazios — botão "Cancelar plano" desabilitado.
 * Motivo vazio e checkbox desmarcado.
 */
export const OpenedEmpty: Story = {
  name: 'Aberto — vazio (botão disabled)',
  args: {
    open: true,
    onOpenChange: () => {},
    onSuccess: () => {},
    planId: 'plan-uuid-123',
    coveredUntil: '2025-08-31T23:59:59Z',
  },
};

/**
 * Dialog aberto sem data de cobertura — exibe frase genérica.
 */
export const OpenedNoCoveredUntil: Story = {
  name: 'Aberto — sem data de cobertura',
  args: {
    open: true,
    onOpenChange: () => {},
    onSuccess: () => {},
    planId: 'plan-uuid-456',
    coveredUntil: null,
  },
};

/**
 * Dialog aberto com motivo válido (≥ 10 chars) e checkbox marcado.
 * Botão "Cancelar plano" habilitado.
 *
 * Para reproduzir manualmente: abrir a variante OpenedEmpty, digitar ao menos
 * 10 caracteres no campo de motivo e marcar o checkbox de ciência.
 */
export const OpenedValid: Story = {
  name: 'Aberto — válido (botão habilitado)',
  parameters: {
    docs: {
      description: {
        story:
          'Para reproduzir: use a variante "Aberto — vazio", preencha o campo ' +
          '"Motivo" com 10+ caracteres e marque o checkbox de ciência. ' +
          'O botão "Cancelar plano" deve ficar habilitado.',
      },
    },
  },
  args: {
    open: true,
    onOpenChange: () => {},
    onSuccess: () => {},
    planId: 'plan-uuid-123',
    coveredUntil: '2025-08-31T23:59:59Z',
  },
};

/**
 * Estado de submitting — botão exibe spinner "Cancelando…" e campos desabilitados.
 *
 * Para reproduzir manualmente: preencha motivo válido, marque checkbox,
 * clique "Cancelar plano" e observe o estado enquanto a requisição está em andamento.
 */
export const Submitting: Story = {
  name: 'Submetendo (loading)',
  parameters: {
    docs: {
      description: {
        story:
          'Para reproduzir: preencha motivo com 10+ caracteres, marque o checkbox, ' +
          'e clique "Cancelar plano". O botão exibe spinner "Cancelando…" enquanto ' +
          'aguarda resposta do servidor.',
      },
    },
  },
  args: {
    open: true,
    onOpenChange: () => {},
    onSuccess: () => {},
    planId: 'plan-uuid-123',
    coveredUntil: '2025-08-31T23:59:59Z',
  },
};

/**
 * Erro 503 — provedor de pagamento indisponível.
 * Mensagem inline: "Provedor de pagamento indisponível, tente novamente em instantes."
 *
 * Para reproduzir: configure o Route Handler para retornar 503 e tente confirmar.
 */
export const ErrorProviderUnavailable: Story = {
  name: 'Erro — provedor indisponível (503)',
  parameters: {
    docs: {
      description: {
        story:
          'Exibe mensagem inline de erro quando o provedor de pagamento (Pagar.me) ' +
          'está indisponível (HTTP 503 / PaymentProviderUnavailableError). ' +
          'Para reproduzir: simule retorno 503 no Route Handler e confirme o cancelamento.',
      },
    },
  },
  args: {
    open: true,
    onOpenChange: () => {},
    onSuccess: () => {},
    planId: 'plan-uuid-123',
    coveredUntil: '2025-08-31T23:59:59Z',
  },
};

/**
 * Erro 409 — plano já cancelado.
 * Mensagem inline: "Este plano já foi cancelado."
 * Após exibir a mensagem por 1,5 s o dialog fecha e onSuccess é chamado.
 *
 * Para reproduzir: configure o Route Handler para retornar 409 e tente confirmar.
 */
export const ErrorAlreadyCancelled: Story = {
  name: 'Erro — plano já cancelado (409)',
  parameters: {
    docs: {
      description: {
        story:
          'Exibe mensagem inline "Este plano já foi cancelado." quando o servidor ' +
          'retorna HTTP 409 / PlanAlreadyCancelledError. ' +
          'Após 1,5 s o dialog fecha automaticamente e onSuccess é chamado para ' +
          'que a UI reflita o status terminal. ' +
          'Para reproduzir: simule retorno 409 no Route Handler e confirme o cancelamento.',
      },
    },
  },
  args: {
    open: true,
    onOpenChange: () => {},
    onSuccess: () => {},
    planId: 'plan-uuid-123',
    coveredUntil: '2025-08-31T23:59:59Z',
  },
};
