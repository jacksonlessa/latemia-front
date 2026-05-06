'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BenefitUsageRow } from '@/components/admin/uso-beneficio/molecules/benefit-usage-row/BenefitUsageRow';
import { EditUsageModal } from '@/components/admin/uso-beneficio/organisms/edit-usage-modal/EditUsageModal';
import type {
  BenefitUsageResponse,
  Paginated,
} from '@/lib/types/benefit-usage';
import type { PlanSummary } from '@/lib/types/plan';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface UsoBeneficioFilters {
  page: number;
  /** Empty string means "no filter" — stored as string to back the input. */
  planId: string;
  /** ISO date `YYYY-MM-DD` from `<input type="date">`; empty = no filter. */
  from: string;
  to: string;
}

export interface UsoBeneficioPageClientProps {
  initialData: Paginated<BenefitUsageResponse>;
  initialFilters: UsoBeneficioFilters;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Returns the trimmed value if it parses as a UUID, otherwise `null`. */
function normalizeUuid(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  return UUID_REGEX.test(trimmed) ? trimmed : null;
}

/**
 * Converts a `<input type="date">` value (`YYYY-MM-DD`) to an ISO 8601 string
 * representing the start of the day in UTC. Empty input → `null`.
 */
function dateInputToIsoStart(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

/**
 * Converts a `<input type="date">` value (`YYYY-MM-DD`) to an ISO 8601 string
 * representing the END of the day in UTC. Used for inclusive `to` filter.
 */
function dateInputToIsoEnd(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(`${trimmed}T23:59:59.999Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

/**
 * Converts an ISO 8601 string back to the `YYYY-MM-DD` value the date input
 * expects. Returns the original string on parse failure to keep the field
 * controlled.
 */
function isoToDateInput(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  // Use the UTC parts so we round-trip exactly the day stored in the URL.
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Client Component — `/admin/uso-beneficio` interactivity layer.
 *
 * Owns:
 * - filter inputs (controlled state) backed by `useRouter().push` to update
 *   the canonical URL on "Aplicar";
 * - pagination via `Anterior`/`Próxima` buttons that mutate `?page=`;
 * - admin edit modal (`EditUsageModal`) — opened from the row's pencil button.
 *
 * Renders the Server-fetched snapshot directly; navigations re-trigger the
 * Server Component, which re-fetches with the new query string.
 */
export function UsoBeneficioPageClient({
  initialData,
  initialFilters,
}: UsoBeneficioPageClientProps) {
  const router = useRouter();

  const [planIdInput, setPlanIdInput] = useState<string>(
    initialFilters.planId,
  );
  const [fromInput, setFromInput] = useState<string>(
    isoToDateInput(initialFilters.from),
  );
  const [toInput, setToInput] = useState<string>(
    isoToDateInput(initialFilters.to),
  );
  const [planIdError, setPlanIdError] = useState<string | null>(null);
  const [rangeError, setRangeError] = useState<string | null>(null);

  const [editingUsage, setEditingUsage] =
    useState<BenefitUsageResponse | null>(null);

  const items = initialData.data;
  const meta = initialData.meta;

  /**
   * Builds the next URL with normalized filters, validates inputs and pushes
   * via `router.push`. Resets `page` to 1 whenever filters change.
   */
  const handleApply = useCallback(() => {
    setPlanIdError(null);
    setRangeError(null);

    const qs = new URLSearchParams();

    if (planIdInput.trim()) {
      const planId = normalizeUuid(planIdInput);
      if (!planId) {
        setPlanIdError('Informe um UUID válido para o plano.');
        return;
      }
      qs.set('planId', planId);
    }

    const fromIso = fromInput ? dateInputToIsoStart(fromInput) : null;
    const toIso = toInput ? dateInputToIsoEnd(toInput) : null;
    if (fromInput && !fromIso) {
      setRangeError('Data inicial inválida.');
      return;
    }
    if (toInput && !toIso) {
      setRangeError('Data final inválida.');
      return;
    }
    if (fromIso && toIso && new Date(fromIso) > new Date(toIso)) {
      setRangeError('A data inicial não pode ser posterior à data final.');
      return;
    }
    if (fromIso) qs.set('from', fromIso);
    if (toIso) qs.set('to', toIso);

    // Filters always reset pagination to the first page.
    qs.set('page', '1');

    router.push(`/admin/uso-beneficio?${qs.toString()}`);
  }, [planIdInput, fromInput, toInput, router]);

  const handleClear = useCallback(() => {
    setPlanIdInput('');
    setFromInput('');
    setToInput('');
    setPlanIdError(null);
    setRangeError(null);
    router.push('/admin/uso-beneficio');
  }, [router]);

  /** Pushes the same filters with a different `page` value. */
  const navigateToPage = useCallback(
    (nextPage: number) => {
      const qs = new URLSearchParams();
      if (initialFilters.planId) qs.set('planId', initialFilters.planId);
      if (initialFilters.from) qs.set('from', initialFilters.from);
      if (initialFilters.to) qs.set('to', initialFilters.to);
      qs.set('page', String(nextPage));
      router.push(`/admin/uso-beneficio?${qs.toString()}`);
    },
    [initialFilters.from, initialFilters.planId, initialFilters.to, router],
  );

  const handleEditOpen = useCallback((usage: BenefitUsageResponse) => {
    setEditingUsage(usage);
  }, []);

  const handleEditClose = useCallback((open: boolean) => {
    if (!open) setEditingUsage(null);
  }, []);

  const handleEditSuccess = useCallback(() => {
    setEditingUsage(null);
    // Re-fetch the Server Component snapshot so the updated row is reflected
    // without a full page reload.
    router.refresh();
  }, [router]);

  // The edit modal needs a PlanSummary; on the global page we only have the
  // plan id. Synthesize a minimal summary so the form does not show stale
  // pet/client info and the status alert remains neutral (the status is
  // unknown here — `ativo` is a safe default that mirrors the most common
  // case and never blocks the form. The backend remains the source of truth).
  const editingPlan: PlanSummary | null = useMemo(() => {
    if (!editingUsage) return null;
    return { id: editingUsage.planId, status: 'ativo' };
  }, [editingUsage]);

  // -------------------------- Pagination helpers --------------------------

  const totalPages = Math.max(1, meta.totalPages);
  const currentPage = meta.page;
  const firstItem =
    meta.total === 0 ? 0 : (currentPage - 1) * meta.perPage + 1;
  const lastItem = Math.min(currentPage * meta.perPage, meta.total);

  // -------------------------------- Render -------------------------------

  return (
    <div className="space-y-4">
      {/* Filters card */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <form
          aria-label="Filtros de uso de benefício"
          onSubmit={(e) => {
            e.preventDefault();
            handleApply();
          }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
        >
          {/* From */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="uso-beneficio-from">De</Label>
            <Input
              id="uso-beneficio-from"
              type="date"
              value={fromInput}
              onChange={(e) => setFromInput(e.target.value)}
              aria-describedby={
                rangeError ? 'uso-beneficio-range-error' : undefined
              }
            />
          </div>

          {/* To */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="uso-beneficio-to">Até</Label>
            <Input
              id="uso-beneficio-to"
              type="date"
              value={toInput}
              onChange={(e) => setToInput(e.target.value)}
              aria-describedby={
                rangeError ? 'uso-beneficio-range-error' : undefined
              }
            />
          </div>

          {/* Plan id */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="uso-beneficio-plan-id">ID do plano</Label>
            <Input
              id="uso-beneficio-plan-id"
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="UUID do plano"
              value={planIdInput}
              onChange={(e) => setPlanIdInput(e.target.value)}
              aria-invalid={Boolean(planIdError)}
              aria-describedby={
                planIdError ? 'uso-beneficio-plan-id-error' : undefined
              }
            />
            {planIdError && (
              <p
                id="uso-beneficio-plan-id-error"
                role="alert"
                className="text-xs text-destructive"
              >
                {planIdError}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-end gap-2">
            <Button type="submit" className="shrink-0">
              <Search className="mr-2 h-4 w-4" aria-hidden="true" />
              Aplicar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="shrink-0"
            >
              Limpar
            </Button>
          </div>

          {/* Range-level error spans the row */}
          {rangeError && (
            <p
              id="uso-beneficio-range-error"
              role="alert"
              className="text-xs text-destructive sm:col-span-2 lg:col-span-4"
            >
              {rangeError}
            </p>
          )}
        </form>
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#6B6B6E]">
            Nenhum uso de benefício encontrado para os filtros aplicados.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Procedimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="w-12">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((usage) => (
                <BenefitUsageRow
                  key={usage.id}
                  usage={usage}
                  canEdit
                  onEdit={handleEditOpen}
                />
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {meta.total > 0 && (
          <div className="flex flex-col items-start justify-between gap-2 pt-4 sm:flex-row sm:items-center">
            <span className="text-sm text-[#6B6B6E]">
              {firstItem}–{lastItem} de {meta.total}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigateToPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigateToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editingUsage && editingPlan && (
        <EditUsageModal
          open
          onOpenChange={handleEditClose}
          plan={editingPlan}
          usage={editingUsage}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
