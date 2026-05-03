'use client';

/**
 * /atualizar-pagamento?token=<uuid>
 *
 * Public page for updating a subscription's payment method.
 * Accessible without login — the token is the sole authorization mechanism.
 *
 * The inner Client Component (`AtualizarPagamentoClient`) reads the query
 * param via `useSearchParams()`. The Suspense boundary is required in
 * Next.js 15 App Router when `useSearchParams()` is used inside a Client
 * Component that is rendered as a page.
 *
 * LGPD: the page does not display CPF, phone, or email.
 */

import { Suspense } from 'react';
import { AtualizarPagamentoClient } from '@/components/public/payment-update/atualizar-pagamento-client';

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <div
        className="h-10 w-10 rounded-full border-4 border-[#4E8C75] border-t-transparent animate-spin"
        aria-label="Carregando…"
        role="status"
      />
      <p className="text-sm text-muted-foreground">Carregando…</p>
    </div>
  );
}

export default function AtualizarPagamentoPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <div className="mb-8 text-center space-y-1">
        <h1 className="font-display text-2xl text-forest">
          Atualizar forma de pagamento
        </h1>
        <p className="text-sm text-muted-foreground">
          Late &amp; Mia — Plano de Emergência Veterinária
        </p>
      </div>

      <Suspense fallback={<LoadingFallback />}>
        <AtualizarPagamentoClient />
      </Suspense>
    </main>
  );
}
