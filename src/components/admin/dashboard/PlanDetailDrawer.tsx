"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Plan } from "./PlansTable";

interface PlanDetailDrawerProps {
  plan: Plan | null;
  onClose: () => void;
}

export function PlanDetailDrawer({ plan, onClose }: PlanDetailDrawerProps) {
  if (!plan) return null;

  const planStatusClass =
    plan.planStatus === "ativo"
      ? "bg-[#EAF4F0] text-[#4E8C75]"
      : plan.planStatus === "carencia"
        ? "bg-[#FEF3C7] text-[#D97706]"
        : plan.planStatus === "cancelado"
          ? "bg-[#FDECEA] text-[#C94040]"
          : "bg-[#F0F0F0] text-[#2C2C2E]";

  const paymentStatusClass =
    plan.paymentStatus === "confirmado"
      ? "bg-[#EAF4F0] text-[#4E8C75]"
      : plan.paymentStatus === "pendente"
        ? "bg-[#FEF3C7] text-[#D97706]"
        : "bg-[#FDECEA] text-[#C94040]";

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="animate-in slide-in-from-right fixed right-0 top-0 z-50 h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4 md:p-6">
          <h2 className="text-lg font-semibold text-[#2C2C2E] md:text-xl">
            Detalhes do Plano
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-4 md:p-6">
          {/* Basic Info */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-[#6B6B6E]">
              Informações Básicas
            </h3>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-sm text-[#6B6B6E]">ID do Plano</span>
                <span className="text-sm font-medium text-[#2C2C2E]">
                  #{plan.id.padStart(6, "0")}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-[#6B6B6E]">Tutor</span>
                <span className="text-sm font-medium text-[#2C2C2E]">{plan.tutor}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-[#6B6B6E]">Pet</span>
                <span className="text-sm font-medium text-[#2C2C2E]">{plan.pet}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-[#6B6B6E]">Espécie</span>
                <span className="text-sm font-medium text-[#2C2C2E]">Cão</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-[#6B6B6E]">Raça</span>
                <span className="text-sm font-medium text-[#2C2C2E]">Golden Retriever</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-[#6B6B6E]">Idade</span>
                <span className="text-sm font-medium text-[#2C2C2E]">3 anos</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200" />

          {/* Plan Status */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-[#6B6B6E]">
              Status do Plano
            </h3>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-sm text-[#6B6B6E]">Status atual</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${planStatusClass}`}
                >
                  {plan.planStatus.charAt(0).toUpperCase() + plan.planStatus.slice(1)}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-[#6B6B6E]">Data de contratação</span>
                <span className="text-sm font-medium text-[#2C2C2E]">16/03/2026</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-[#6B6B6E]">Vigência até</span>
                <span className="text-sm font-medium text-[#2C2C2E]">{plan.validity}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-[#6B6B6E]">Tipo de plano</span>
                <span className="text-sm font-medium text-[#2C2C2E]">Plano Essencial</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200" />

          {/* Payment Info */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-[#6B6B6E]">
              Informações de Pagamento
            </h3>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-sm text-[#6B6B6E]">Status pagamento</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${paymentStatusClass}`}
                >
                  {plan.paymentStatus.charAt(0).toUpperCase() +
                    plan.paymentStatus.slice(1)}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-[#6B6B6E]">Valor mensal</span>
                <span className="text-sm font-medium text-[#2C2C2E]">R$ 180,00</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-[#6B6B6E]">Próximo vencimento</span>
                <span className="text-sm font-medium text-[#2C2C2E]">{plan.nextDue}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-[#6B6B6E]">Forma de pagamento</span>
                <span className="text-sm font-medium text-[#2C2C2E]">Cartão de crédito</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200" />

          {/* Contact Info */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-[#6B6B6E]">
              Contato do Tutor
            </h3>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-sm text-[#6B6B6E]">Telefone</span>
                <span className="text-sm font-medium text-[#2C2C2E]">(47) 99123-4567</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-[#6B6B6E]">E-mail</span>
                <span className="text-sm font-medium text-[#2C2C2E]">
                  {plan.tutor.toLowerCase().replace(" ", ".")}@email.com
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-[#6B6B6E]">CPF</span>
                <span className="text-sm font-medium text-[#2C2C2E]">123.456.789-00</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200" />

          {/* Usage History */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-[#6B6B6E]">
              Histórico de Uso
            </h3>
            <div className="space-y-2">
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="mb-1 flex items-start justify-between">
                  <span className="text-sm font-medium text-[#2C2C2E]">
                    Consulta emergencial
                  </span>
                  <span className="text-sm text-[#4E8C75]">R$ 250,00</span>
                </div>
                <span className="text-xs text-[#6B6B6E]">10/04/2026</span>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="mb-1 flex items-start justify-between">
                  <span className="text-sm font-medium text-[#2C2C2E]">
                    Exame laboratorial
                  </span>
                  <span className="text-sm text-[#4E8C75]">R$ 180,00</span>
                </div>
                <span className="text-xs text-[#6B6B6E]">25/03/2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
