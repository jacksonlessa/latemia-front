"use client";

import { Eye, Filter, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PlanListItem, PlanListMeta, PlanStatus } from "@/lib/types/plan";

const planStatusStyles: Record<PlanStatus, string> = {
  pendente: "bg-[#FEF3C7] text-[#D97706]",
  carencia: "bg-[#FEF3C7] text-[#D97706]",
  ativo: "bg-[#EAF4F0] text-[#4E8C75]",
  inadimplente: "bg-[#FDECEA] text-[#C94040]",
  cancelado: "bg-[#F0F0F0] text-[#2C2C2E]",
  estornado: "bg-[#F0F0F0] text-[#2C2C2E]",
  contestado: "bg-[#F0F0F0] text-[#2C2C2E]",
};

const planStatusLabels: Record<PlanStatus, string> = {
  pendente: "Pendente",
  carencia: "Carência",
  ativo: "Ativo",
  inadimplente: "Inadimplente",
  cancelado: "Cancelado",
  estornado: "Estornado",
  contestado: "Contestado",
};

const STATUS_OPTIONS: Array<{ value: PlanStatus | "todos"; label: string }> = [
  { value: "todos", label: "Todos os status" },
  { value: "pendente", label: "Pendente" },
  { value: "carencia", label: "Carência" },
  { value: "ativo", label: "Ativo" },
  { value: "inadimplente", label: "Inadimplente" },
  { value: "cancelado", label: "Cancelado" },
  { value: "estornado", label: "Estornado" },
  { value: "contestado", label: "Contestado" },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export interface PlansTableFilters {
  status?: string;
  search?: string;
}

export interface PlansTableProps {
  data: PlanListItem[];
  meta: PlanListMeta;
  currentFilters: PlansTableFilters;
  onSelectPlan: (plan: PlanListItem) => void;
}

/**
 * Operational plans table for the admin dashboard.
 *
 * Filters (`status`, `search`) are reflected in the URL query string so the
 * Server Component above re-fetches the list. The table itself is read-only.
 */
export function PlansTable({
  data,
  meta,
  currentFilters,
  onSelectPlan,
}: PlansTableProps) {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initialStatus = currentFilters.status ?? "todos";
  const initialSearch = currentFilters.search ?? "";

  const [searchValue, setSearchValue] = useState(initialSearch);

  useEffect(() => {
    setSearchValue(currentFilters.search ?? "");
  }, [currentFilters.search]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function buildUrl(updates: Record<string, string>): string {
    const params = new URLSearchParams();
    if (currentFilters.status && currentFilters.status !== "todos") {
      params.set("status", currentFilters.status);
    }
    if (currentFilters.search) {
      params.set("search", currentFilters.search);
    }
    for (const [key, value] of Object.entries(updates)) {
      if (value === "" || value === "todos") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  }

  function handleStatusChange(value: string): void {
    router.push(buildUrl({ status: value }));
  }

  function handleSearchChange(value: string): void {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.push(buildUrl({ search: value }));
    }, 300);
  }

  return (
    <div
      className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6"
      data-testid="plans-table"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#2C2C2E] md:text-lg">
          Consulta operacional de planos
        </h3>
        <Filter className="h-5 w-5 text-[#6B6B6E]" aria-hidden="true" />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row md:gap-4">
        <Select value={initialStatus} onValueChange={handleStatusChange}>
          <SelectTrigger
            className="w-full sm:w-48"
            aria-label="Filtrar por status do plano"
          >
            <SelectValue placeholder="Status do plano" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6E]"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Buscar por tutor ou pet..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
            aria-label="Buscar planos"
          />
        </div>
      </div>

      {/* Table */}
      <div className="-mx-4 overflow-x-auto md:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B6B6E]">
                  Tutor
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B6B6E]">
                  Pet
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B6B6E]">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B6B6E]">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B6B6E]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr data-testid="plans-table-empty">
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-[#6B6B6E]"
                  >
                    Nenhum plano encontrado para os filtros aplicados.
                  </td>
                </tr>
              ) : (
                data.map((plan) => (
                  <tr
                    key={plan.id}
                    data-testid="plans-table-row"
                    className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-[#F4F9F7]"
                    onClick={() => onSelectPlan(plan)}
                  >
                    <td className="px-4 py-3 text-sm text-[#2C2C2E]">
                      {plan.clientName}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#2C2C2E]">
                      {plan.petName}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${planStatusStyles[plan.status]}`}
                      >
                        {planStatusLabels[plan.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#2C2C2E]">
                      {formatDate(plan.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#4E8C75] hover:bg-[#EAF4F0]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPlan(plan);
                        }}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-[#6B6B6E]">
        <span data-testid="plans-table-total">
          {meta.total} {meta.total === 1 ? "plano" : "planos"} no total
        </span>
        <span>
          Página {meta.page} de {Math.max(meta.totalPages, 1)}
        </span>
      </div>
    </div>
  );
}
