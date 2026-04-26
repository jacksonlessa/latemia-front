/**
 * Storybook stories for PlanPaymentsList organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { PlanPaymentsList } from './PlanPaymentsList';
import type { Payment } from '@/lib/types/plan';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Admin - Planos/Organisms/PlanPaymentsList',
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
// Mock data — no real personal data
// ---------------------------------------------------------------------------

const mockPayments: Payment[] = [
  {
    id: 'payment-uuid-1',
    status: 'pendente',
    amount: 4990,
    createdAt: '2026-04-01T10:00:00.000Z',
  },
  {
    id: 'payment-uuid-2',
    status: 'pago',
    amount: 4990,
    createdAt: '2026-03-01T10:00:00.000Z',
    paidAt: '2026-03-05T14:30:00.000Z',
  },
  {
    id: 'payment-uuid-3',
    status: 'cancelado',
    amount: 4990,
    createdAt: '2026-02-01T10:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Lista com múltiplos pagamentos */
export const Default: Story = {
  name: 'Com pagamentos',
  render: () => <PlanPaymentsList payments={mockPayments} />,
};

/** Apenas pagamento pendente */
export const ApenasUm: Story = {
  name: 'Pagamento único pendente',
  render: () => <PlanPaymentsList payments={[mockPayments[0]]} />,
};

/** Estado vazio — nenhum pagamento */
export const Vazio: Story = {
  name: 'Sem pagamentos (estado vazio)',
  render: () => <PlanPaymentsList payments={[]} />,
};

/** Lista com falha de cobrança e refund — colunas opcionais aparecem */
export const ComFalhaERefund: Story = {
  name: 'Com falha e estorno',
  render: () => (
    <PlanPaymentsList
      payments={[
        {
          id: 'payment-uuid-4',
          status: 'inadimplente',
          amount: 4990,
          createdAt: '2026-04-10T10:00:00.000Z',
          failureCode: 'card_declined',
        },
        {
          id: 'payment-uuid-5',
          status: 'estornado',
          amount: 4990,
          createdAt: '2026-03-01T10:00:00.000Z',
          paidAt: '2026-03-05T14:30:00.000Z',
          refundedAt: '2026-04-12T09:00:00.000Z',
        },
      ]}
    />
  ),
};
