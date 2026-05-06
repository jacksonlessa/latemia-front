"use client";

import Link from "next/link";
import { ExternalLink, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { PlanStatusBadge } from "@/components/admin/planos/atoms/plan-status-badge/PlanStatusBadge";
import type { DrawerPlanDetail } from "@/lib/types/plan";

interface PlanDetailDrawerProps {
  /** When `null`, the drawer is closed; otherwise a fetch is triggered. */
  planId: string | null;
  onClose: () => void;
  /**
   * Optional fetcher injection point. Defaults to the internal Route Handler
   * `/api/admin/plans/:id` that proxies the call to the backend with the
   * httpOnly session cookie. Tests and Storybook stories override this to
   * exercise loading / error / success states without a real network call.
   */
  fetchPlan?: (planId: string, signal: AbortSignal) => Promise<DrawerPlanDetail>;
}

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; plan: DrawerPlanDetail };

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return dateTimeFormatter.format(d);
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return dateFormatter.format(d);
}

function formatAmountBRL(decimal: string): string {
  const value = Number(decimal);
  if (Number.isNaN(value)) return decimal;
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Default fetcher for the drawer. Calls the internal Next.js Route Handler
 * which forwards the request to `GET /v1/plans/:id` with the JWT bearer
 * extracted from the httpOnly session cookie.
 */
async function defaultFetchPlan(
  planId: string,
  signal: AbortSignal,
): Promise<DrawerPlanDetail> {
  const res = await fetch(`/api/admin/plans/${encodeURIComponent(planId)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    signal,
  });

  if (!res.ok) {
    let message = `Falha ao carregar o plano (HTTP ${res.status}).`;
    try {
      const body = (await res.json()) as { message?: string };
      if (typeof body.message === "string" && body.message.trim().length > 0) {
        message = body.message;
      }
    } catch {
      // non-JSON body — keep the default message
    }
    throw new Error(message);
  }

  return (await res.json()) as DrawerPlanDetail;
}

/**
 * Side panel that displays the full detail of a plan selected from the
 * dashboard's plans table. Drives its own fetch lifecycle: on `planId`
 * change it triggers a request, then renders loading skeleton, error
 * state, or the populated detail view.
 */
export function PlanDetailDrawer({
  planId,
  onClose,
  fetchPlan = defaultFetchPlan,
}: PlanDetailDrawerProps) {
  const [state, setState] = useState<FetchState | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (planId === null) {
      setState(null);
      return;
    }

    const controller = new AbortController();
    setState({ status: "loading" });

    fetchPlan(planId, controller.signal)
      .then((plan) => {
        if (!controller.signal.aborted) {
          setState({ status: "success", plan });
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message =
          err instanceof Error
            ? err.message
            : "Não foi possível carregar este plano.";
        setState({ status: "error", message });
      });

    return () => {
      controller.abort();
    };
  }, [planId, fetchPlan, retryToken]);

  if (planId === null || state === null) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
        data-testid="plan-detail-drawer-overlay"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Detalhes do plano"
        data-testid="plan-detail-drawer"
        className="animate-in slide-in-from-right fixed right-0 top-0 z-50 h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl duration-300"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4 md:p-6">
          <h2 className="text-lg font-semibold text-[#2C2C2E] md:text-xl">
            Detalhes do Plano
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {state.status === "loading" ? (
          <DrawerLoadingSkeleton />
        ) : state.status === "error" ? (
          <DrawerErrorState
            message={state.message}
            onRetry={() => setRetryToken((n) => n + 1)}
          />
        ) : (
          <DrawerSuccessContent plan={state.plan} planId={planId} />
        )}
      </aside>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-views
// ---------------------------------------------------------------------------

function DrawerLoadingSkeleton() {
  return (
    <div
      className="space-y-6 p-4 md:p-6"
      data-testid="plan-detail-drawer-loading"
      aria-busy="true"
    >
      {[0, 1, 2].map((section) => (
        <div key={section} className="space-y-3">
          <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
          <div className="space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-4/6 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DrawerErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      data-testid="plan-detail-drawer-error"
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <XCircle className="h-12 w-12 text-[#C94040]" aria-hidden="true" />
      <h3 className="mt-4 text-base font-semibold text-[#2C2C2E]">
        Falha ao carregar este plano
      </h3>
      <p className="mt-2 max-w-sm text-sm text-[#6B6B6E]">{message}</p>
      <Button
        type="button"
        onClick={onRetry}
        className="mt-6 bg-[#4E8C75] text-white hover:bg-[#3F7460]"
      >
        Tentar novamente
      </Button>
    </div>
  );
}

function DrawerSuccessContent({
  plan,
  planId,
}: {
  plan: DrawerPlanDetail;
  planId: string;
}) {
  const speciesLabel =
    plan.pet.species.charAt(0).toUpperCase() + plan.pet.species.slice(1);

  return (
    <div
      className="space-y-6 p-4 md:p-6"
      data-testid="plan-detail-drawer-success"
    >
      {/* Basic Info */}
      <section>
        <h3 className="mb-3 text-sm font-medium text-[#6B6B6E]">
          Informações Básicas
        </h3>
        <div className="space-y-3">
          <Row label="ID do Plano">
            <span className="font-mono text-xs">{plan.id}</span>
          </Row>
          {/* Full client name is displayed even for atendente — operational
              lookups depend on it (PRD §5.2). */}
          <Row label="Tutor">{plan.client.name}</Row>
          <Row label="Pet">{plan.pet.name}</Row>
          <Row label="Espécie">{speciesLabel}</Row>
          <Row label="Raça">{plan.pet.breed ?? "—"}</Row>
          <Row label="Castrado">{plan.pet.castrated ? "Sim" : "Não"}</Row>
          <Row label="Data de nascimento">{formatDate(plan.pet.birthDate)}</Row>
        </div>
      </section>

      <div className="border-t border-gray-200" />

      {/* Plan Status */}
      <section>
        <h3 className="mb-3 text-sm font-medium text-[#6B6B6E]">
          Status do Plano
        </h3>
        <div className="space-y-3">
          <Row label="Status atual">
            <PlanStatusBadge status={plan.status} />
          </Row>
          <Row label="Criado em">{formatDateTime(plan.createdAt)}</Row>
          <Row label="Primeira cobrança paga">
            {formatDateTime(plan.firstPaidAt)}
          </Row>
          <Row label="Carência termina em">
            {formatDateTime(plan.gracePeriodEndsAt)}
          </Row>
          <Row label="Assinatura Pagar.me">
            <span className="font-mono text-xs">
              {plan.pagarmeSubscriptionId ?? "—"}
            </span>
          </Row>
        </div>
      </section>

      <div className="border-t border-gray-200" />

      {/* Contact Info — masked server-side. */}
      <section>
        <h3 className="mb-3 text-sm font-medium text-[#6B6B6E]">
          Contato do Tutor
        </h3>
        <div className="space-y-3">
          <Row label="E-mail">{plan.client.emailMasked}</Row>
          <Row label="Telefone">{plan.client.phoneMasked}</Row>
        </div>
      </section>

      <div className="border-t border-gray-200" />

      {/* Contract */}
      <section>
        <h3 className="mb-3 text-sm font-medium text-[#6B6B6E]">Contrato</h3>
        <div className="space-y-3">
          <Row label="ID do contrato">
            <span className="font-mono text-xs">{plan.contract.id}</span>
          </Row>
          <Row label="Versão">{plan.contract.contractVersion}</Row>
          <Row label="Aceito em">
            {formatDateTime(plan.contract.consentedAt)}
          </Row>
        </div>
      </section>

      <div className="border-t border-gray-200" />

      {/* Payments */}
      <section>
        <h3 className="mb-3 text-sm font-medium text-[#6B6B6E]">
          Pagamentos ({plan.payments.length})
        </h3>
        {plan.payments.length === 0 ? (
          <p
            className="text-sm text-[#6B6B6E]"
            data-testid="plan-detail-drawer-no-payments"
          >
            Sem pagamentos registrados.
          </p>
        ) : (
          <div className="space-y-2">
            {plan.payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-lg bg-gray-50 p-3"
                data-testid="plan-detail-drawer-payment"
              >
                <div className="mb-1 flex items-start justify-between">
                  <span className="text-sm font-medium text-[#2C2C2E]">
                    {payment.status}
                  </span>
                  <span className="text-sm text-[#4E8C75]">
                    {formatAmountBRL(payment.amount)}
                  </span>
                </div>
                <span className="text-xs text-[#6B6B6E]">
                  {formatDateTime(payment.paidAt ?? payment.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Outbound link to full management page */}
      <div className="pt-2">
        <Link
          href={`/admin/planos/${planId}`}
          data-testid="plan-detail-drawer-open-management"
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#4E8C75] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3F7460]"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Abrir gestão do plano
        </Link>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-[#6B6B6E]">{label}</span>
      <span className="text-right text-sm font-medium text-[#2C2C2E]">
        {children}
      </span>
    </div>
  );
}
