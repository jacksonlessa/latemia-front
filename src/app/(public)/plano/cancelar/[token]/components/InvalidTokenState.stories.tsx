/**
 * Storybook stories for the InvalidTokenState atom.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 *
 * InvalidTokenState is a pure presentational component — each story maps
 * directly to one of its three `reason` variants.
 */

import type React from 'react';
import { InvalidTokenState } from './InvalidTokenState';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Public/Plano/Cancelar/InvalidTokenState',
  component: InvalidTokenState,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Exibido quando o token de cancelamento é inválido, expirado ou já utilizado. ' +
          'Cada variante de `reason` apresenta ícone, título e mensagem distintos ' +
          'para que o cliente entenda o que ocorreu.',
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story type helper (minimal — no @storybook/react dependency)
// ---------------------------------------------------------------------------

type Story = {
  render?: (args: React.ComponentProps<typeof InvalidTokenState>) => React.ReactElement;
  args?: Partial<React.ComponentProps<typeof InvalidTokenState>>;
  name?: string;
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Link expirado — ícone de relógio âmbar, link para WhatsApp do suporte. */
export const Expired: Story = {
  name: 'Expirado',
  args: {
    reason: 'expired',
  },
};

/** Link já utilizado — ícone de check verde, mensagem de confirmação. */
export const Used: Story = {
  name: 'Já utilizado',
  args: {
    reason: 'used',
  },
};

/** Link inválido / não encontrado — ícone de alerta âmbar. */
export const NotFound: Story = {
  name: 'Inválido (não encontrado)',
  args: {
    reason: 'not_found',
  },
};
