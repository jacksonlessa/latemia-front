/**
 * Storybook stories for EditPetDrawer organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow CSF 3 and will be picked up once Storybook is installed.
 */

import type React from 'react';
import { useState } from 'react';
import { EditPetDrawer } from './edit-pet-drawer';
import type { PetDetail } from '@/lib/types/pet';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const DOG_PET: PetDetail = {
  id: 'pet-1',
  clientId: 'client-1',
  name: 'Rex',
  species: 'canino',
  breed: 'Golden Retriever',
  birthDate: '2020-05-10T00:00:00.000Z',
  sex: 'male',
  weight: 32.5,
  castrated: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-06-01T00:00:00.000Z',
};

const CAT_PET: PetDetail = {
  id: 'pet-2',
  clientId: 'client-1',
  name: 'Mia',
  species: 'felino',
  breed: 'Siamês',
  birthDate: '2021-03-15T00:00:00.000Z',
  sex: 'female',
  weight: 4.2,
  castrated: true,
  createdAt: '2024-01-01T00:00:00.000Z',
};

const meta = {
  title: 'Admin - Clientes/Organisms/EditPetDrawer',
  component: EditPetDrawer,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = { render?: () => React.ReactElement; name?: string };

// ---------------------------------------------------------------------------
// Default — dog
// ---------------------------------------------------------------------------
export const Default: Story = {
  name: 'Padrão (cachorro)',
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
        <EditPetDrawer
          pet={DOG_PET}
          clientId="client-1"
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
// Cat
// ---------------------------------------------------------------------------
export const Cat: Story = {
  name: 'Gato castrada',
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="min-h-screen bg-muted/20 p-8">
        <EditPetDrawer
          pet={CAT_PET}
          clientId="client-1"
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
    <EditPetDrawer
      pet={DOG_PET}
      clientId="client-1"
      open={false}
      onOpenChange={() => undefined}
      onSaved={() => undefined}
    />
  ),
};

// ---------------------------------------------------------------------------
// WithValidationErrors — form open with invalid data to trigger field errors
// ---------------------------------------------------------------------------
export const WithValidationErrors: Story = {
  name: 'Com erros de validação',
  render: () => {
    const [open, setOpen] = useState(true);
    const petWithBadData: PetDetail = {
      ...DOG_PET,
      name: '',
      weight: -1,
      // future birthDate to trigger validation
      birthDate: '2099-01-01T00:00:00.000Z',
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
        <EditPetDrawer
          pet={petWithBadData}
          clientId="client-1"
          open={open}
          onOpenChange={setOpen}
          onSaved={() => setOpen(false)}
        />
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Loading — botão Salvar em estado de submissão
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
        <EditPetDrawer
          pet={DOG_PET}
          clientId="client-1"
          open={open}
          onOpenChange={setOpen}
          onSaved={() => setOpen(false)}
        />
      </div>
    );
  },
};
