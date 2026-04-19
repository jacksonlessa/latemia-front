import Link from 'next/link';
import { PlanStatusBadge } from '@/components/admin/planos/atoms/plan-status-badge/PlanStatusBadge';
import { TableCell, TableRow } from '@/components/ui/table';
import type { PlanListItem } from '@/lib/types/plan';

interface PlanRowProps {
  plan: PlanListItem;
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

export function PlanRow({ plan }: PlanRowProps) {
  return (
    <TableRow className="hover:bg-[#F4F9F7]">
      <TableCell className="font-mono text-xs text-muted-foreground">
        {plan.id.substring(0, 8)}
      </TableCell>
      <TableCell>
        <PlanStatusBadge status={plan.status} />
      </TableCell>
      <TableCell className="font-medium">
        <Link
          href={`/admin/planos/${plan.id}`}
          className="hover:text-[#4E8C75] hover:underline underline-offset-4 transition-colors"
          aria-label={`Ver detalhes do plano de ${plan.clientName}`}
        >
          {plan.clientName}
        </Link>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {plan.petName}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(plan.createdAt)}
      </TableCell>
    </TableRow>
  );
}
