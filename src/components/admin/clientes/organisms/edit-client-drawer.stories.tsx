/**
 * Storybook stories for EditClientDrawer organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow CSF 3 and will be picked up once Storybook is installed.
 *
 * The network calls in submit stories will fail in Storybook (no backend) —
 * expected behavior; use the Error variants to preview error states.
 */

import type React from 'react';
import { useState } from 'react';
import { EditClientDrawer } from './edit-client-drawer';
import type { ClientDetail } from '@/lib/types/client';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CLIENT_WITH_ADDRESS: ClientDetail = {
  id: 'client-1',
  name: 'Maria da Silva',
  cpf: '52998224725',
  phone: '47991234567',
  email: 'maria@example.com',
  addresses: [
    {
      id: 'addr-1',
      cep: '88010000',
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 4',
      city: 'Florianópolis',
      state: 'SC',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  ],
  pets: [],
  createdAt: '2024-01-01T00:00:00.000Z',
};

const CLIENT_WITHOUT_ADDRESS: ClientDetail = {
  ...CLIENT_WITH_ADDRESS,
  id: 'client-2',
  addresses: [],
};

const meta = {
  title: 'Admin - Clientes/Organisms/EditClientDrawer',
  component: EditClientDrawer,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = { render?: () => React.ReactElement; name?: string };

// ---------------------------------------------------------------------------
// Default — drawer open with pre-filled data
// ---------------------------------------------------------------------------
export const Default: Story = {
  name: 'Padrão (dados preenchidos)',
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="min-h-screen bg-muted/20 p-8">
        <button
          onClick={() => setOpen(true)}
          className="rounded border px-3 py-1 text-sm"
        >
          Abrir drawer
        </button>
        <EditClientDrawer
          client={CLIENT_WITH_ADDRESS}
          open={open}
          onOpenChange={setOpen}
          onSaved={(updated) => {
            alert(`Salvo: ${updated.name}`);
            setOpen(false);
          }}
        />
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// No address — client without address
// ---------------------------------------------------------------------------
export const WithoutAddress: Story = {
  name: 'Sem endereço cadastrado',
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="min-h-screen bg-muted/20 p-8">
        <EditClientDrawer
          client={CLIENT_WITHOUT_ADDRESS}
          open={open}
          onOpenChange={setOpen}
          onSaved={() => setOpen(false)}
        />
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Closed
// ---------------------------------------------------------------------------
export const Closed: Story = {
  name: 'Fechado',
  render: () => (
    <EditClientDrawer
      client={CLIENT_WITH_ADDRESS}
      open={false}
      onOpenChange={() => undefined}
      onSaved={() => undefined}
    />
  ),
};

// ---------------------------------------------------------------------------
// WithValidationErrors — form open with pre-existing field errors
// Simulates the state after the user submits an invalid form
// ---------------------------------------------------------------------------
export const WithValidationErrors: Story = {
  name: 'Com erros de validação',
  render: () => {
    const [open, setOpen] = useState(true);
    // Use a client with an invalid state to trigger validation errors on submit
    const clientWithBadData: ClientDetail = {
      ...CLIENT_WITH_ADDRESS,
      name: '',
      email: 'invalid-email',
      addresses: [
        {
          ...CLIENT_WITH_ADDRESS.addresses[0],
          state: 'INVALID',
          cep: '123',
        },
      ],
    };
    return (
      <div className="min-h-screen bg-muted/20 p-8">
        <p className="mb-4 text-sm text-muted-foreground">
          Clique em &quot;Salvar&quot; para ver os erros de validação.
        </p>
        <button
          onClick={() => setOpen(true)}
          className="rounded border px-3 py-1 text-sm"
        >
          Abrir drawer
        </button>
        <EditClientDrawer
          client={clientWithBadData}
          open={open}
          onOpenChange={setOpen}
          onSaved={() => setOpen(false)}
        />
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// With409EmailError — simulates a 409 CLIENT_EMAIL_TAKEN response
// Network calls fail in Storybook; use this variant to preview the error UI
// ---------------------------------------------------------------------------
export const With409EmailError: Story = {
  name: 'Erro 409 e-mail duplicado',
  render: () => {
    // We cannot mock fetch here without Storybook addons,
    // but we document the expected visual by showing the drawer open
    // with a note about the error state.
    const [open, setOpen] = useState(true);
    return (
      <div className="min-h-screen bg-muted/20 p-8">
        <p className="mb-4 text-sm text-muted-foreground">
          Altere o e-mail para um já cadastrado e clique em &quot;Salvar&quot; para ver o erro inline
          no campo e-mail (requer backend ativo com e-mail duplicado).
        </p>
        <EditClientDrawer
          client={CLIENT_WITH_ADDRESS}
          open={open}
          onOpenChange={setOpen}
          onSaved={() => setOpen(false)}
        />
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Loading — botão Salvar em estado de submissão (isSubmitting = true)
// In Storybook without mocks we simulate by clicking submit; document intent.
// ---------------------------------------------------------------------------
export const Loading: Story = {
  name: 'Salvando (loading)',
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="min-h-screen bg-muted/20 p-8">
        <p className="mb-4 text-sm text-muted-foreground">
          Clique em &quot;Salvar&quot; para ver o estado de loading no botão (requer backend ativo
          ou request lento).
        </p>
        <EditClientDrawer
          client={CLIENT_WITH_ADDRESS}
          open={open}
          onOpenChange={setOpen}
          onSaved={() => setOpen(false)}
        />
      </div>
    );
  },
};
