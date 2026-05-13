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
};

// ---------------------------------------------------------------------------
// Shared handlers
// ---------------------------------------------------------------------------

const noop = () => {};

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
 * Flag de OTP habilitada — Task 9.0 apenas declara e propaga a prop;
 * o overlay efetivo é implementado na Task 10.0. Até lá, o comportamento
 * visual permanece idêntico ao estado `Aceito`.
 */
export const OtpEnabled: Story = {
  name: 'OTP habilitado (Task 10.0)',
  args: {
    accepted: true,
    onAcceptedChange: noop,
    onNext: noop,
    onBack: noop,
    otpEnabled: true,
  },
};
