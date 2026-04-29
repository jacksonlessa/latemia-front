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
import type { QuietHoursDto } from "@/lib/types/notifications";

const TIMEZONE_OPTIONS = [
  { value: "America/Sao_Paulo", label: "America/Sao_Paulo (BRT)" },
  { value: "America/Manaus", label: "America/Manaus (AMT)" },
  { value: "America/Belem", label: "America/Belem" },
  { value: "America/Fortaleza", label: "America/Fortaleza" },
  { value: "America/Recife", label: "America/Recife" },
  { value: "America/Cuiaba", label: "America/Cuiaba" },
  { value: "America/Noronha", label: "America/Noronha" },
  { value: "America/Bahia", label: "America/Bahia" },
];

const HHMM_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function getServerErrorMessage(code: string): string {
  switch (code) {
    case "INVALID_QUIET_HOURS_RANGE":
      return "Faixa de horários inválida. Verifique início e fim.";
    case "INVALID_TIMEZONE":
      return "Fuso horário inválido. Selecione um valor IANA válido.";
    case "UNAUTHORIZED":
      return "Sessão expirada. Faça login novamente.";
    default:
      return "Erro ao salvar a janela de silêncio. Tente novamente.";
  }
}

type SaveQuietHoursAction = (
  payload: QuietHoursDto,
) => Promise<
  | { success: true; data: QuietHoursDto }
  | { success: false; error: { code: string; message: string } }
>;

interface QuietHoursFormProps {
  initialValues: QuietHoursDto | null;
  saveAction: SaveQuietHoursAction;
  fetchError?: string | null;
  disabled?: boolean;
}

const DEFAULTS: QuietHoursDto = {
  enabled: false,
  start: "22:00",
  end: "07:00",
  timezone: "America/Sao_Paulo",
};

export function QuietHoursForm({
  initialValues,
  saveAction,
  fetchError,
  disabled = false,
}: QuietHoursFormProps) {
  const seed = initialValues ?? DEFAULTS;
  const [enabled, setEnabled] = useState(seed.enabled);
  const [start, setStart] = useState(seed.start);
  const [end, setEnd] = useState(seed.end);
  const [timezone, setTimezone] = useState(seed.timezone || "America/Sao_Paulo");
  const [customTimezone, setCustomTimezone] = useState(
    TIMEZONE_OPTIONS.some((opt) => opt.value === seed.timezone)
      ? ""
      : seed.timezone,
  );
  const [validationErrors, setValidationErrors] = useState<{
    start?: string;
    end?: string;
    timezone?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isCustomTz = timezone === "__custom__";
  const effectiveTimezone = isCustomTz ? customTimezone.trim() : timezone;

  function validate(): boolean {
    const errors: typeof validationErrors = {};
    if (!HHMM_REGEX.test(start)) {
      errors.start = "Use o formato HH:MM (ex.: 22:00).";
    }
    if (!HHMM_REGEX.test(end)) {
      errors.end = "Use o formato HH:MM (ex.: 07:00).";
    }
    if (!effectiveTimezone) {
      errors.timezone = "Informe um fuso horário.";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);
    if (!validate()) return;

    const payload: QuietHoursDto = {
      enabled,
      start,
      end,
      timezone: effectiveTimezone,
    };

    startTransition(async () => {
      const result = await saveAction(payload);
      if (result.success) {
        setSuccessMessage("Janela de silêncio salva com sucesso.");
      } else {
        setServerError(getServerErrorMessage(result.error.code));
      }
    });
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-sm text-destructive" role="alert">
          {fetchError}
        </p>
      </div>
    );
  }

  const isDisabled = disabled || isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-4 md:p-6">
      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {successMessage}
        </div>
      )}
      {serverError && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-md bg-red-50 px-4 py-3 text-sm text-destructive"
        >
          {serverError}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 rounded-md border border-gray-100 p-3">
        <div className="flex flex-col">
          <Label htmlFor="quiet-hours-enabled" className="cursor-pointer">
            Janela de silêncio ativa
          </Label>
          <span className="text-xs text-[#6B6B6E]">
            Quando ativa, mensagens são acumuladas no buffer e enviadas em
            resumo ao fim da janela.
          </span>
        </div>
        <Switch
          id="quiet-hours-enabled"
          checked={enabled}
          onCheckedChange={setEnabled}
          disabled={isDisabled}
          aria-label="Ativar janela de silêncio"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="quiet-hours-start">Início (HH:MM)</Label>
          <Input
            id="quiet-hours-start"
            type="text"
            inputMode="numeric"
            placeholder="22:00"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            disabled={isDisabled}
            aria-invalid={Boolean(validationErrors.start)}
            aria-describedby={
              validationErrors.start ? "quiet-hours-start-error" : undefined
            }
          />
          {validationErrors.start && (
            <p
              id="quiet-hours-start-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {validationErrors.start}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quiet-hours-end">Fim (HH:MM)</Label>
          <Input
            id="quiet-hours-end"
            type="text"
            inputMode="numeric"
            placeholder="07:00"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            disabled={isDisabled}
            aria-invalid={Boolean(validationErrors.end)}
            aria-describedby={
              validationErrors.end ? "quiet-hours-end-error" : undefined
            }
          />
          {validationErrors.end && (
            <p
              id="quiet-hours-end-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {validationErrors.end}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quiet-hours-tz">Fuso horário</Label>
        <Select
          value={timezone}
          onValueChange={(v) => setTimezone(v)}
          disabled={isDisabled}
        >
          <SelectTrigger id="quiet-hours-tz" aria-label="Fuso horário">
            <SelectValue placeholder="Selecione um fuso" />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
            <SelectItem value="__custom__">Outro (digitar)</SelectItem>
          </SelectContent>
        </Select>
        {isCustomTz && (
          <Input
            type="text"
            placeholder="Ex.: America/Argentina/Buenos_Aires"
            value={customTimezone}
            onChange={(e) => setCustomTimezone(e.target.value)}
            disabled={isDisabled}
            aria-label="Fuso horário customizado (IANA)"
            aria-invalid={Boolean(validationErrors.timezone)}
          />
        )}
        {validationErrors.timezone && (
          <p role="alert" className="text-xs text-destructive">
            {validationErrors.timezone}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isDisabled}
          className="bg-[#4E8C75] text-white hover:bg-[#3d7060] disabled:opacity-50"
        >
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
