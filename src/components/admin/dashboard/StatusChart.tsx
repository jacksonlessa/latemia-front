"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DashboardStatusChartPoint } from "@/lib/types/dashboard";

interface StatusChartProps {
  /** Pontos vindos de `/v1/admin/dashboard/status-chart` (até 14). */
  data: DashboardStatusChartPoint[];
}

/** Converte `YYYY-MM-DD` para `DD/MM`. */
function formatDateTick(value: string): string {
  // Esperado: "2026-04-30" → "30/04"
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  return `${parts[2]}/${parts[1]}`;
}

export function StatusChart({ data }: StatusChartProps) {
  const isEmpty = data.length === 0;

  return (
    <div
      className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6"
      data-testid="status-chart"
    >
      <h3 className="mb-4 text-base font-semibold text-[#2C2C2E] md:text-lg">
        Status de planos — últimos 14 dias
      </h3>
      {isEmpty ? (
        <div
          className="flex h-[300px] items-center justify-center text-sm text-[#6B6B6E]"
          data-testid="status-chart-empty"
        >
          Sem dados históricos
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              stroke="#6B6B6E"
              fontSize={12}
              tickFormatter={formatDateTick}
            />
            <YAxis stroke="#6B6B6E" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
              }}
              labelFormatter={(label) =>
                typeof label === "string" ? formatDateTick(label) : String(label ?? "")
              }
            />
            <Bar dataKey="ativos" fill="#4E8C75" name="Ativos" radius={[4, 4, 0, 0]} />
            <Bar dataKey="carencia" fill="#D97706" name="Carência" radius={[4, 4, 0, 0]} />
            <Bar dataKey="inadimplentes" fill="#C94040" name="Inadimplentes" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-[#4E8C75]" />
          <span className="text-sm text-[#6B6B6E]">Ativos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-[#D97706]" />
          <span className="text-sm text-[#6B6B6E]">Carência</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-[#C94040]" />
          <span className="text-sm text-[#6B6B6E]">Inadimplentes</span>
        </div>
      </div>
    </div>
  );
}
