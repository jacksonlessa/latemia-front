/**
 * Storybook stories for PaymentUpdateSuccess organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { PaymentUpdateSuccess } from './payment-update-success';

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
          'Tela de confirmação exibida após a atualização bem-sucedida do cartão de pagamento. ' +
          'A mensagem varia conforme chargesBehavior: "immediate" informa tentativa imediata de cobrança; ' +
          '"next_cycle" informa uso na próxima cobrança.',
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
  args?: Partial<React.ComponentProps<typeof PaymentUpdateSuccess>>;
  name?: string;
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Estado padrão — cartão com cobrança imediata (assinatura inadimplente) */
export const Default: Story = {
  name: 'Padrão (cobrança imediata)',
  args: {
    chargesBehavior: 'immediate',
  },
};

/** Variante de próximo ciclo — cartão será usado na próxima cobrança */
export const NextCycle: Story = {
  name: 'Próximo ciclo',
  args: {
    chargesBehavior: 'next_cycle',
  },
};
