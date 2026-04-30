"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface KPICardComparison {
  /** Absolute delta vs comparison period. */
  delta: number;
  /** Percent delta (rounded to 1 decimal). */
  deltaPercent: number;
}

export interface KPICardProgress {
  current: number;
  total: number;
}

export type KPICardState = "default" | "loading" | "empty" | "error";

interface KPICardProps {
  title: string;
  value: string | number;
  /**
   * `null` → renders the "sem comparativo disponível" placeholder.
   * `undefined` → no comparison slot at all.
   */
  comparison?: KPICardComparison | null;
  /** When true, hides the value behind dots and suppresses the comparison badge. */
  masked?: boolean;
  /** Renders a progress bar with absolute numbers in tooltip. */
  progress?: KPICardProgress;
  /** Render state — when not "default", switches to a placeholder body. */
  state?: KPICardState;
  /** Custom error message for the `state="error"` variant. */
  errorMessage?: string;
}

const MASKED_PLACEHOLDER = "••••";

function formatPercent(deltaPercent: number): string {
  const sign = deltaPercent > 0 ? "+" : "";
  return `${sign}${deltaPercent.toFixed(1)}%`;
}

function ComparisonBadge({ comparison }: { comparison: KPICardComparison }) {
  const isNeutral = comparison.delta === 0 && comparison.deltaPercent === 0;
  if (isNeutral) {
    return (
      <div className="flex items-center gap-1 text-sm text-[#6B6B6E]">
        <Minus className="h-4 w-4" aria-hidden="true" />
        <span>—</span>
      </div>
    );
  }

  const isPositive = comparison.delta >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? "text-[#4E8C75]" : "text-[#C94040]";

  return (
    <div className={`flex items-center gap-1 text-sm ${colorClass}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span>{formatPercent(comparison.deltaPercent)}</span>
    </div>
  );
}

function NoComparisonBadge() {
  return (
    <span className="text-xs text-[#6B6B6E]">sem comparativo disponível</span>
  );
}

function ProgressBar({ progress }: { progress: KPICardProgress }) {
  const safeTotal = progress.total > 0 ? progress.total : 1;
  const pct = Math.max(
    0,
    Math.min(100, Math.round((progress.current / safeTotal) * 100)),
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={progress.total}
          aria-valuenow={progress.current}
          aria-label={`${progress.current} de ${progress.total}`}
          className="h-2 w-full cursor-help rounded-full bg-gray-100"
        >
          <div
            className="h-2 rounded-full bg-[#4E8C75] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {progress.current} de {progress.total}
      </TooltipContent>
    </Tooltip>
  );
}

export function KPICard({
  title,
  value,
  comparison,
  masked = false,
  progress,
  state = "default",
  errorMessage,
}: KPICardProps) {
  return (
    <div
      className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6"
      data-testid="kpi-card"
      data-state={state}
    >
      <h3 className="mb-2 text-xs text-[#6B6B6E] md:text-sm">{title}</h3>

      {state === "loading" && (
        <div
          aria-label="Carregando"
          className="h-8 w-24 animate-pulse rounded bg-gray-100 md:h-9 md:w-28"
        />
      )}

      {state === "empty" && (
        <p className="text-sm text-[#6B6B6E]">Sem dados</p>
      )}

      {state === "error" && (
        <p className="text-sm text-[#C94040]">
          {errorMessage ?? "Não foi possível carregar"}
        </p>
      )}

      {state === "default" && (
        <>
          <div className="mb-3 flex items-end justify-between gap-2">
            <span
              className="text-2xl font-semibold text-[#2C2C2E] md:text-3xl"
              data-testid="kpi-card-value"
            >
              {masked ? MASKED_PLACEHOLDER : value}
            </span>
            {!masked && comparison !== undefined && (
              <div data-testid="kpi-card-comparison">
                {comparison === null ? (
                  <NoComparisonBadge />
                ) : (
                  <ComparisonBadge comparison={comparison} />
                )}
              </div>
            )}
          </div>

          {progress && <ProgressBar progress={progress} />}
        </>
      )}
    </div>
  );
}
