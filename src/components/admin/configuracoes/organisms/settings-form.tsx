"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoneyInput } from "@/components/admin/planos-assinatura/atoms/money-input/MoneyInput";
import type { SystemSettingsDto, UpdateSystemSettingsInput } from "@/lib/types/system-settings";

const PAYMENT_PROVIDER_OPTIONS = [
  { value: "pagarme", label: "Pagar.me" },
];

type SaveAction = (
  payload: UpdateSystemSettingsInput,
) => Promise<
  | { success: true; data: SystemSettingsDto }
  | { success: false; error: { code: string; message: string } }
>;

interface SettingsFormProps {
  initialValues: SystemSettingsDto | null;
  saveAction: SaveAction;
  fetchError?: string | null;
}

function getFeedbackMessage(code: string): string {
  switch (code) {
    case "INVALID_PAYMENT_PROVIDER":
      return "Provedor de pagamento inválido. Selecione uma opção válida.";
    case "INVALID_SUBSCRIPTION_PLAN_ID":
      return "ID do plano de assinatura inválido. Verifique o valor informado.";
    case "INVALID_SUBSCRIPTION_PLAN_PRICE":
      return "Preço do plano inválido. Informe um valor inteiro positivo em centavos.";
    case "EMPTY_UPDATE":
      return "Nenhuma alteração detectada. Modifique ao menos um campo antes de salvar.";
    case "UNAUTHORIZED":
      return "Sessão expirada. Faça login novamente.";
    default:
      return "Erro ao salvar as configurações. Tente novamente.";
  }
}

export function SettingsForm({ initialValues, saveAction, fetchError }: SettingsFormProps) {
  const [savedValues, setSavedValues] = useState(initialValues);
  const [paymentProvider, setPaymentProvider] = useState<string>(
    initialValues?.payment_provider ?? "",
  );
  const [subscriptionPlanPriceCents, setSubscriptionPlanPriceCents] = useState<number>(
    parseInt(initialValues?.subscription_plan_price_cents ?? "0", 10) || 0,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const savedPriceCents = parseInt(savedValues?.subscription_plan_price_cents ?? "0", 10) || 0;
  const isDirty =
    paymentProvider !== (savedValues?.payment_provider ?? "") ||
    subscriptionPlanPriceCents !== savedPriceCents;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const payload: UpdateSystemSettingsInput = {};
    if (paymentProvider) payload.payment_provider = paymentProvider;
    if (subscriptionPlanPriceCents > 0) payload.subscription_plan_price_cents = subscriptionPlanPriceCents;

    startTransition(async () => {
      const result = await saveAction(payload);
      if (result.success) {
        setSavedValues(result.data);
        setSuccessMessage("Configurações salvas com sucesso.");
      } else {
        setErrorMessage(getFeedbackMessage(result.error.code));
      }
    });
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <p className="text-sm text-destructive" role="alert">
          {fetchError}
        </p>
        <a
          href="/admin/configuracoes"
          className="text-sm text-[#4E8C75] underline underline-offset-4 hover:opacity-80"
        >
          Tentar novamente
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 md:p-6">
      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div
          id="settings-error"
          role="alert"
          aria-live="assertive"
          className="rounded-md bg-red-50 px-4 py-3 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="payment_provider">Provedor de Pagamento</Label>
        <Select
          value={paymentProvider}
          onValueChange={(val) => {
            setPaymentProvider(val);
            setSuccessMessage(null);
          }}
          disabled={isPending}
        >
          <SelectTrigger id="payment_provider" aria-label="Provedor de Pagamento">
            <SelectValue placeholder="Selecione um provedor" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_PROVIDER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subscription_plan_price_cents">Preço Mensal por Pet</Label>
        <MoneyInput
          id="subscription_plan_price_cents"
          value={subscriptionPlanPriceCents}
          onChange={(cents) => {
            setSubscriptionPlanPriceCents(cents);
            setSuccessMessage(null);
          }}
          disabled={isPending}
          aria-describedby={errorMessage ? "settings-error" : undefined}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!isDirty || isPending}
          className="bg-[#4E8C75] text-white hover:bg-[#3d7060] disabled:opacity-50"
        >
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
