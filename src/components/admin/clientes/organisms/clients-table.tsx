'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/admin/usuarios-internos/atoms/empty-state';
import type { ClientListItem } from '@/lib/types/client';

interface ClientsTableProps {
  data: ClientListItem[];
  total: number;
  page: number;
  limit: number;
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
});

function formatDate(iso: string): string {
  try {
    return dateFormatter.format(new Date(iso));
  } catch {
    return '—';
  }
}

export function ClientsTable({ data, total, page, limit }: ClientsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / limit));

  function navigateToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.replace(`?${params.toString()}`);
  }

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
                onClick={() => router.push(`/admin/clientes/${row.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/admin/clientes/${row.id}`);
                  }
                }}
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

      {/* Pagination controls */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          Total: <span className="font-medium">{total}</span>{' '}
          cliente{total !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToPage(page - 1)}
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
            onClick={() => navigateToPage(page + 1)}
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
