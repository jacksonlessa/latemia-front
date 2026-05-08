"use client";

import { useEffect, useState } from "react";
import { reportClientError } from "@/lib/observability/client-error-reporter";
import { getOrCreateAttemptId } from "@/lib/observability/request-id";
import { hashStack } from "@/lib/observability/stack-hash";
import { Button } from "@/components/ui/button";

export default function Error({
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
        stage: "render",
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
        Algo deu errado
      </h1>
      <p className="mb-6 text-gray-600">
        Ocorreu um erro inesperado. Se o problema persistir, copie o código
        abaixo e entre em contato com o nosso suporte.
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
