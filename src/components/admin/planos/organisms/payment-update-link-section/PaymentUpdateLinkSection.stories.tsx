/**
 * Storybook stories for PaymentUpdateLinkSection organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { PaymentUpdateLinkSection } from './PaymentUpdateLinkSection';
import type { GenerateTokenResponse } from '@/domain/plan/generate-payment-update-link.use-case';
import { canGeneratePaymentUpdateLink } from '@/lib/plans/eligibility';
import type { PlanStatus } from '@/lib/types/plan';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Admin - Planos/Organisms/PaymentUpdateLinkSection',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story type helper (minimal — no @storybook/react dependency)
// ---------------------------------------------------------------------------

type Story = {
  render?: () => React.ReactElement;
  name?: string;
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockPlanId = 'plan-uuid-0001';

function noop(_token: GenerateTokenResponse): void {
  // no-op — used in stories where we don't care about the callback
}

/**
 * Reproduces the parent-page gating used in `PlanDetailPageClient`:
 * the section is rendered only when the plan status is in the
 * `PAYMENT_UPDATE_ELIGIBLE_STATUSES` allow-list, otherwise nothing is
 * rendered (no placeholder).
 */
function GatedByStatus({ status }: { status: PlanStatus }): React.ReactElement {
  return (
    <div className="space-y-3">
      <p className="text-xs text-[#6B6B6E]">
        Status do plano: <span className="font-mono">{status}</span> —{' '}
        {canGeneratePaymentUpdateLink(status)
          ? 'visível (elegível)'
          : 'oculta (status terminal)'}
      </p>
      {canGeneratePaymentUpdateLink(status) ? (
        <PaymentUpdateLinkSection
          planId={mockPlanId}
          currentToken={null}
          onGenerated={noop}
        />
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stories — Token state (component-level)
// ---------------------------------------------------------------------------

/** Nenhum link gerado ainda — exibe apenas o botão de gerar */
export const NoLink: Story = {
  name: 'Sem link (no-link)',
  render: () => (
    <PaymentUpdateLinkSection
      planId={mockPlanId}
      currentToken={null}
      onGenerated={noop}
    />
  ),
};

/** Link ativo — exibe URL + cópia + badge "Ativo até ..." */
export const Active: Story = {
  name: 'Link ativo',
  render: () => (
    <PaymentUpdateLinkSection
      planId={mockPlanId}
      currentToken={{
        token: 'abc123-active-token',
        status: 'active',
        expiresAt: '2026-05-10T12:00:00.000Z',
        usedAt: null,
      }}
      onGenerated={noop}
    />
  ),
};

/** Link utilizado — exibe badge "Utilizado em ..." + botão de gerar novo */
export const Used: Story = {
  name: 'Link utilizado',
  render: () => (
    <PaymentUpdateLinkSection
      planId={mockPlanId}
      currentToken={{
        token: 'def456-used-token',
        status: 'used',
        expiresAt: '2026-05-10T12:00:00.000Z',
        usedAt: '2026-05-04T09:30:00.000Z',
      }}
      onGenerated={noop}
    />
  ),
};

/** Link expirado — exibe badge "Expirado" + botão de gerar novo */
export const Expired: Story = {
  name: 'Link expirado',
  render: () => (
    <PaymentUpdateLinkSection
      planId={mockPlanId}
      currentToken={{
        token: 'ghi789-expired-token',
        status: 'expired',
        expiresAt: '2026-04-30T12:00:00.000Z',
        usedAt: null,
      }}
      onGenerated={noop}
    />
  ),
};

/**
 * Loading — demonstra o botão no estado de carregamento ("Gerando...").
 * Usa a prop `isLoading` para forçar o estado visual permanentemente,
 * sem necessidade de simular uma ação assíncrona.
 */
export const Loading: Story = {
  name: 'Gerando link (loading)',
  render: () => (
    <PaymentUpdateLinkSection
      planId={mockPlanId}
      currentToken={null}
      onGenerated={noop}
      isLoading={true}
    />
  ),
};

// ---------------------------------------------------------------------------
// Stories — Visibility by plan status (page-level gating)
// ---------------------------------------------------------------------------

/** Plano ativo — seção visível, cliente pediu troca preventiva de cartão. */
export const VisibleStatusAtivo: Story = {
  name: 'Visível · status ativo',
  render: () => <GatedByStatus status="ativo" />,
};

/** Plano em carência — seção visível, primeiros 6 meses pós-contratação. */
export const VisibleStatusCarencia: Story = {
  name: 'Visível · status carência',
  render: () => <GatedByStatus status="carencia" />,
};

/** Plano pendente — primeira cobrança ainda não confirmada; seção visível. */
export const VisibleStatusPendente: Story = {
  name: 'Visível · status pendente',
  render: () => <GatedByStatus status="pendente" />,
};

/** Plano inadimplente — caso histórico; seção segue visível. */
export const VisibleStatusInadimplente: Story = {
  name: 'Visível · status inadimplente',
  render: () => <GatedByStatus status="inadimplente" />,
};

/**
 * Plano cancelado — status terminal; a seção não é renderizada (sem
 * placeholder), apenas a linha de contexto demonstrando o gating.
 */
export const HiddenStatusCancelado: Story = {
  name: 'Oculta · status cancelado',
  render: () => <GatedByStatus status="cancelado" />,
};
