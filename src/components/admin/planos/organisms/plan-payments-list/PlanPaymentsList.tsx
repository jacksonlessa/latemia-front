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
  em_atraso: {
    label: 'Em atraso',
    className: 'border-transparent bg-orange-50 text-orange-600 hover:bg-orange-50',
  },
  inadimplente: {
    label: 'Inadimplente',
    className: 'border-transparent bg-red-50 text-red-600 hover:bg-red-50',
  },
  cancelado: {
    label: 'Cancelado',
    className: 'border-transparent bg-gray-100 text-[#6B6B6E] hover:bg-gray-100',
  },
  estornado: {
    label: 'Estornado',
    className: 'border-transparent bg-slate-700 text-white hover:bg-slate-700',
  },
  contestado: {
    label: 'Contestado',
    className: 'border-transparent bg-purple-950 text-white hover:bg-purple-950',
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
 *
 * The optional columns "Falha" and "Estornado em" are only rendered when at
 * least one payment in the list carries the corresponding field, keeping the
 * happy-path layout uncluttered.
 */
export function PlanPaymentsList({ payments }: PlanPaymentsListProps) {
  if (payments.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[#6B6B6E]">
        Nenhum pagamento registrado.
      </p>
    );
  }

  const hasFailureColumn = payments.some((p) => Boolean(p.failureCode));
  const hasRefundColumn = payments.some((p) => Boolean(p.refundedAt));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead>Pago em</TableHead>
          {hasFailureColumn ? <TableHead>Falha</TableHead> : null}
          {hasRefundColumn ? <TableHead>Estornado em</TableHead> : null}
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
            {hasFailureColumn ? (
              <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                {payment.failureCode ?? '—'}
              </TableCell>
            ) : null}
            {hasRefundColumn ? (
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {payment.refundedAt ? formatDate(payment.refundedAt) : '—'}
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
