import { CreditCard } from 'lucide-react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { EmptyState } from '@/components/admin/planos-assinatura/atoms/empty-state/EmptyState';
import { PlanTableRow } from '@/components/admin/planos-assinatura/molecules/plan-table-row/PlanTableRow';
import type { Plan } from '@/lib/billing/types';

interface PlansTableProps {
  plans: Plan[];
  isLoading?: boolean;
  isEmpty?: boolean;
  error?: string;
  onEdit: (plan: Plan) => void;
  onArchive: (plan: Plan) => void;
}

const SKELETON_ROWS = 5;
const SKELETON_COLS = 6;

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: SKELETON_COLS }).map((_, j) => (
        <TableCell key={j}>
          <div className="h-4 rounded bg-muted w-full max-w-[140px] animate-pulse" />
        </TableCell>
      ))}
    </TableRow>
  );
}

/**
 * Full plans table with loading state, empty state, and action callbacks.
 * No network calls — data is passed via props.
 */
export function PlansTable({
  plans,
  isLoading = false,
  isEmpty = false,
  error,
  onEdit,
  onArchive,
}: PlansTableProps) {
  if (!isLoading && error) {
    return (
      <div
        role="alert"
        className="rounded-md border border-destructive/40 bg-destructive/5 px-6 py-10 text-center"
      >
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  }

  if (!isLoading && (isEmpty || plans.length === 0)) {
    return (
      <EmptyState
        icon={<CreditCard className="h-12 w-12" />}
        title="Nenhum plano de assinatura encontrado"
        description="Nenhum plano corresponde aos filtros aplicados. Tente ajustar os critérios de busca ou crie um novo plano."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table aria-label="Tabela de planos de assinatura">
        <TableHeader>
          <TableRow>
            <TableHead scope="col" className="text-xs text-muted-foreground font-mono w-[180px]">
              ID
            </TableHead>
            <TableHead
              scope="col"
              aria-sort="none"
              tabIndex={0}
              className="cursor-default"
            >
              Nome
            </TableHead>
            <TableHead scope="col" aria-sort="none" tabIndex={0} className="cursor-default">
              Intervalo
            </TableHead>
            <TableHead scope="col" aria-sort="none" tabIndex={0} className="cursor-default">
              Valor
            </TableHead>
            <TableHead scope="col" aria-sort="none" tabIndex={0} className="cursor-default">
              Status
            </TableHead>
            <TableHead scope="col">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <SkeletonRow key={i} />
              ))
            : plans.map((plan) => (
                <PlanTableRow
                  key={plan.id}
                  plan={plan}
                  onEdit={onEdit}
                  onArchive={onArchive}
                />
              ))}
        </TableBody>
      </Table>
    </div>
  );
}
