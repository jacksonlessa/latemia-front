/**
 * Storybook stories for PlanDialog organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow CSF and will be picked up once Storybook is installed.
 *
 * The network calls in Create/Edit stories will fail in Storybook (no backend),
 * which is the expected behavior. Use the Error variant to preview error states.
 */

import type React from 'react';
import { useState } from 'react';
import { PlanDialog } from './PlanDialog';

const meta = {
  title: 'Admin - Planos de Assinatura/Organisms/PlanDialog',
  component: PlanDialog,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;

type Story = {
  render?: () => React.ReactElement;
  name?: string;
};

/** Dialog de criação */
export const Create: Story = {
  name: 'Criar Plano',
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div>
        <button onClick={() => setOpen(true)} className="rounded border px-3 py-1 text-sm">
          Abrir dialog
        </button>
        <PlanDialog
          mode="create"
          open={open}
          onClose={() => setOpen(false)}
          onSuccess={() => alert('Plano criado!')}
          onCreatePlan={async () => ({ ok: false, message: 'Mock: sem backend no Storybook' })}
          onUpdatePlan={async () => ({ ok: false, message: 'Mock: sem backend no Storybook' })}
        />
      </div>
    );
  },
};

/** Dialog de edição */
export const Edit: Story = {
  name: 'Editar Plano',
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div>
        <button onClick={() => setOpen(true)} className="rounded border px-3 py-1 text-sm">
          Abrir dialog
        </button>
        <PlanDialog
          mode="edit"
          planId="plan_001"
          open={open}
          onClose={() => setOpen(false)}
          onSuccess={() => alert('Plano atualizado!')}
          onFetchPlan={async () => ({ ok: false, message: 'Mock: sem backend no Storybook' })}
          onCreatePlan={async () => ({ ok: false, message: 'Mock: sem backend no Storybook' })}
          onUpdatePlan={async () => ({ ok: false, message: 'Mock: sem backend no Storybook' })}
        />
      </div>
    );
  },
};

/** Dialog fechado */
export const Closed: Story = {
  name: 'Fechado',
  render: () => (
    <PlanDialog
      mode="create"
      open={false}
      onClose={() => undefined}
      onSuccess={() => undefined}
      onCreatePlan={async () => ({ ok: false })}
      onUpdatePlan={async () => ({ ok: false })}
    />
  ),
};
