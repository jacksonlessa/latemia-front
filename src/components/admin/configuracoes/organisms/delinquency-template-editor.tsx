"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DelinquencyTemplateDto } from "@/lib/types/delinquency";

const LINK_PLACEHOLDER = "[LINK]";

const PREVIEW_SAMPLE = {
  tutorName: "Maria Silva",
  petName: "Rex",
  link: "https://latemia.com.br/atualizar-pagamento?token=exemplo",
};

/** Renders the sample-substituted text for the body preview. Never sent to the backend. */
function buildPreview(body: string): string {
  return body
    .split("[nome do tutor]")
    .join(PREVIEW_SAMPLE.tutorName)
    .split("[nome do pet]")
    .join(PREVIEW_SAMPLE.petName)
    .split(LINK_PLACEHOLDER)
    .join(PREVIEW_SAMPLE.link);
}

function stageLabel(stageDays: number): string {
  return `${stageDays} ${stageDays === 1 ? "dia" : "dias"} de atraso`;
}

type SaveTemplateAction = (
  stageDays: number,
  input: { title: string; body: string },
) => Promise<
  | { success: true; data: DelinquencyTemplateDto }
  | { success: false; error: { code: string; message: string } }
>;

function getServerErrorMessage(code: string): string {
  switch (code) {
    case "TEMPLATE_MISSING_LINK_PLACEHOLDER":
      return "O corpo da mensagem deve conter o placeholder [LINK].";
    case "TEMPLATE_NOT_FOUND":
      return "Estágio de template não encontrado.";
    case "UNAUTHORIZED":
      return "Sessão expirada. Faça login novamente.";
    default:
      return "Erro ao salvar o template. Tente novamente.";
  }
}

// ---------------------------------------------------------------------------
// DelinquencyTemplateCard — single stage card
// ---------------------------------------------------------------------------

interface DelinquencyTemplateCardProps {
  template: DelinquencyTemplateDto;
  saveAction: SaveTemplateAction;
  disabled?: boolean;
}

function DelinquencyTemplateCard({
  template,
  saveAction,
  disabled = false,
}: DelinquencyTemplateCardProps) {
  const [title, setTitle] = useState(template.title);
  const [body, setBody] = useState(template.body);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fieldId = `stage-${template.stageDays}`;
  const isDisabled = disabled || isPending;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    if (!body.includes(LINK_PLACEHOLDER)) {
      setValidationError(
        `O corpo da mensagem deve conter o placeholder ${LINK_PLACEHOLDER}.`,
      );
      return;
    }
    setValidationError(null);

    startTransition(async () => {
      const result = await saveAction(template.stageDays, { title, body });
      if (result.success) {
        setSuccessMessage("Template salvo com sucesso.");
      } else {
        setServerError(getServerErrorMessage(result.error.code));
      }
    });
  }

  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-[#2C2C2E]">
          {stageLabel(template.stageDays)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-label={`Editar template de ${stageLabel(template.stageDays)}`}
        >
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

          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-title`}>Título</Label>
            <Input
              id={`${fieldId}-title`}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSuccessMessage(null);
              }}
              disabled={isDisabled}
              maxLength={255}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-body`}>Corpo da mensagem</Label>
            <textarea
              id={`${fieldId}-body`}
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                setSuccessMessage(null);
                if (
                  validationError &&
                  e.target.value.includes(LINK_PLACEHOLDER)
                ) {
                  setValidationError(null);
                }
              }}
              rows={5}
              disabled={isDisabled}
              maxLength={4000}
              required
              aria-invalid={Boolean(validationError)}
              aria-describedby={
                validationError ? `${fieldId}-body-error` : undefined
              }
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-xs text-[#6B6B6E]">
              Use os placeholders [nome do tutor], [nome do pet] e{" "}
              {LINK_PLACEHOLDER} (obrigatório).
            </p>
            {validationError && (
              <p
                id={`${fieldId}-body-error`}
                role="alert"
                className="text-xs text-destructive"
              >
                {validationError}
              </p>
            )}
          </div>

          <div className="space-y-2 rounded-md border border-gray-100 bg-gray-50 p-3">
            <span className="text-xs font-medium text-[#6B6B6E]">
              Pré-visualização (exemplo, não enviado ao salvar)
            </span>
            <p className="whitespace-pre-wrap text-sm text-[#2C2C2E]">
              {buildPreview(body)}
            </p>
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
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// DelinquencyTemplateEditor — organism
// ---------------------------------------------------------------------------

interface DelinquencyTemplateEditorProps {
  templates: DelinquencyTemplateDto[];
  fetchError?: string | null;
  saveAction: SaveTemplateAction;
  disabled?: boolean;
}

export function DelinquencyTemplateEditor({
  templates,
  fetchError,
  saveAction,
  disabled = false,
}: DelinquencyTemplateEditorProps) {
  if (fetchError) {
    return (
      <p
        role="alert"
        className="rounded-md bg-red-50 px-4 py-3 text-sm text-destructive"
      >
        {fetchError}
      </p>
    );
  }

  if (templates.length === 0) {
    return (
      <p className="text-sm text-[#6B6B6E]">
        Nenhum template de mensagem configurado.
      </p>
    );
  }

  const sorted = [...templates].sort((a, b) => a.stageDays - b.stageDays);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {sorted.map((template) => (
        <DelinquencyTemplateCard
          key={template.stageDays}
          template={template}
          saveAction={saveAction}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
