/**
 * Storybook stories for PaymentCardForm molecule.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 *
 * PCI/LGPD note: PAN and CVV are held only in local React state;
 * they are never sent to the LateMia backend. Only the Pagar.me token
 * is forwarded to the parent via onSuccess.
 */

import type React from 'react';
import { PaymentCardForm } from './payment-card-form';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'public/payment-update/Molecules/PaymentCardForm',
  component: PaymentCardForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Formulário de cartão de crédito que tokeniza os dados via Pagar.me. ' +
          'PAN e CVV nunca são enviados ao backend LateMia — apenas o token gerado pelo Pagar.me.',
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story type helper (minimal — no @storybook/react dependency)
// ---------------------------------------------------------------------------

type Story = {
  render?: (args: React.ComponentProps<typeof PaymentCardForm>) => React.ReactElement;
  args?: Partial<React.ComponentProps<typeof PaymentCardForm>>;
  name?: string;
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Estado padrão — formulário habilitado aguardando entrada do usuário */
export const Default: Story = {
  name: 'Padrão',
  args: {
    onSuccess: (token: string) => console.log('Token gerado:', token),
    onError: (message: string) => console.error('Erro:', message),
    disabled: false,
  },
};

/** Estado desabilitado — todos os campos e o botão estão inativados */
export const Disabled: Story = {
  name: 'Desabilitado',
  args: {
    onSuccess: (token: string) => console.log('Token gerado:', token),
    onError: (message: string) => console.error('Erro:', message),
    disabled: true,
  },
};

/** Estado de erro — simula o retorno após falha na tokenização */
export const WithError: Story = {
  name: 'Com erro de tokenização',
  render: () => {
    const onError = (message: string) => console.error('Erro de tokenização:', message);
    // Simula onSuccess nunca chamado (cartão recusado)
    const onSuccess = (_token: string) => {};
    return (
      <div className="space-y-4 max-w-sm">
        <PaymentCardForm onSuccess={onSuccess} onError={onError} />
        <p className="text-sm text-destructive" role="alert">
          Não foi possível validar seu cartão. Verifique os dados e tente novamente.
        </p>
      </div>
    );
  },
};

/** Estado de envio em andamento — simula o botão em "Validando cartão…" */
export const Submitting: Story = {
  name: 'Enviando (submit em andamento)',
  render: () => (
    <div className="max-w-sm">
      <PaymentCardForm
        onSuccess={() => {}}
        disabled={true}
      />
    </div>
  ),
};
