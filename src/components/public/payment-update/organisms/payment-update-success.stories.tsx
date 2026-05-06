/**
 * Storybook stories for PaymentUpdateSuccess organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 *
 * The component covers 3 of the 4 backend outcomes — `charge_failed` is
 * intentionally NOT a success state: it stays inline on the form so the
 * customer can try another card with the same (still-active) token.
 * See `payment-update-form.stories.tsx` for the failed-charge variant.
 */

import type React from 'react';
import {
  PaymentUpdateSuccess,
  type PaymentUpdateSuccessOutcome,
} from './payment-update-success';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'public/payment-update/Organisms/PaymentUpdateSuccess',
  component: PaymentUpdateSuccess,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Tela de confirmação exibida após o consumo bem-sucedido do token. ' +
          'A mensagem varia conforme o `outcome` retornado pelo backend: ' +
          '`card_updated_no_charge` (apenas atualização), `charge_paid` (retry aprovado) e ' +
          '`charge_pending` (retry em processamento). O outcome `charge_failed` ' +
          'NÃO é representado aqui — fica inline no formulário para nova tentativa.',
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story type helper (minimal — no @storybook/react dependency)
// ---------------------------------------------------------------------------

type Story = {
  render?: (args: React.ComponentProps<typeof PaymentUpdateSuccess>) => React.ReactElement;
  args?: { outcome: PaymentUpdateSuccessOutcome };
  name?: string;
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Cartão atualizado sem cobrança — plano ativo/carência */
export const CardUpdatedNoCharge: Story = {
  name: 'Cartão atualizado (sem cobrança)',
  args: {
    outcome: 'card_updated_no_charge',
  },
};

/** Cobrança aprovada — plano pendente/inadimplente, retry paid */
export const ChargePaid: Story = {
  name: 'Pagamento aprovado',
  args: {
    outcome: 'charge_paid',
  },
};

/** Cobrança em processamento — plano pendente/inadimplente, retry pending */
export const ChargePending: Story = {
  name: 'Pagamento em processamento',
  args: {
    outcome: 'charge_pending',
  },
};
