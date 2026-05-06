/**
 * Storybook stories for StepSucesso organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { StepSucesso } from './step-sucesso';
import type { StepSucessoProps } from './step-sucesso';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'public/contratar/organisms/StepSucesso',
  component: StepSucesso,
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
  render?: (args: StepSucessoProps) => React.ReactElement;
  args?: Partial<StepSucessoProps>;
  name?: string;
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Tela de sucesso com um único pet contratado */
export const Default: Story = {
  name: 'Um pet',
  args: {
    clientName: 'Maria da Silva',
    pets: [{ name: 'Rex', species: 'canino' }],
  },
};

/** Tela de sucesso com múltiplos pets contratados */
export const MultiplosPets: Story = {
  name: 'Múltiplos pets',
  args: {
    clientName: 'João Pereira',
    pets: [
      { name: 'Rex', species: 'canino' },
      { name: 'Mimi', species: 'felino' },
      { name: 'Thor', species: 'canino' },
    ],
  },
};

/** Tela de sucesso sem pets — caso de borda (não deve ocorrer no fluxo normal) */
export const SemPets: Story = {
  name: 'Sem pets (edge case)',
  args: {
    clientName: 'Ana Souza',
    pets: [],
  },
};

/** Tela de sucesso com protocolos de plano exibidos */
export const ComProtocolos: Story = {
  name: 'Com protocolos',
  args: {
    clientName: 'Carlos Lima',
    pets: [
      { name: 'Bolinha', species: 'canino' },
      { name: 'Fifi', species: 'felino' },
    ],
    planIds: [
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    ],
  },
};

/** Tela de sucesso com um único protocolo */
export const ComUmProtocolo: Story = {
  name: 'Com um protocolo',
  args: {
    clientName: 'Maria da Silva',
    pets: [{ name: 'Rex', species: 'canino' }],
    planIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
  },
};
