"use client";

import { Eye, Filter } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Plan {
  id: string;
  tutor: string;
  pet: string;
  planStatus: "ativo" | "carencia" | "cancelado" | "suspenso";
  paymentStatus: "confirmado" | "pendente" | "atrasado";
  validity: string;
  nextDue: string;
}

const mockPlans: Plan[] = [
  { id: "1", tutor: "João Silva", pet: "Rex", planStatus: "ativo", paymentStatus: "confirmado", validity: "12/04/2026", nextDue: "12/05/2026" },
  { id: "2", tutor: "Maria Santos", pet: "Luna", planStatus: "carencia", paymentStatus: "confirmado", validity: "08/05/2026", nextDue: "08/05/2026" },
  { id: "3", tutor: "Carlos Souza", pet: "Bolt", planStatus: "ativo", paymentStatus: "pendente", validity: "20/03/2027", nextDue: "20/04/2026" },
  { id: "4", tutor: "Ana Paula", pet: "Mel", planStatus: "ativo", paymentStatus: "atrasado", validity: "15/01/2027", nextDue: "13/04/2026" },
  { id: "5", tutor: "Pedro Lima", pet: "Thor", planStatus: "ativo", paymentStatus: "confirmado", validity: "22/06/2026", nextDue: "22/05/2026" },
  { id: "6", tutor: "Juliana Costa", pet: "Nina", planStatus: "carencia", paymentStatus: "confirmado", validity: "30/04/2026", nextDue: "30/04/2026" },
  { id: "7", tutor: "Roberto Alves", pet: "Max", planStatus: "ativo", paymentStatus: "confirmado", validity: "05/08/2026", nextDue: "05/05/2026" },
  { id: "8", tutor: "Fernanda Rocha", pet: "Laika", planStatus: "suspenso", paymentStatus: "atrasado", validity: "18/02/2027", nextDue: "10/04/2026" },
];

const planStatusStyles: Record<Plan["planStatus"], string> = {
  ativo: "bg-[#EAF4F0] text-[#4E8C75]",
  carencia: "bg-[#FEF3C7] text-[#D97706]",
  cancelado: "bg-[#FDECEA] text-[#C94040]",
  suspenso: "bg-[#F0F0F0] text-[#2C2C2E]",
};

const planStatusLabels: Record<Plan["planStatus"], string> = {
  ativo: "Ativo",
  carencia: "Carência",
  cancelado: "Cancelado",
  suspenso: "Suspenso",
};

const paymentStatusStyles: Record<Plan["paymentStatus"], string> = {
  confirmado: "bg-[#EAF4F0] text-[#4E8C75]",
  pendente: "bg-[#FEF3C7] text-[#D97706]",
  atrasado: "bg-[#FDECEA] text-[#C94040]",
};

const paymentStatusLabels: Record<Plan["paymentStatus"], string> = {
  confirmado: "Confirmado",
  pendente: "Pendente",
  atrasado: "Atrasado",
};

interface PlansTableProps {
  onViewPlan: (plan: Plan) => void;
}

export function PlansTable({ onViewPlan }: PlansTableProps) {
  const [planStatusFilter, setPlanStatusFilter] = useState<string>("todos");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("todos");

  const filteredPlans = mockPlans.filter((plan) => {
    if (planStatusFilter !== "todos" && plan.planStatus !== planStatusFilter)
      return false;
    if (paymentStatusFilter !== "todos" && plan.paymentStatus !== paymentStatusFilter)
      return false;
    return true;
  });

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#2C2C2E] md:text-lg">
          Consulta operacional de planos
        </h3>
        <Filter className="h-5 w-5 text-[#6B6B6E]" />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row md:gap-4">
        <Select value={planStatusFilter} onValueChange={setPlanStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status do plano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="carencia">Carência</SelectItem>
            <SelectItem value="suspenso">Suspenso</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status de pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="atrasado">Atrasado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="-mx-4 overflow-x-auto md:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B6B6E]">Tutor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B6B6E]">Pet</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B6B6E]">Status do plano</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B6B6E]">Status pagamento</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B6B6E]">Vigência</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B6B6E]">Próximo vencimento</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#6B6B6E]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.map((plan) => (
                <tr
                  key={plan.id}
                  className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-[#F4F9F7]"
                  onClick={() => onViewPlan(plan)}
                >
                  <td className="px-4 py-3 text-sm text-[#2C2C2E]">{plan.tutor}</td>
                  <td className="px-4 py-3 text-sm text-[#2C2C2E]">{plan.pet}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${planStatusStyles[plan.planStatus]}`}
                    >
                      {planStatusLabels[plan.planStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${paymentStatusStyles[plan.paymentStatus]}`}
                    >
                      {paymentStatusLabels[plan.paymentStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#2C2C2E]">{plan.validity}</td>
                  <td className="px-4 py-3 text-sm text-[#2C2C2E]">{plan.nextDue}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#4E8C75] hover:bg-[#EAF4F0]"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewPlan(plan);
                      }}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
