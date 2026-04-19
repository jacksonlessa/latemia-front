import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Payment, PaymentStatus } from '@/lib/types/plan';

interface PlanPaymentsListProps {
  payments: Payment[];
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

const longDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function formatDate(iso: string): string {
  try {
    return longDateFormatter.format(new Date(iso));
  } catch {
    return '—';
  }
}

function formatCurrency(amountCents: number): string {
  const reais = amountCents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(reais);
}

// ---------------------------------------------------------------------------
// Payment status badge
// ---------------------------------------------------------------------------

const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  pendente: {
    label: 'Pendente',
    className: 'border-transparent bg-amber-50 text-amber-600 hover:bg-amber-50',
  },
  pago: {
    label: 'Pago',
    className:
      'border-transparent bg-[#EAF4F0] text-[#4E8C75] hover:bg-[#EAF4F0]',
  },
  cancelado: {
    label: 'Cancelado',
    className: 'border-transparent bg-gray-100 text-[#6B6B6E] hover:bg-gray-100',
  },
};

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config = paymentStatusConfig[status] ?? {
    label: status,
    className: 'border-transparent bg-gray-100 text-[#6B6B6E]',
  };

  return (
    <Badge className={`font-medium ${config.className}`} aria-label={`Pagamento: ${config.label}`}>
      {config.label}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// PlanPaymentsList organism
// ---------------------------------------------------------------------------

/**
 * PlanPaymentsList — Organism
 *
 * Renders a table with the payment history of a plan.
 * Displays an empty state when no payments are present.
 */
export function PlanPaymentsList({ payments }: PlanPaymentsListProps) {
  if (payments.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[#6B6B6E]">
        Nenhum pagamento registrado.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead>Pago em</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id} className="hover:bg-[#F4F9F7]">
            <TableCell>
              <PaymentStatusBadge status={payment.status} />
            </TableCell>
            <TableCell className="font-medium text-sm text-[#2C2C2E]">
              {formatCurrency(payment.amount)}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
              {formatDate(payment.createdAt)}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
              {payment.paidAt ? formatDate(payment.paidAt) : '—'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
