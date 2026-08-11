/**
 * Storybook stories for AddPetToClientDialog organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow CSF 3 and will be picked up once Storybook is installed.
 *
 * Variants required by Tarefa 7.8 (`adicao-pet-cliente-existente`):
 * - Passo 1 vazio
 * - Passo 1 com erros de validação
 * - Passo 2 confirmação com valores mock
 * - Erro 422 por cada `reason` (client_inadimplente, client_pendente, client_no_subscription)
 * - Erro 409 (colisão de nome)
 * - Loading/submitting
 */

import type React from 'react';
import { useState } from 'react';
import { AddPetToClientDialog } from './add-pet-to-client-dialog';
import type { AddPetToClientResult } from '@/lib/types/pet';

const meta = {
  title: 'Admin - Clientes/Organisms/AddPetToClientDialog',
  component: AddPetToClientDialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = { render?: () => React.ReactElement; name?: string };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function noop(_result: AddPetToClientResult): void {
  // no-op — used in stories where we don't care about the callback
}

function OpenButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="rounded border px-3 py-1 text-sm"
    >
      Abrir wizard
    </button>
  );
}

/** Mocks `global.fetch` to resolve with a fixed status/body for the story's lifetime. */
function mockFetchOnce(status: number, body: unknown): void {
  const response = {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
  globalThis.fetch = (async () => response) as typeof fetch;
}

// ---------------------------------------------------------------------------
// Passo 1 — vazio
// ---------------------------------------------------------------------------
export const Passo1Vazio: Story = {
  name: 'Passo 1 — vazio',
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="min-h-screen bg-muted/20 p-8">
        <OpenButton onOpen={() => setOpen(true)} />
        <AddPetToClientDialog
          clientId="client-1"
          open={open}
          onOpenChange={setOpen}
          onAdded={noop}
          currentLivePlanCount={2}
          pricePerPetCents={2500}
          contractText=""
        />
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Passo 1 — com erros de validação (clique em "Continuar")
// ---------------------------------------------------------------------------
export const Passo1ComErros: Story = {
  name: 'Passo 1 — com erros de validação',
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="min-h-screen bg-muted/20 p-8">
        <p className="mb-4 text-sm text-muted-foreground">
          Clique em &quot;Continuar&quot; com os campos vazios para ver os erros de validação.
        </p>
        <OpenButton onOpen={() => setOpen(true)} />
        <AddPetToClientDialog
          clientId="client-1"
          open={open}
          onOpenChange={setOpen}
          onAdded={noop}
          currentLivePlanCount={2}
          pricePerPetCents={2500}
          contractText=""
        />
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Passo 2 — confirmação com valores mock
// ---------------------------------------------------------------------------
export const Passo2Confirmacao: Story = {
  name: 'Passo 2 — confirmação',
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="min-h-screen bg-muted/20 p-8">
        <OpenButton onOpen={() => setOpen(true)} />
        <AddPetToClientDialog
          clientId="client-1"
          open={open}
          onOpenChange={setOpen}
          onAdded={noop}
          currentLivePlanCount={2}
          pricePerPetCents={2500}
          contractText="O pet passa a integrar a assinatura já existente do tutor. A próxima fatura consolidada é atualizada automaticamente."
          initialStep="confirm"
          initialValues={{
            name: 'Bolinha',
            species: 'canino',
            breed: 'Poodle',
            weight: '8',
            birthDate: '2023-01-15',
            sex: 'male',
            castrated: false,
          }}
        />
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Erro 422 — client_inadimplente
// ---------------------------------------------------------------------------
export const Erro422Inadimplente: Story = {
  name: 'Erro 422 — client_inadimplente',
  render: () => {
    const [open, setOpen] = useState(true);
    mockFetchOnce(422, {
      code: 'CLIENT_NOT_ELIGIBLE_FOR_PET_ADDITION',
      reason: 'client_inadimplente',
    });
    return (
      <div className="min-h-screen bg-muted/20 p-8">
        <p className="mb-4 text-sm text-muted-foreground">
          Clique em &quot;Confirmar adição&quot; (marque o checkbox antes) para ver o erro.
        </p>
        <OpenButton onOpen={() => setOpen(true)} />
        <AddPetToClientDialog
          clientId="client-1"
          open={open}
          onOpenChange={setOpen}
          onAdded={noop}
          currentLivePlanCount={2}
          pricePerPetCents={2500}
          contractText=""
          initialStep="confirm"
          initialValues={{ name: 'Rex', breed: 'Golden', weight: '25', birthDate: '2021-01-01' }}
        />
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Erro 422 — client_pendente
// ---------------------------------------------------------------------------
export const Erro422Pendente: Story = {
  name: 'Erro 422 — client_pendente',
  render: () => {
    const [open, setOpen] = useState(true);
    mockFetchOnce(422, {
      code: 'CLIENT_NOT_ELIGIBLE_FOR_PET_ADDITION',
      reason: 'client_pendente',
    });
    return (
      <div className="min-h-screen bg-muted/20 p-8">
        <p className="mb-4 text-sm text-muted-foreground">
          Clique em &quot;Confirmar adição&quot; (marque o checkbox antes) para ver o erro.
        </p>
        <OpenButton onOpen={() => setOpen(true)} />
        <AddPetToClientDialog
          clientId="client-1"
          open={open}
          onOpenChange={setOpen}
          onAdded={noop}
          currentLivePlanCount={1}
          pricePerPetCents={2500}
          contractText=""
          initialStep="confirm"
          initialValues={{ name: 'Mia', breed: 'Siamês', weight: '4', birthDate: '2022-05-10' }}
        />
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Erro 422 — client_no_subscription
// ---------------------------------------------------------------------------
export const Erro422SemSubscription: Story = {
  name: 'Erro 422 — client_no_subscription',
  render: () => {
    const [open, setOpen] = useState(true);
    mockFetchOnce(422, {
      code: 'CLIENT_NOT_ELIGIBLE_FOR_PET_ADDITION',
      reason: 'client_no_subscription',
    });
    return (
      <div className="min-h-screen bg-muted/20 p-8">
        <p className="mb-4 text-sm text-muted-foreground">
          Clique em &quot;Confirmar adição&quot; (marque o checkbox antes) para ver o erro.
        </p>
        <OpenButton onOpen={() => setOpen(true)} />
        <AddPetToClientDialog
          clientId="client-1"
          open={open}
          onOpenChange={setOpen}
          onAdded={noop}
          currentLivePlanCount={0}
          pricePerPetCents={2500}
          contractText=""
          initialStep="confirm"
          initialValues={{ name: 'Thor', breed: 'Vira-lata', weight: '12', birthDate: '2020-03-20' }}
        />
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Erro 409 — colisão de nome
// ---------------------------------------------------------------------------
export const Erro409ColisaoDeNome: Story = {
  name: 'Erro 409 — colisão de nome',
  render: () => {
    const [open, setOpen] = useState(true);
    mockFetchOnce(409, {
      code: 'INVALID_INPUT',
      message: 'Já existe um pet com esse nome para este cliente.',
    });
    return (
      <div className="min-h-screen bg-muted/20 p-8">
        <p className="mb-4 text-sm text-muted-foreground">
          Clique em &quot;Confirmar adição&quot; (marque o checkbox antes) — o dialog volta ao
          passo 1 com o erro no campo nome.
        </p>
        <OpenButton onOpen={() => setOpen(true)} />
        <AddPetToClientDialog
          clientId="client-1"
          open={open}
          onOpenChange={setOpen}
          onAdded={noop}
          currentLivePlanCount={1}
          pricePerPetCents={2500}
          contractText=""
          initialStep="confirm"
          initialValues={{ name: 'Rex', breed: 'Golden', weight: '25', birthDate: '2021-01-01' }}
        />
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Loading / submitting
// ---------------------------------------------------------------------------
export const Submetendo: Story = {
  name: 'Loading (submetendo)',
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="min-h-screen bg-muted/20 p-8">
        <OpenButton onOpen={() => setOpen(true)} />
        <AddPetToClientDialog
          clientId="client-1"
          open={open}
          onOpenChange={setOpen}
          onAdded={noop}
          currentLivePlanCount={2}
          pricePerPetCents={2500}
          contractText=""
          initialStep="confirm"
          initialValues={{ name: 'Bolinha', breed: 'Poodle', weight: '8', birthDate: '2023-01-15' }}
          isSubmittingOverride={true}
        />
      </div>
    );
  },
};
