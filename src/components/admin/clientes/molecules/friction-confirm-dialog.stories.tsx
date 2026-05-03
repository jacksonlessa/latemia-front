/**
 * Storybook stories for FrictionConfirmDialog molecule.
 */

import type React from 'react';
import { FrictionConfirmDialog } from './friction-confirm-dialog';

const meta = {
  title: 'Admin - Clientes/Molecules/FrictionConfirmDialog',
  component: FrictionConfirmDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = {
  render?: (args: unknown) => React.ReactElement;
  args?: Record<string, unknown>;
  name?: string;
};

/** Dialog aberto com status carência */
export const Carencia: Story = {
  name: 'Carência (aberto)',
  args: {
    open: true,
    status: 'carencia',
    onOpenChange: () => {},
    onConfirm: () => alert('Confirmado!'),
  },
};

/** Dialog aberto com status inadimplente */
export const Inadimplente: Story = {
  name: 'Inadimplente (aberto)',
  args: {
    open: true,
    status: 'inadimplente',
    onOpenChange: () => {},
    onConfirm: () => alert('Confirmado!'),
  },
};

/** Dialog fechado (para ilustrar o estado closed) */
export const Fechado: Story = {
  name: 'Fechado',
  args: {
    open: false,
    status: 'carencia',
    onOpenChange: () => {},
    onConfirm: () => {},
  },
};
