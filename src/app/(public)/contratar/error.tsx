"use client";

/**
 * Segment-specific error boundary for the /contratar (checkout) flow.
 *
 * Uses payment-specific copy to guide the user on what to do after a failure
 * during plan subscription.
 */

import { useEffect, useState } from "react";
import { reportClientError } from "@/lib/observability/client-error-reporter";
import { getOrCreateAttemptId } from "@/lib/observability/request-id";
import { hashStack } from "@/lib/observability/stack-hash";
import { Button } from "@/components/ui/button";

export default function ContratarError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [requestId] = useState(() => getOrCreateAttemptId());

  useEffect(() => {
    hashStack(error.stack ?? "").then((stackHash) =>
      reportClientError({
        requestId,
        stage: "render:contratar",
        message: error.message,
        stackHash,
      }),
    );
  }, [error, requestId]);

  function handleCopy() {
    navigator.clipboard.writeText(requestId);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="mb-4 text-2xl font-bold text-gray-900">
        Não conseguimos completar seu pagamento
      </h1>
      <p className="mb-6 text-gray-600">
        Ocorreu um erro ao processar a sua assinatura. Copie o código abaixo e
        entre em contato com o nosso suporte — vamos te ajudar a concluir o
        plano.
      </p>

      <div className="mb-6 flex items-center gap-2 rounded bg-gray-100 p-3">
        <code className="font-mono text-sm text-gray-700">{requestId}</code>
        <button
          onClick={handleCopy}
          className="text-xs text-blue-600 hover:underline"
          type="button"
          aria-label="Copiar código de rastreamento"
        >
          Copiar
        </button>
      </div>

      <Button
        onClick={reset}
        className="bg-[#4E8C75] text-white hover:bg-[#3d6e5c]"
        type="button"
      >
        Tentar novamente
      </Button>
    </div>
  );
}
