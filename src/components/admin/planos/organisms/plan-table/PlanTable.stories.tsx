/**
 * Storybook stories for PlanTable organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 *
 * NOTE: PlanTable uses useRouter and useSearchParams from Next.js.
 * When Storybook is configured, a Next.js router decorator/mock will be
 * required for full interactivity (pagination buttons).
 */

import type React from 'react';
import { Shield } from 'lucide-react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/admin/usuarios-internos/atoms/empty-state';
import { PlanRow } from '@/components/admin/planos/molecules/plan-row/PlanRow';
import type { PlanListItem } from '@/lib/types/plan';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Admin - Planos/Organisms/PlanTable',
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
  render?: () => React.ReactElement;
  name?: string;
};

// ---------------------------------------------------------------------------
// Mock data — no real personal data
// ---------------------------------------------------------------------------

const mockPlans: PlanListItem[] = [
  {
    id: 'plan-uuid-exemplo-1',
    status: 'ativo',
    clientName: 'Maria da Silva',
    petName: 'Rex',
    createdAt: '2026-04-01T10:00:00.000Z',
  },
  {
    id: 'plan-uuid-exemplo-2',
    status: 'pendente',
    clientName: 'João Souza',
    petName: 'Luna',
    createdAt: '2026-03-15T08:30:00.000Z',
  },
  {
    id: 'plan-uuid-exemplo-3',
    status: 'inadimplente',
    clientName: 'Ana Costa',
    petName: 'Bolinha',
    createdAt: '2026-02-20T14:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Visual shell components (no router dependency)
// ---------------------------------------------------------------------------

function PlanTableShell({
  plans,
  total,
  page,
  limit,
}: {
  plans: PlanListItem[];
  total: number;
  page: number;
  limit: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (plans.length === 0) {
    return (
      <EmptyState
        icon={<Shield className="h-12 w-12" />}
        title="Nenhum plano encontrado"
        description="Nenhum plano corresponde aos filtros aplicados. Tente ajustar os critérios de busca."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col">Cliente</TableHead>
              <TableHead scope="col">Pet</TableHead>
              <TableHead scope="col">Cadastrado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <PlanRow key={plan.id} plan={plan} />
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          Total: <span className="font-medium">{total}</span>{' '}
          plano{total !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} aria-label="Página anterior">
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground" aria-live="polite">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            aria-label="Próxima página"
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}

function LoadingShell() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border animate-pulse">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col">Cliente</TableHead>
              <TableHead scope="col">Pet</TableHead>
              <TableHead scope="col">Cadastrado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 4 }).map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 rounded bg-muted w-full max-w-[120px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Tabela com dados — estado padrão com planos listados */
export const Default: Story = {
  name: 'Padrão (com dados)',
  render: () => (
    <PlanTableShell plans={mockPlans} total={mockPlans.length} page={1} limit={20} />
  ),
};

/** Tabela vazia — nenhum plano encontrado */
export const Empty: Story = {
  name: 'Vazio (sem planos)',
  render: () => <PlanTableShell plans={[]} total={0} page={1} limit={20} />,
};

/** Tabela em carregamento — esqueleto de linhas */
export const Loading: Story = {
  name: 'Carregando',
  render: () => <LoadingShell />,
};

/** Estado de erro — mensagem de falha */
export const Error: Story = {
  name: 'Erro ao carregar',
  render: () => (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <p className="text-sm text-destructive">
        Não foi possível carregar a lista de planos.
      </p>
      <button className="text-sm text-[#4E8C75] underline underline-offset-4 hover:opacity-80">
        Tentar novamente
      </button>
    </div>
  ),
};
