/**
 * Storybook stories for the CancellationSuccess atom.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 *
 * CancellationSuccess is a pure presentational component with two visual
 * variants depending on whether `coveredUntil` is provided.
 */

import type React from 'react';
import { CancellationSuccess } from './CancellationSuccess';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Public/Plano/Cancelar/CancellationSuccess',
  component: CancellationSuccess,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Tela de confirmação exibida após o cancelamento bem-sucedido do plano. ' +
          'Quando `coveredUntil` é informado, exibe a data de fim de cobertura ' +
          'formatada em português. Quando omitido, exibe apenas a mensagem de confirmação.',
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story type helper (minimal — no @storybook/react dependency)
// ---------------------------------------------------------------------------

type Story = {
  render?: (args: React.ComponentProps<typeof CancellationSuccess>) => React.ReactElement;
  args?: Partial<React.ComponentProps<typeof CancellationSuccess>>;
  name?: string;
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Cancelamento confirmado com data de fim de cobertura exibida. */
export const WithCoveredUntil: Story = {
  name: 'Com data de cobertura',
  args: {
    coveredUntil: '2025-08-31T23:59:59Z',
  },
};

/**
 * Cancelamento confirmado sem data de cobertura —
 * ocorre quando o plano nunca foi pago (ex.: status `pendente`).
 */
export const WithoutCoveredUntil: Story = {
  name: 'Sem data de cobertura',
  args: {
    coveredUntil: null,
  },
};
