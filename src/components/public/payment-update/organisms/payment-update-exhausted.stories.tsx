/**
 * Storybook stories for PaymentUpdateExhausted organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 *
 * This screen renders when the backend returns `outcome: 'token_exhausted'` —
 * the link reached its failure limit (RF-3.2) and stops accepting new
 * attempts. Intentionally has NO form: insisting with the same link is
 * exactly what the limit is meant to stop.
 */

import type React from 'react';
import { PaymentUpdateExhausted } from './payment-update-exhausted';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'public/payment-update/Organisms/PaymentUpdateExhausted',
  component: PaymentUpdateExhausted,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Tela exibida quando o outcome retornado pelo backend é `token_exhausted` — ' +
          'o link atingiu o limite de falhas de cobrança e deixa de aceitar novas ' +
          'tentativas. Não há formulário: o cliente é orientado a procurar a clínica ' +
          'para receber um link novo.',
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
  name?: string;
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Estado padrão — link esgotado (sem props variantes pois o componente não tem props) */
export const Default: Story = {
  name: 'Padrão (link esgotado)',
  render: () => <PaymentUpdateExhausted />,
};
