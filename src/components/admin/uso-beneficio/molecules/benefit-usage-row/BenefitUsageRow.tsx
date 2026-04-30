import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { EmergencyBadge } from '@/components/admin/uso-beneficio/atoms/emergency-badge/EmergencyBadge';
import type { BenefitUsageResponse } from '@/lib/types/benefit-usage';

export interface BenefitUsageRowProps {
  usage: BenefitUsageResponse;
  /** When false, the edit button is hidden. */
  canEdit?: boolean;
  /** Click handler for the edit button. Required when `canEdit` is true. */
  onEdit?: (usage: BenefitUsageResponse) => void;
  className?: string;
}

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const DATE = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

/** Parses a Decimal string ("1234.56") to number for display. */
function toNumber(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatBRL(value: string): string {
  return BRL.format(toNumber(value));
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return DATE.format(date);
}

/**
 * Molecule — table row representation of a single BenefitUsage record.
 *
 * Columns: data do atendimento, descrição (truncada), valor total,
 * desconto aplicado, tipo (emergência/eletivo), responsável e ação de editar.
 */
export function BenefitUsageRow({
  usage,
  canEdit = false,
  onEdit,
  className,
}: BenefitUsageRowProps) {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(usage);
    }
  };

  return (
    <TableRow className={cn('hover:bg-[#F4F9F7]', className)}>
      <TableCell className="whitespace-nowrap text-sm tabular-nums">
        {formatDate(usage.attendedAt)}
      </TableCell>
      <TableCell className="max-w-xs">
        <span
          className="block truncate"
          title={usage.procedureDescription}
        >
          {usage.procedureDescription}
        </span>
      </TableCell>
      <TableCell className="whitespace-nowrap text-sm tabular-nums">
        {formatBRL(usage.totalValue)}
      </TableCell>
      <TableCell className="whitespace-nowrap text-sm tabular-nums">
        {formatBRL(usage.discountApplied)}
      </TableCell>
      <TableCell>
        <EmergencyBadge isEmergency={usage.isEmergency} />
      </TableCell>
      <TableCell className="text-sm text-[#2C2C2E]">
        {usage.creator.name}
      </TableCell>
      {canEdit ? (
        <TableCell>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleEdit}
            aria-label={`Editar uso de benefício de ${formatDate(usage.attendedAt)}`}
            title="Editar"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
        </TableCell>
      ) : null}
    </TableRow>
  );
}
