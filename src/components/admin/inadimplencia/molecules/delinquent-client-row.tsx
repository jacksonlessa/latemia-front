import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import type { DelinquentClientDto } from "@/lib/types/delinquency";

// ---------------------------------------------------------------------------
// Severity badge
// ---------------------------------------------------------------------------

/**
 * Resolves the badge color classes for a given `daysOverdue` value.
 * Ranges per TechSpec: 1-2 yellow, 3-4 yellow (same tone as 1-2, no gap in
 * the fixed-stage flow), 5-10 orange, 11+ (incl. 14) red.
 */
function severityClasses(daysOverdue: number): string {
  if (daysOverdue >= 11) {
    return "border-transparent bg-red-50 text-red-700 hover:bg-red-50";
  }
  if (daysOverdue >= 5) {
    return "border-transparent bg-orange-50 text-orange-700 hover:bg-orange-50";
  }
  return "border-transparent bg-amber-50 text-amber-700 hover:bg-amber-50";
}

interface DaysOverdueBadgeProps {
  daysOverdue: number | null;
  trackingUnavailable: boolean;
}

/**
 * DaysOverdueBadge — Atom-like piece rendering the severity badge, or a
 * neutral badge when the client's `delinquentSince` predates the tracking
 * rollout (`trackingUnavailable`).
 */
export function DaysOverdueBadge({
  daysOverdue,
  trackingUnavailable,
}: DaysOverdueBadgeProps) {
  if (trackingUnavailable || daysOverdue === null) {
    return (
      <Badge
        className="border-transparent bg-gray-100 text-[#6B6B6E] hover:bg-gray-100"
        title="Atraso desde antes do rastreamento — não é possível calcular dias exatos."
      >
        Atraso desde antes do rastreamento
      </Badge>
    );
  }

  return (
    <Badge className={severityClasses(daysOverdue)}>
      {daysOverdue} {daysOverdue === 1 ? "dia" : "dias"} de atraso
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Applicable stage label
// ---------------------------------------------------------------------------

interface ApplicableStageLabelProps {
  applicableStage: number | null;
}

/** ApplicableStageLabel — Atom-like piece rendering the pending stage or "no pending message". */
export function ApplicableStageLabel({
  applicableStage,
}: ApplicableStageLabelProps) {
  if (applicableStage === null) {
    return <span className="text-sm text-[#6B6B6E]">Sem mensagem pendente</span>;
  }

  return (
    <span className="text-sm font-medium text-[#2C2C2E]">
      Estágio de {applicableStage} {applicableStage === 1 ? "dia" : "dias"}{" "}
      pendente
    </span>
  );
}

// ---------------------------------------------------------------------------
// DelinquentClientRow — Molecule
// ---------------------------------------------------------------------------

export interface DelinquentClientRowProps {
  client: DelinquentClientDto;
  /** Rendered to the right of the row info — the action buttons molecule. */
  actions?: ReactNode;
}

/**
 * DelinquentClientRow — Molecule
 *
 * Renders a single delinquent client's summary: name, pets, days-overdue
 * severity badge and the applicable message stage (or "no pending
 * message"). Purely presentational — the dispatch actions are injected via
 * the `actions` slot so this molecule stays decoupled from the API calls.
 */
export function DelinquentClientRow({
  client,
  actions,
}: DelinquentClientRowProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-100 py-4 last:border-b-0 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-[#2C2C2E]">
            {client.clientName}
          </span>
          <DaysOverdueBadge
            daysOverdue={client.daysOverdue}
            trackingUnavailable={client.trackingUnavailable}
          />
        </div>
        <p className="text-xs text-[#6B6B6E]">
          {client.petNames.length > 0
            ? `Pets: ${client.petNames.join(", ")}`
            : "Nenhum pet associado"}
        </p>
        <ApplicableStageLabel applicableStage={client.applicableStage} />
      </div>

      {actions ? (
        <div className="flex-shrink-0">{actions}</div>
      ) : null}
    </div>
  );
}
