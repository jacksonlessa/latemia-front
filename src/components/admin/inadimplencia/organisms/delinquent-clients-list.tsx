"use client";

import { useCallback, useMemo, useState } from "react";
import { ArrowUpDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/admin/usuarios-internos/atoms/empty-state";
import { DelinquentClientRow } from "../molecules/delinquent-client-row";
import { DelinquencyActionButtons } from "../molecules/delinquency-action-buttons";
import type {
  DelinquencyClientsSort,
  DelinquencyTemplateDto,
  DelinquentClientDto,
} from "@/lib/types/delinquency";

interface DelinquentClientsListProps {
  initialClients: DelinquentClientDto[];
  templates: DelinquencyTemplateDto[];
  initialSort?: DelinquencyClientsSort;
  fetchError?: string | null;
}

/**
 * DelinquentClientsList — Organism
 *
 * Renders the sortable list of delinquent clients consuming
 * `GET /v1/admin/delinquency/clients` through the internal Route Handler
 * proxy (`/api/admin/delinquency/clients`), starting from the initial data
 * fetched server-side by the page.
 *
 * Reloads the list (same sort) after a successful dispatch or after a
 * `STAGE_NOT_APPLICABLE` rejection, so the row reflects the client's real
 * current state (e.g. the applicable stage advances or clears).
 */
export function DelinquentClientsList({
  initialClients,
  templates,
  initialSort = "daysOverdue:desc",
  fetchError,
}: DelinquentClientsListProps) {
  const [clients, setClients] = useState<DelinquentClientDto[]>(initialClients);
  const [sort, setSort] = useState<DelinquencyClientsSort>(initialSort);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const templateByStage = useMemo(() => {
    return new Map(templates.map((template) => [template.stageDays, template]));
  }, [templates]);

  const reload = useCallback(async (nextSort: DelinquencyClientsSort) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(
        `/api/admin/delinquency/clients?sort=${encodeURIComponent(nextSort)}`,
        { cache: "no-store" },
      );
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const body = (await res.json()) as { data: DelinquentClientDto[] };
      setClients(body.data);
      setSort(nextSort);
    } catch {
      setLoadError("Não foi possível atualizar a listagem. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  function handleToggleSort() {
    void reload(sort === "daysOverdue:desc" ? "daysOverdue:asc" : "daysOverdue:desc");
  }

  function handleRowChanged() {
    void reload(sort);
  }

  if (fetchError) {
    return (
      <p
        role="alert"
        className="rounded-md bg-red-50 px-4 py-3 text-sm text-destructive"
      >
        {fetchError}
      </p>
    );
  }

  if (clients.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12" />}
        title="Nenhum cliente inadimplente"
        description="Não há clientes com planos em status inadimplente no momento."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[#6B6B6E]">
          Total: <span className="font-medium">{clients.length}</span>{" "}
          cliente{clients.length !== 1 ? "s" : ""} inadimplente
          {clients.length !== 1 ? "s" : ""}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleToggleSort}
          disabled={isLoading}
          aria-busy={isLoading}
        >
          <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
          <span>
            Dias de atraso:{" "}
            {sort === "daysOverdue:desc" ? "maior primeiro" : "menor primeiro"}
          </span>
        </Button>
      </div>

      {loadError ? (
        <p role="alert" className="text-sm text-red-600">
          {loadError}
        </p>
      ) : null}

      <div
        className="rounded-xl border border-gray-100 bg-white px-4 shadow-sm md:px-6"
        aria-busy={isLoading}
      >
        {clients.map((client) => {
          const template =
            client.applicableStage !== null
              ? templateByStage.get(client.applicableStage)
              : undefined;

          const actions =
            client.applicableStage !== null && template ? (
              <DelinquencyActionButtons
                client={{
                  clientId: client.clientId,
                  clientName: client.clientName,
                  clientPhone: client.clientPhone,
                  petNames: client.petNames,
                  applicableStage: client.applicableStage,
                }}
                template={template}
                onDispatched={handleRowChanged}
                onStageNotApplicable={handleRowChanged}
              />
            ) : undefined;

          return (
            <DelinquentClientRow
              key={client.clientId}
              client={client}
              actions={actions}
            />
          );
        })}
      </div>
    </div>
  );
}
