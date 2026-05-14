/**
 * Storybook stories for ContractOtpPanel organism.
 *
 * NOTE: Storybook is not yet configured in this project; these stories
 * follow the CSF (Component Story Format) convention and will be picked
 * up automatically once Storybook is installed.
 *
 * Each story documents one of the states the overlay can be in during
 * the OTP flow, so designers/QA can review them in isolation.
 */

import type React from 'react';
import { ContractOtpPanel } from './contract-otp-panel';
import type { ContractOtpPanelProps } from './contract-otp-panel';

const meta = {
  title: 'public/contratar/organisms/ContractOtpPanel',
  component: ContractOtpPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = {
  render?: (args: ContractOtpPanelProps) => React.ReactElement;
  args?: Partial<ContractOtpPanelProps>;
  name?: string;
};

const noopSubmit = (): Promise<void> => Promise.resolve();
const noopResend = (): Promise<void> => Promise.resolve();

/** Estado inicial — código recém-enviado, contador zerado para reenvio. */
export const Idle: Story = {
  name: 'Idle (código enviado)',
  args: {
    phoneMasked: '(11) 9****-4321',
    cooldownSeconds: 0,
    onSubmit: noopSubmit,
    onResend: noopResend,
  },
};

/** Cooldown ativo — botão "Reenviar" mostra contador regressivo. */
export const Sent: Story = {
  name: 'Cooldown ativo (45s)',
  args: {
    phoneMasked: '(11) 9****-4321',
    cooldownSeconds: 45,
    onSubmit: noopSubmit,
    onResend: noopResend,
  },
};

/** Estado de envio — chamando POST /v1/otp/contract/request. */
export const Sending: Story = {
  name: 'Sending (request em voo)',
  args: {
    phoneMasked: '(11) 9****-4321',
    cooldownSeconds: 0,
    onSubmit: noopSubmit,
    onResend: noopResend,
    busy: true,
  },
};

/** Estado de verificação — chamando POST /v1/otp/contract/verify. */
export const Verifying: Story = {
  name: 'Verifying (verify em voo)',
  args: {
    phoneMasked: '(11) 9****-4321',
    cooldownSeconds: 60,
    onSubmit: noopSubmit,
    onResend: noopResend,
    busy: true,
  },
};

/** Erro: código incorreto. */
export const ErrorInvalid: Story = {
  name: 'Error — código incorreto',
  args: {
    phoneMasked: '(11) 9****-4321',
    cooldownSeconds: 60,
    onSubmit: noopSubmit,
    onResend: noopResend,
    errorMessage: 'Código incorreto. Verifique e tente novamente.',
  },
};

/** Erro: código expirado. */
export const ErrorExpired: Story = {
  name: 'Error — código expirado',
  args: {
    phoneMasked: '(11) 9****-4321',
    cooldownSeconds: 0,
    onSubmit: noopSubmit,
    onResend: noopResend,
    errorMessage: 'Código expirado. Solicite um novo.',
  },
};

/** Erro: muitas tentativas — OTP bloqueado, usuário deve reenviar. */
export const ErrorLocked: Story = {
  name: 'Error — muitas tentativas (locked)',
  args: {
    phoneMasked: '(11) 9****-4321',
    cooldownSeconds: 0,
    onSubmit: noopSubmit,
    onResend: noopResend,
    errorMessage: 'Muitas tentativas. Solicite um novo código.',
  },
};

/** Erro: provedor SMS indisponível. */
export const ErrorSmsProvider: Story = {
  name: 'Error — SMS provider unavailable',
  args: {
    phoneMasked: '(11) 9****-4321',
    cooldownSeconds: 0,
    onSubmit: noopSubmit,
    onResend: noopResend,
    errorMessage:
      'Não conseguimos enviar o SMS agora. Tente em alguns instantes.',
  },
};

/** Estado de reenvio em curso — botão "Reenviar" também desabilitado. */
export const Resending: Story = {
  name: 'Resending (resend em voo)',
  args: {
    phoneMasked: '(11) 9****-4321',
    cooldownSeconds: 0,
    onSubmit: noopSubmit,
    onResend: noopResend,
    busy: true,
  },
};
