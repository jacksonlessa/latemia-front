import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PlanWebhookEvent } from '@/lib/types/plan';

interface PlanWebhookEventsListProps {
  events: PlanWebhookEvent[];
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

const longDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'medium',
});

function formatDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return longDateFormatter.format(new Date(iso));
  } catch {
    return '—';
  }
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

type ProcessingState = 'processed' | 'pending' | 'error';

function deriveState(event: PlanWebhookEvent): ProcessingState {
  if (event.processingError && event.processingError !== 'pending_match') {
    return 'error';
  }
  if (!event.processedAt) return 'pending';
  return 'processed';
}

const stateConfig: Record<
  ProcessingState,
  { label: string; className: string }
> = {
  processed: {
    label: 'Processado',
    className:
      'border-transparent bg-[#EAF4F0] text-[#4E8C75] hover:bg-[#EAF4F0]',
  },
  pending: {
    label: 'Pendente',
    className: 'border-transparent bg-amber-50 text-amber-600 hover:bg-amber-50',
  },
  error: {
    label: 'Erro',
    className: 'border-transparent bg-red-50 text-red-600 hover:bg-red-50',
  },
};

function ProcessingStateBadge({ state }: { state: ProcessingState }) {
  const config = stateConfig[state];
  return (
    <Badge className={`font-medium ${config.className}`}>{config.label}</Badge>
  );
}

// ---------------------------------------------------------------------------
// PlanWebhookEventsList organism
// ---------------------------------------------------------------------------

/**
 * PlanWebhookEventsList — Organism (admin-only)
 *
 * Mostra os eventos recebidos do provider de pagamento (Pagar.me) para o
 * plano corrente. Cada linha tem um `<details>` expansível com o payload
 * cru — útil para diagnóstico operacional.
 *
 * O endpoint é admin-only no backend; este componente assume que a página
 * já filtra a renderização pelo papel do usuário.
 */
export function PlanWebhookEventsList({ events }: PlanWebhookEventsListProps) {
  if (events.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[#6B6B6E]">
        Nenhum evento recebido.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Evento</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Recebido em</TableHead>
          <TableHead>Processado em</TableHead>
          <TableHead>Assinatura válida</TableHead>
          <TableHead>Payload</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => {
          const state = deriveState(event);
          return (
            <TableRow key={event.id} className="hover:bg-[#F4F9F7] align-top">
              <TableCell className="font-mono text-xs text-[#2C2C2E] whitespace-nowrap">
                {event.eventType}
                {event.processingError ? (
                  <div className="mt-1 text-[11px] font-sans text-red-600">
                    {event.processingError}
                  </div>
                ) : null}
              </TableCell>
              <TableCell>
                <ProcessingStateBadge state={state} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {formatDate(event.receivedAt)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {formatDate(event.processedAt)}
              </TableCell>
              <TableCell className="text-sm">
                {event.signatureValid ? (
                  <span className="text-[#4E8C75]">Sim</span>
                ) : (
                  <span className="text-amber-600">Não</span>
                )}
              </TableCell>
              <TableCell>
                <details className="text-xs">
                  <summary className="cursor-pointer text-[#4E8C75] hover:opacity-80 select-none">
                    Ver payload
                  </summary>
                  <pre className="mt-2 max-h-96 overflow-auto rounded-md bg-[#F8F8F9] p-3 text-[11px] font-mono leading-relaxed text-[#2C2C2E]">
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                </details>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
