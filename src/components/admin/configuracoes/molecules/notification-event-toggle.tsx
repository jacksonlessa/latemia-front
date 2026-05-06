"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import type {
  NotificationEventConfigDto,
  NotificationEventType,
} from "@/lib/types/notifications";

const EVENT_LABELS: Record<NotificationEventType, string> = {
  "plan.created": "Plano criado",
  "plan.statusChanged": "Status do plano alterado",
  "plan.paymentFailed": "Falha no pagamento",
  "plan.renewed": "Plano renovado",
};

const EVENT_DESCRIPTIONS: Record<NotificationEventType, string> = {
  "plan.created": "Avisar quando um novo plano for contratado.",
  "plan.statusChanged": "Avisar a cada transição de status do plano.",
  "plan.paymentFailed": "Avisar quando uma cobrança falhar.",
  "plan.renewed": "Avisar quando um plano for renovado com sucesso.",
};

type ToggleAction = (
  type: NotificationEventType,
  enabled: boolean,
) => Promise<
  | { success: true; data: NotificationEventConfigDto }
  | { success: false; error: { code: string; message: string } }
>;

interface NotificationEventToggleProps {
  config: NotificationEventConfigDto;
  toggleAction: ToggleAction;
  disabled?: boolean;
  onMessage?: (message: { kind: "success" | "error"; text: string }) => void;
}

export function NotificationEventToggle({
  config,
  toggleAction,
  disabled = false,
  onMessage,
}: NotificationEventToggleProps) {
  const [enabled, setEnabled] = useState(config.enabled);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: boolean) {
    const previous = enabled;
    setEnabled(next);
    startTransition(async () => {
      const result = await toggleAction(config.type, next);
      if (result.success) {
        onMessage?.({
          kind: "success",
          text: `Evento "${EVENT_LABELS[config.type]}" ${next ? "ativado" : "desativado"}.`,
        });
      } else {
        // revert on error
        setEnabled(previous);
        onMessage?.({
          kind: "error",
          text:
            result.error.message ||
            "Não foi possível atualizar o evento. Tente novamente.",
        });
      }
    });
  }

  const switchId = `notif-event-${config.type}`;

  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-gray-100 bg-white p-4">
      <div className="flex flex-1 flex-col gap-1">
        <label
          htmlFor={switchId}
          className="cursor-pointer text-sm font-medium text-[#2C2C2E]"
        >
          {EVENT_LABELS[config.type]}
        </label>
        <p className="text-xs text-[#6B6B6E]">
          {EVENT_DESCRIPTIONS[config.type]}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isPending && (
          <span
            aria-live="polite"
            className="text-xs text-[#6B6B6E]"
            role="status"
          >
            Salvando...
          </span>
        )}
        <Switch
          id={switchId}
          checked={enabled}
          onCheckedChange={handleChange}
          disabled={disabled || isPending}
          aria-label={`Alternar evento ${EVENT_LABELS[config.type]}`}
        />
      </div>
    </div>
  );
}
