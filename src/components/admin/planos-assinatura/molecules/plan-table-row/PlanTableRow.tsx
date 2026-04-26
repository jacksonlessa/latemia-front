import { Pencil, Archive } from 'lucide-react';
import { StatusBadge } from '@/components/admin/planos-assinatura/atoms/status-badge/StatusBadge';
import { IntervalLabel } from '@/components/admin/planos-assinatura/atoms/interval-label/IntervalLabel';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Plan } from '@/lib/billing/types';

interface PlanTableRowProps {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onArchive: (plan: Plan) => void;
  className?: string;
}

/** Formats a cents integer to BRL currency string, e.g. 9990 → "R$ 99,90" */
function formatCents(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

/** Price display — backend PlanItemDTO does not expose price in list responses */
function getPlanPrice(_plan: Plan): string {
  return '—';
}

export function PlanTableRow({ plan, onEdit, onArchive, className }: PlanTableRowProps) {
  return (
    <TableRow className={cn('hover:bg-[#F4F9F7]', className)}>
      <TableCell className="font-mono text-xs text-muted-foreground">{plan.id}</TableCell>
      <TableCell className="font-medium">{plan.name}</TableCell>
      <TableCell>
        <IntervalLabel interval={plan.interval} intervalCount={plan.intervalCount} />
      </TableCell>
      <TableCell className="text-sm tabular-nums">{getPlanPrice(plan)}</TableCell>
      <TableCell>
        <StatusBadge status={plan.status} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(plan)}
            aria-label={`Editar plano ${plan.name}`}
            title="Editar"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onArchive(plan)}
            aria-label={`Arquivar plano ${plan.name}`}
            title="Arquivar"
            disabled={plan.status === 'inactive'}
            className="text-muted-foreground hover:text-destructive"
          >
            <Archive className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
