/**
 * Storybook stories for the client-scoped PaymentUpdateLinkSection organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 *
 * Variants required by task 10.9:
 * - no-link          : no token generated yet
 * - active           : token active, shareable URL shown
 * - used             : token already consumed
 * - expired          : token expired
 * - loading          : generation in progress
 * - client-ineligible: client has no subscription or no eligible plans (section not rendered)
 */

import type React from 'react';
import { PaymentUpdateLinkSection } from './payment-update-link-section';
import type { GenerateClientTokenResponse } from '@/domain/client/generate-client-payment-update-token.use-case';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Admin - Clientes/Organisms/PaymentUpdateLinkSection',
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

const mockClientId = 'client-uuid-0001';
const mockPetsCovered = ['Luna', 'Thor', 'Mel'];

function noop(_token: GenerateClientTokenResponse): void {
  // no-op — used in stories where we don't care about the callback
}

// ---------------------------------------------------------------------------
// Stories — Token state variants (component-level)
// ---------------------------------------------------------------------------

/** Nenhum link gerado ainda — exibe apenas o botão de gerar. */
export const NoLink: Story = {
  name: 'Sem link (no-link)',
  render: () => (
    <PaymentUpdateLinkSection
      clientId={mockClientId}
      currentToken={null}
      petsCovered={mockPetsCovered}
      onGenerated={noop}
    />
  ),
};

/** Link ativo — exibe URL + cópia + badge "Ativo até ...". */
export const Active: Story = {
  name: 'Link ativo',
  render: () => (
    <PaymentUpdateLinkSection
      clientId={mockClientId}
      currentToken={{
        token: 'abc123-active-token',
        status: 'active',
        expiresAt: '2026-05-14T12:00:00.000Z',
        usedAt: null,
      }}
      petsCovered={mockPetsCovered}
      onGenerated={noop}
    />
  ),
};

/** Link utilizado — exibe badge "Utilizado em ..." + botão de gerar novo. */
export const Used: Story = {
  name: 'Link utilizado',
  render: () => (
    <PaymentUpdateLinkSection
      clientId={mockClientId}
      currentToken={{
        token: 'def456-used-token',
        status: 'used',
        expiresAt: '2026-05-14T12:00:00.000Z',
        usedAt: '2026-05-08T09:30:00.000Z',
      }}
      petsCovered={mockPetsCovered}
      onGenerated={noop}
    />
  ),
};

/** Link expirado — exibe badge "Expirado" + botão de gerar novo. */
export const Expired: Story = {
  name: 'Link expirado',
  render: () => (
    <PaymentUpdateLinkSection
      clientId={mockClientId}
      currentToken={{
        token: 'ghi789-expired-token',
        status: 'expired',
        expiresAt: '2026-05-01T12:00:00.000Z',
        usedAt: null,
      }}
      petsCovered={mockPetsCovered}
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
      clientId={mockClientId}
      currentToken={null}
      petsCovered={mockPetsCovered}
      onGenerated={noop}
      isLoading={true}
    />
  ),
};

/**
 * Cliente inelegível — demonstra o estado em que a seção NÃO é renderizada.
 *
 * A visibilidade da seção é controlada pelo componente pai com:
 * `{client.pagarmeSubscriptionId && client.paymentUpdateEligible ? <Section /> : null}`
 *
 * Este story simula como o pai gatearia a renderização quando o cliente
 * não tem subscription ativa ou todos os planos estão em status terminal.
 */
export const ClientIneligible: Story = {
  name: 'Cliente inelegível (section oculta)',
  render: () => (
    <div className="space-y-3">
      <p className="text-xs text-[#6B6B6E] rounded-lg border bg-gray-50 px-3 py-2">
        <strong>Estado: cliente sem subscription ativa ou todos os planos terminais.</strong>
        <br />
        A <code>PaymentUpdateLinkSection</code> não é renderizada — o componente pai
        verifica <code>pagarmeSubscriptionId &amp;&amp; paymentUpdateEligible</code> antes
        de incluir a seção. Nenhum placeholder é exibido.
      </p>
      {/* Section intentionally omitted — this is the "client-ineligible" state */}
    </div>
  ),
};
