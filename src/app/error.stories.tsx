/**
 * Storybook stories for the root Error boundary component.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import * as React from "react";
import Error from "./error";

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: "App/ErrorBoundary",
  component: Error,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story type helper (minimal — no @storybook/react dependency)
// ---------------------------------------------------------------------------

type Story = {
  render?: () => React.ReactElement;
  name?: string;
};

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeError(message: string, stack?: string): Error & { digest?: string } {
  const e = new globalThis.Error(message);
  if (stack) e.stack = stack;
  return e;
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Erro genérico com requestId gerado automaticamente */
export const Default: Story = {
  name: "Default — erro genérico",
  render: () => (
    <Error
      error={makeError("Something went wrong")}
      reset={() => alert("reset() called")}
    />
  ),
};

/** requestId visível ao usuário para cópia e repasse ao suporte */
export const WithRequestId: Story = {
  name: "Com requestId exposto",
  render: () => (
    <Error
      error={makeError(
        "Network timeout while fetching plan data",
        "Error: Network timeout\n    at fetch (<anonymous>:1:1)",
      )}
      reset={() => alert("reset() called")}
    />
  ),
};

/**
 * Simula janela anônima recém-aberta onde sessionStorage está vazio — o
 * componente deve gerar um requestId fresh sem lançar exceção.
 */
export const WithoutRequestId: Story = {
  name: "Sem requestId pré-existente (sessionStorage limpo)",
  render: () => {
    // Limpa sessionStorage antes de renderizar para simular nova aba anônima
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem("latemia.attemptId");
    }
    return (
      <Error
        error={makeError("Unexpected render failure")}
        reset={() => alert("reset() called")}
      />
    );
  },
};

/** Mensagem de erro longa para validar layout responsivo */
export const WithLongMessage: Story = {
  name: "Com mensagem de erro longa",
  render: () => (
    <Error
      error={makeError(
        "Failed to process request: upstream service returned HTTP 503 Service Unavailable after exhausting all retry attempts. Please check your network connection and try again in a few minutes. If this problem persists, contact our support team with the tracking code shown below.",
      )}
      reset={() => alert("reset() called")}
    />
  ),
};
