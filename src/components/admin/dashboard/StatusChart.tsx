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

const data = [
  { date: "02/04", ativos: 145, carencia: 23, inadimplentes: 8 },
  { date: "03/04", ativos: 148, carencia: 21, inadimplentes: 7 },
  { date: "04/04", ativos: 152, carencia: 19, inadimplentes: 6 },
  { date: "05/04", ativos: 155, carencia: 18, inadimplentes: 5 },
  { date: "06/04", ativos: 158, carencia: 20, inadimplentes: 7 },
  { date: "07/04", ativos: 161, carencia: 22, inadimplentes: 6 },
  { date: "08/04", ativos: 164, carencia: 21, inadimplentes: 5 },
  { date: "09/04", ativos: 167, carencia: 19, inadimplentes: 4 },
  { date: "10/04", ativos: 170, carencia: 18, inadimplentes: 6 },
  { date: "11/04", ativos: 173, carencia: 17, inadimplentes: 5 },
  { date: "12/04", ativos: 176, carencia: 16, inadimplentes: 4 },
  { date: "13/04", ativos: 179, carencia: 15, inadimplentes: 3 },
  { date: "14/04", ativos: 182, carencia: 14, inadimplentes: 4 },
  { date: "15/04", ativos: 185, carencia: 13, inadimplentes: 3 },
];

export function StatusChart() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
      <h3 className="mb-4 text-base font-semibold text-[#2C2C2E] md:text-lg">
        Status de planos — últimos 14 dias
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="date" stroke="#6B6B6E" fontSize={12} />
          <YAxis stroke="#6B6B6E" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="ativos" fill="#4E8C75" name="Ativos" radius={[4, 4, 0, 0]} />
          <Bar dataKey="carencia" fill="#D97706" name="Carência" radius={[4, 4, 0, 0]} />
          <Bar dataKey="inadimplentes" fill="#C94040" name="Inadimplentes" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
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
