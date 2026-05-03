/**
 * Storybook stories for PaymentUpdateInvalid organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 *
 * Security note: this screen is intentionally generic and does not distinguish
 * between invalid, expired, and already-used tokens to prevent token enumeration.
 */

import type React from 'react';
import { PaymentUpdateInvalid } from './payment-update-invalid';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'public/payment-update/Organisms/PaymentUpdateInvalid',
  component: PaymentUpdateInvalid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Tela informativa exibida quando o token de atualização de pagamento é inválido, ' +
          'expirado ou já utilizado. A mensagem é intencionalmente genérica para evitar ' +
          'enumeração de tokens.',
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

/** Estado padrão — link indisponível (sem props variantes pois o componente não tem props) */
export const Default: Story = {
  name: 'Padrão (link indisponível)',
  render: () => <PaymentUpdateInvalid />,
};
