'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { EmptyState } from '@/components/admin/usuarios-internos/atoms/empty-state';
import { PlanRow } from '@/components/admin/planos/molecules/plan-row/PlanRow';
import type { PlanListItem } from '@/lib/types/plan';

interface PlanTableProps {
  plans: PlanListItem[];
  total: number;
  page: number;
  limit: number;
  isLoading?: boolean;
}

const SKELETON_ROWS = 5;
const SKELETON_COLS = 5;

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: SKELETON_COLS }).map((_, j) => (
        <TableCell key={j}>
          <div className="h-4 rounded bg-muted w-full max-w-[120px] animate-pulse" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function PlanTable({
  plans,
  total,
  page,
  limit,
  isLoading = false,
}: PlanTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / limit));

  function navigateToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.replace(`?${params.toString()}`);
  }

  if (!isLoading && plans.length === 0) {
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
              <TableHead scope="col">ID</TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col">Cliente</TableHead>
              <TableHead scope="col">Pet</TableHead>
              <TableHead scope="col">Cadastrado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))
              : plans.map((plan) => <PlanRow key={plan.id} plan={plan} />)}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          Total: <span className="font-medium">{total}</span>{' '}
          plano{total !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToPage(page - 1)}
            disabled={page <= 1 || isLoading}
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
            disabled={page >= totalPages || isLoading}
            aria-label="Próxima página"
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
