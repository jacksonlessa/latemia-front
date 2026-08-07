import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export type DelinquencySummaryCardState = "default" | "loading" | "error";

interface DelinquencySummaryCardProps {
  totalDelinquentClients?: number;
  clientsWithPendingMessageToday?: number;
  /** Render state — when not "default", switches to a placeholder body. */
  state?: DelinquencySummaryCardState;
  /** Custom error message for the `state="error"` variant. */
  errorMessage?: string;
}

/**
 * Dashboard-home summary card for the delinquency management feature.
 *
 * Shows the total number of delinquent clients and how many of them still
 * have a pending message stage applicable today, with a link to the full
 * `/admin/inadimplencia` listing.
 *
 * Values are visible for both `admin` and `atendente` roles — unlike
 * `monthlyRevenue`, these counts are not financially sensitive.
 *
 * A fetch failure for this card must not prevent the rest of the dashboard
 * from rendering; the caller passes `state="error"` in that case instead of
 * throwing.
 */
export function DelinquencySummaryCard({
  totalDelinquentClients = 0,
  clientsWithPendingMessageToday = 0,
  state = "default",
  errorMessage,
}: DelinquencySummaryCardProps) {
  return (
    <div
      className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6"
      data-testid="delinquency-summary-card"
      data-state={state}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-base font-semibold text-[#2C2C2E] md:text-lg">
          <AlertTriangle
            className="h-5 w-5 text-[#C94040]"
            aria-hidden="true"
          />
          Inadimplência
        </h3>
        <Link
          href="/admin/inadimplencia"
          className="text-sm font-medium text-[#4E8C75] hover:underline"
        >
          Ver todos
        </Link>
      </div>

      {state === "loading" && (
        <div className="grid grid-cols-2 gap-4">
          <div
            aria-label="Carregando"
            className="h-8 w-16 animate-pulse rounded bg-gray-100"
          />
          <div
            aria-label="Carregando"
            className="h-8 w-16 animate-pulse rounded bg-gray-100"
          />
        </div>
      )}

      {state === "error" && (
        <p className="text-sm text-[#C94040]">
          {errorMessage ?? "Não foi possível carregar o resumo de inadimplência"}
        </p>
      )}

      {state === "default" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span
              className="block text-2xl font-semibold text-[#2C2C2E] md:text-3xl"
              data-testid="delinquency-summary-total"
            >
              {totalDelinquentClients}
            </span>
            <p className="mt-1 text-xs text-[#6B6B6E]">
              Clientes inadimplentes
            </p>
          </div>
          <div>
            <span
              className="block text-2xl font-semibold text-[#2C2C2E] md:text-3xl"
              data-testid="delinquency-summary-pending-today"
            >
              {clientsWithPendingMessageToday}
            </span>
            <p className="mt-1 text-xs text-[#6B6B6E]">
              Com mensagem pendente hoje
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
