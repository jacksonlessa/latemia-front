"use client";

/**
 * Global error boundary (root-level).
 *
 * This boundary fires only when the root layout itself crashes — an extremely
 * rare scenario.  Per Next.js 15 contract it must redeclare <html> and <body>
 * because the root layout is unavailable.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error#global-errorjs
 */

import { useEffect, useState } from "react";
import { reportClientError } from "@/lib/observability/client-error-reporter";
import { getOrCreateAttemptId } from "@/lib/observability/request-id";
import { hashStack } from "@/lib/observability/stack-hash";
import { SUPPORT_WHATSAPP_URL } from "@/lib/contact";

export default function GlobalError({
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
        stage: "global-render",
        message: error.message,
        stackHash,
      }),
    );
  }, [error, requestId]);

  function handleCopy() {
    navigator.clipboard.writeText(requestId);
  }

  return (
    <html lang="pt-BR">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
            fontFamily: "sans-serif",
          }}
        >
          <h1
            style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}
          >
            Erro inesperado
          </h1>
          <p style={{ color: "#4b5563", marginBottom: "1.5rem" }}>
            Algo deu errado no sistema. Copie o código abaixo e entre em
            contato com o suporte se o problema persistir.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#f3f4f6",
              borderRadius: "0.25rem",
              padding: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            <code style={{ fontFamily: "monospace", fontSize: "0.875rem" }}>
              {requestId}
            </code>
            <button
              onClick={handleCopy}
              style={{
                fontSize: "0.75rem",
                color: "#2563eb",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
              }}
              type="button"
              aria-label="Copiar código de rastreamento"
            >
              Copiar
            </button>
          </div>

          <a
            href={SUPPORT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#4E8C75",
              fontSize: "0.875rem",
              marginBottom: "1rem",
              textDecoration: "underline",
            }}
          >
            Falar com o suporte
          </a>

          <button
            onClick={reset}
            style={{
              padding: "0.5rem 1rem",
              background: "#4E8C75",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
            type="button"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
