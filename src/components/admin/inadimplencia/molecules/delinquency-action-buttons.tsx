"use client";

import { useState } from "react";
import { MessageCircle, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generateClientPaymentUpdateTokenUseCase,
} from "@/domain/client/generate-client-payment-update-token.use-case";
import {
  recordDelinquencyDispatchUseCase,
  StageNotApplicableError,
} from "@/domain/delinquency/record-delinquency-dispatch.use-case";
import { ApiError } from "@/lib/api-errors";
import type {
  DelinquencyTemplateDto,
} from "@/lib/types/delinquency";

// ---------------------------------------------------------------------------
// Message rendering
// ---------------------------------------------------------------------------

interface RenderMessageInput {
  templateBody: string;
  tutorName: string;
  petNames: string[];
  linkUrl: string;
}

/**
 * Substitutes the fixed placeholders `[nome do tutor]`, `[nome do pet]` and
 * `[LINK]` in a template body with the client's already-loaded data. No
 * extra API call is made for the substitution itself — only `[LINK]` may
 * require generating a payment-update token beforehand (see
 * `ensureLinkUrl`).
 */
export function renderDelinquencyMessage({
  templateBody,
  tutorName,
  petNames,
  linkUrl,
}: RenderMessageInput): string {
  const petLabel = petNames.length > 0 ? petNames.join(", ") : "seu pet";

  return templateBody
    .split("[nome do tutor]")
    .join(tutorName)
    .split("[nome do pet]")
    .join(petLabel)
    .split("[LINK]")
    .join(linkUrl);
}

// ---------------------------------------------------------------------------
// DelinquencyActionButtons — Molecule
// ---------------------------------------------------------------------------

export interface DelinquencyActionButtonsClient {
  clientId: string;
  clientName: string;
  clientPhone: string;
  petNames: string[];
  applicableStage: number;
}

interface DelinquencyActionButtonsProps {
  client: DelinquencyActionButtonsClient;
  /** Template of the client's currently applicable stage. */
  template: DelinquencyTemplateDto;
  /** Called after a successful dispatch (either channel). */
  onDispatched?: () => void;
  /**
   * Called when the backend rejects the dispatch with 422
   * `STAGE_NOT_APPLICABLE` — the parent should reload this client's row.
   */
  onStageNotApplicable?: () => void;
  /**
   * Optional external overrides — used by Storybook to freeze the
   * loading/error states without performing real network calls.
   */
  isSendingWhatsApp?: boolean;
  isCopying?: boolean;
  errorMessage?: string | null;
}

/**
 * DelinquencyActionButtons — Molecule
 *
 * Renders the "Abrir WhatsApp" (primary) and "Copiar mensagem" (secondary)
 * actions for a client's currently applicable delinquency-message stage.
 *
 * Flow for both actions:
 * 1. Ensure a payment-update link is available (generate one via
 *    `generateClientPaymentUpdateTokenUseCase` on first use in this
 *    component's lifetime; cached locally afterward so a second click does
 *    not invalidate the link just generated for the first).
 * 2. Render the template body substituting the fixed placeholders.
 * 3. Register the dispatch (`POST .../dispatches`) — awaited BEFORE
 *    opening the WhatsApp link or writing to the clipboard, so the record
 *    is not lost if the user closes the tab.
 * 4. Open `wa.me` / copy the text.
 *
 * On `STAGE_NOT_APPLICABLE` (422), surfaces an inline error and asks the
 * parent to reload the row via `onStageNotApplicable`.
 */
export function DelinquencyActionButtons({
  client,
  template,
  onDispatched,
  onStageNotApplicable,
  isSendingWhatsApp: isSendingWhatsAppProp,
  isCopying: isCopyingProp,
  errorMessage: errorMessageProp,
}: DelinquencyActionButtonsProps) {
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [isSendingWhatsAppInternal, setIsSendingWhatsApp] = useState(false);
  const [isCopyingInternal, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessageInternal, setErrorMessage] = useState<string | null>(null);

  const isSendingWhatsApp = isSendingWhatsAppProp ?? isSendingWhatsAppInternal;
  const isCopying = isCopyingProp ?? isCopyingInternal;
  const errorMessage = errorMessageProp ?? errorMessageInternal;

  async function ensureLinkUrl(): Promise<string> {
    if (linkUrl) return linkUrl;
    const result = await generateClientPaymentUpdateTokenUseCase(
      client.clientId,
    );
    setLinkUrl(result.url);
    return result.url;
  }

  function buildMessage(url: string): string {
    return renderDelinquencyMessage({
      templateBody: template.body,
      tutorName: client.clientName,
      petNames: client.petNames,
      linkUrl: url,
    });
  }

  function handleKnownError(err: unknown): void {
    if (err instanceof StageNotApplicableError) {
      setErrorMessage(err.message);
      onStageNotApplicable?.();
      return;
    }
    if (err instanceof ApiError) {
      setErrorMessage("Não foi possível registrar o disparo. Tente novamente.");
      return;
    }
    setErrorMessage("Ocorreu um erro inesperado. Tente novamente.");
  }

  async function handleOpenWhatsApp() {
    setErrorMessage(null);
    setIsSendingWhatsApp(true);
    try {
      const url = await ensureLinkUrl();
      const message = buildMessage(url);

      await recordDelinquencyDispatchUseCase(client.clientId, {
        stageDays: client.applicableStage,
        channel: "whatsapp_link",
      });

      const phoneDigits = client.clientPhone.replace(/\D/g, "");
      const waUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");

      onDispatched?.();
    } catch (err) {
      handleKnownError(err);
    } finally {
      setIsSendingWhatsApp(false);
    }
  }

  async function handleCopyMessage() {
    setErrorMessage(null);
    setIsCopying(true);
    try {
      const url = await ensureLinkUrl();
      const message = buildMessage(url);

      await recordDelinquencyDispatchUseCase(client.clientId, {
        stageDays: client.applicableStage,
        channel: "manual_copy",
      });

      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(message);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      onDispatched?.();
    } catch (err) {
      handleKnownError(err);
    } finally {
      setIsCopying(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={handleOpenWhatsApp}
          disabled={isSendingWhatsApp || isCopying}
          aria-busy={isSendingWhatsApp}
          className="bg-[#4E8C75] text-white hover:bg-[#3d7260]"
        >
          {isSendingWhatsApp ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>Abrir WhatsApp</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleCopyMessage}
          disabled={isSendingWhatsApp || isCopying}
          aria-busy={isCopying}
          className="border-[#4E8C75] text-[#4E8C75] hover:bg-[#EAF4F0] hover:text-[#4E8C75]"
        >
          {isCopying ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : copied ? (
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>{copied ? "Copiado!" : "Copiar mensagem"}</span>
        </Button>
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="max-w-xs text-right text-xs text-red-600"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
