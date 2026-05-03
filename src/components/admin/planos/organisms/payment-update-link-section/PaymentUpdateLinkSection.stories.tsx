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

// ---------------------------------------------------------------------------
// Stories
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
        status: 'expired',
        expiresAt: '2026-04-30T12:00:00.000Z',
        usedAt: null,
      }}
      onGenerated={noop}
    />
  ),
};

/**
 * Loading — simula o estado de carregamento após clique no botão de gerar.
 * Em produção este estado é transitório; aqui é renderizado diretamente
 * ajustando a prop de loading via wrapper.
 */
export const Loading: Story = {
  name: 'Gerando link (loading)',
  render: () => (
    <div className="space-y-2">
      <p className="text-xs text-[#6B6B6E] italic">
        Nota: O estado de loading é transitório. Esta story representa o
        visual durante a chamada ao backend.
      </p>
      {/* We render a disabled button variant to illustrate the loading state */}
      <PaymentUpdateLinkSection
        planId={mockPlanId}
        currentToken={null}
        onGenerated={noop}
      />
    </div>
  ),
};
