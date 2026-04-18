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
import { RoleBadge } from '@/components/admin/usuarios-internos/atoms/role-badge';
import { StatusBadge } from '@/components/admin/usuarios-internos/atoms/status-badge';
import { EmptyState } from '@/components/admin/usuarios-internos/atoms/empty-state';
import { UserRowActions } from '@/components/admin/usuarios-internos/molecules/user-row-actions';
import type { InternalUserRow } from '@/lib/types/internal-users';

interface UsersTableProps {
  data: InternalUserRow[];
  total: number;
  page: number;
  limit: number;
  currentUserId: string;
  onEdit: (id: string) => void;
  onDeactivate: (id: string) => void;
  onReactivate: (id: string) => void;
  onResetPassword: (id: string) => void;
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return dateFormatter.format(new Date(iso));
  } catch {
    return '—';
  }
}

export function UsersTable({
  data,
  total,
  page,
  limit,
  currentUserId,
  onEdit,
  onDeactivate,
  onReactivate,
  onResetPassword,
}: UsersTableProps) {
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
        title="Nenhum usuário encontrado"
        description="Nenhum usuário corresponde aos filtros aplicados. Tente ajustar a busca ou os filtros."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Último login</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">
                  <div>{row.name}</div>
                  <div className="text-xs text-muted-foreground">{row.email}</div>
                </TableCell>
                <TableCell>
                  <RoleBadge role={row.role} />
                </TableCell>
                <TableCell>
                  <StatusBadge isActive={!row.deletedAt} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDate(row.createdAt)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDate(row.lastLoginAt)}
                </TableCell>
                <TableCell className="text-right">
                  <UserRowActions
                    user={row}
                    isSelf={row.id === currentUserId}
                    onEdit={() => onEdit(row.id)}
                    onDeactivate={() => onDeactivate(row.id)}
                    onReactivate={() => onReactivate(row.id)}
                    onResetPassword={() => onResetPassword(row.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          Total: <span className="font-medium">{total}</span> usuário{total !== 1 ? 's' : ''}
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
