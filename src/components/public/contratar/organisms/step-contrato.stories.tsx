/**
 * Storybook stories for StepContrato organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { StepContrato } from './step-contrato';
import type { StepContratoProps } from './step-contrato';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'public/contratar/organisms/StepContrato',
  component: StepContrato,
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
  render?: (args: StepContratoProps) => React.ReactElement;
  args?: Partial<StepContratoProps>;
  name?: string;
  parameters?: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// Shared handlers
// ---------------------------------------------------------------------------

const noop = (): void => {};
const noopAssign = (_: string): void => {};
const noopVerified = (_: string): void => {};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Estado inicial — checkbox desmarcado, botão "Avançar" desabilitado */
export const Default: Story = {
  name: 'Padrão (aceite pendente)',
  args: {
    accepted: false,
    onAcceptedChange: noop,
    onNext: noop,
    onBack: noop,
  },
};

/** Contrato aceito — botão "Avançar" habilitado */
export const Aceito: Story = {
  name: 'Aceite marcado',
  args: {
    accepted: true,
    onAcceptedChange: noop,
    onNext: noop,
    onBack: noop,
  },
};

/**
 * Flag de OTP habilitada — ao clicar "Avançar" o overlay `ContractOtpPanel`
 * é renderizado após o backend retornar o `phoneMasked`. Para reproduzir o
 * estado em Storybook, mock `RequestContractOtpUseCase.execute` em
 * `.storybook/preview.ts`.
 */
export const OtpEnabled: Story = {
  name: 'OTP habilitado (após Avançar → overlay)',
  args: {
    accepted: true,
    onAcceptedChange: noop,
    onNext: noop,
    onBack: noop,
    otpEnabled: true,
    phone: '+5511987654321',
    contractAttemptId: null,
    onContractAttemptIdAssigned: noopAssign,
    onVerified: noopVerified,
  },
};

/**
 * Estado intermediário — `RequestContractOtpUseCase` em voo. O botão
 * "Avançar" mostra "Enviando código…" e fica desabilitado.
 *
 * Para reproduzir: mock `RequestContractOtpUseCase.execute` com
 * `new Promise(() => {})` (nunca resolve) e clique em "Avançar".
 */
export const OtpEnabledSending: Story = {
  name: 'OTP habilitado — Enviando código',
  parameters: {
    docs: {
      description: {
        story:
          'Mock `RequestContractOtpUseCase.execute` para nunca resolver e ' +
          'clique em "Avançar". O botão deve exibir "Enviando código…" e ficar ' +
          'desabilitado.',
      },
    },
  },
  args: {
    accepted: true,
    onAcceptedChange: noop,
    onNext: noop,
    onBack: noop,
    otpEnabled: true,
    phone: '+5511987654321',
    contractAttemptId: null,
    onContractAttemptIdAssigned: noopAssign,
    onVerified: noopVerified,
  },
};

/**
 * OTP habilitado com erro — `RequestContractOtpUseCase.execute` rejeita
 * com `ValidationError` (ex.: SMS provider unavailable). A mensagem
 * aparece como `role="alert"` acima do bloco de navegação.
 *
 * Para reproduzir: mock `RequestContractOtpUseCase.execute` para lançar
 * `new ValidationError({ _form: "Não conseguimos enviar...", _code: "SMS_PROVIDER_UNAVAILABLE" })`.
 */
export const OtpEnabledError: Story = {
  name: 'OTP habilitado — Erro no request',
  parameters: {
    docs: {
      description: {
        story:
          'Mock `RequestContractOtpUseCase.execute` para rejeitar com ' +
          '`new ValidationError({ _form: "Não conseguimos enviar o SMS agora. ' +
          'Tente em alguns instantes.", _code: "SMS_PROVIDER_UNAVAILABLE" })`.',
      },
    },
  },
  args: {
    accepted: true,
    onAcceptedChange: noop,
    onNext: noop,
    onBack: noop,
    otpEnabled: true,
    phone: '+5511987654321',
    contractAttemptId: null,
    onContractAttemptIdAssigned: noopAssign,
    onVerified: noopVerified,
  },
};
