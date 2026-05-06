/**
 * Storybook stories for ClientsTable organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 *
 * NOTE: ClientsTable uses useRouter and useSearchParams from Next.js.
 * When Storybook is configured, a Next.js router decorator/mock will be
 * required for full interactivity (row click, pagination buttons).
 */

import type React from 'react';
import { Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/admin/usuarios-internos/atoms/empty-state';
import type { ClientListItem } from '@/lib/types/client';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Admin - Clientes/Organisms/ClientsTable',
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

const mockClients: ClientListItem[] = [
  {
    id: 'uuid-exemplo-1',
    name: 'Maria da Silva',
    cpfMasked: '***.456.789-00',
    phoneMasked: '(11) *****-4321',
    email: 'maria@exemplo.com',
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'uuid-exemplo-2',
    name: 'João Souza',
    cpfMasked: '***.123.456-00',
    phoneMasked: '(21) *****-9876',
    email: 'joao@exemplo.com',
    createdAt: '2026-02-10T08:30:00.000Z',
  },
  {
    id: 'uuid-exemplo-3',
    name: 'Ana Costa',
    cpfMasked: '***.789.012-00',
    phoneMasked: '(31) *****-5555',
    email: 'ana@exemplo.com',
    createdAt: '2026-03-05T14:00:00.000Z',
  },
];

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });

function formatDate(iso: string): string {
  try {
    return dateFormatter.format(new Date(iso));
  } catch {
    return '—';
  }
}

// ---------------------------------------------------------------------------
// Visual shell components (no router dependency)
// ---------------------------------------------------------------------------

function ClientsTableShell({
  data,
  total,
  page,
  limit,
}: {
  data: ClientListItem[];
  total: number;
  page: number;
  limit: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (data.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12" />}
        title="Nenhum cliente encontrado"
        description="Nenhum cliente corresponde à busca aplicada. Tente ajustar os termos de pesquisa."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Nome</TableHead>
              <TableHead scope="col">CPF</TableHead>
              <TableHead scope="col">Telefone</TableHead>
              <TableHead scope="col">E-mail</TableHead>
              <TableHead scope="col">Cadastrado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-[#F4F9F7]"
                role="button"
                tabIndex={0}
                aria-label={`Ver detalhes de ${row.name}`}
              >
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {row.cpfMasked}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {row.phoneMasked}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {row.email}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDate(row.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          Total: <span className="font-medium">{total}</span>{' '}
          cliente{total !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            aria-label="Página anterior"
          >
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
              <TableHead scope="col">Nome</TableHead>
              <TableHead scope="col">CPF</TableHead>
              <TableHead scope="col">Telefone</TableHead>
              <TableHead scope="col">E-mail</TableHead>
              <TableHead scope="col">Cadastrado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 5 }).map((_, j) => (
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

/** Tabela com dados — estado padrão com clientes listados */
export const Default: Story = {
  name: 'Padrão (com dados)',
  render: () => (
    <ClientsTableShell
      data={mockClients}
      total={mockClients.length}
      page={1}
      limit={10}
    />
  ),
};

/** Tabela vazia — nenhum cliente encontrado */
export const Empty: Story = {
  name: 'Vazio (sem clientes)',
  render: () => (
    <ClientsTableShell
      data={[]}
      total={0}
      page={1}
      limit={10}
    />
  ),
};

/** Tabela em carregamento — esqueleto de linhas */
export const Loading: Story = {
  name: 'Carregando',
  render: () => <LoadingShell />,
};
