"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
    case "INVALID_OTP_CONTRACT_ENABLED":
      return "Valor inválido para o OTP do contrato. Tente novamente.";
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
  const [subscriptionPlanId, setSubscriptionPlanId] = useState<string>(
    initialValues?.subscription_plan_id ?? "",
  );
  const [subscriptionPlanPriceCents, setSubscriptionPlanPriceCents] = useState<number>(
    parseInt(initialValues?.subscription_plan_price_cents ?? "0", 10) || 0,
  );
  const [otpContractEnabled, setOtpContractEnabled] = useState<boolean>(
    initialValues?.otp_contract_enabled === "true",
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const savedPriceCents = parseInt(savedValues?.subscription_plan_price_cents ?? "0", 10) || 0;
  const savedOtpEnabled = savedValues?.otp_contract_enabled === "true";
  const isDirty =
    paymentProvider !== (savedValues?.payment_provider ?? "") ||
    subscriptionPlanId !== (savedValues?.subscription_plan_id ?? "") ||
    subscriptionPlanPriceCents !== savedPriceCents ||
    otpContractEnabled !== savedOtpEnabled;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const payload: UpdateSystemSettingsInput = {};
    if (paymentProvider) payload.payment_provider = paymentProvider;
    if (subscriptionPlanId) payload.subscription_plan_id = subscriptionPlanId;
    if (subscriptionPlanPriceCents > 0) payload.subscription_plan_price_cents = subscriptionPlanPriceCents;
    // Sempre enviar a flag — string literal 'true'/'false'. Diferente dos demais
    // campos, a flag é booleana e ambos os valores são significativos.
    if (otpContractEnabled !== savedOtpEnabled) {
      payload.otp_contract_enabled = otpContractEnabled ? "true" : "false";
    }

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
        <Label htmlFor="subscription_plan_id">ID do Plano de Assinatura</Label>
        <Input
          id="subscription_plan_id"
          type="text"
          value={subscriptionPlanId}
          onChange={(e) => {
            setSubscriptionPlanId(e.target.value);
            setSuccessMessage(null);
          }}
          placeholder="Ex: plan_abc123"
          disabled={isPending}
          aria-describedby="subscription_plan_id_help"
        />
        <p id="subscription_plan_id_help" className="text-xs text-muted-foreground">
          Copie o ID do plano shell (com item placeholder de preço 0) criado em{" "}
          <a
            href="/admin/configuracoes/planos-assinatura"
            className="text-[#4E8C75] underline underline-offset-4 hover:opacity-80"
          >
            Planos de Assinatura
          </a>
          .
        </p>
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

      <div className="space-y-3 rounded-md border border-gray-100 bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <Label
              htmlFor="otp_contract_enabled"
              className="cursor-pointer text-sm font-medium text-[#2C2C2E]"
            >
              OTP no aceite do contrato
            </Label>
            <p
              id="otp_contract_enabled_help"
              className="text-xs text-[#6B6B6E]"
            >
              Quando ativado, o cliente recebe um código SMS de 6 dígitos antes
              de assinar o contrato. Necessário para fluxos com formalidade
              reforçada.
            </p>
          </div>
          <Switch
            id="otp_contract_enabled"
            checked={otpContractEnabled}
            onCheckedChange={(next) => {
              setOtpContractEnabled(next);
              setSuccessMessage(null);
            }}
            disabled={isPending}
            aria-describedby="otp_contract_enabled_help"
            aria-label="Ativar OTP no aceite do contrato"
            className="data-[state=checked]:bg-[#4E8C75]"
          />
        </div>
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
