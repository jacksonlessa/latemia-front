import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { fetchMe } from '@/lib/api-server';
import { SESSION_COOKIE } from '@/lib/session';
import { ApiError } from '@/lib/api-errors';
import { getPlanByIdUseCase } from '@/domain/plan/get-plan-by-id.use-case';
import { getPlanWebhookEventsUseCase } from '@/domain/plan/get-plan-webhook-events.use-case';
import { PlanStatusBadge } from '@/components/admin/planos/atoms/plan-status-badge/PlanStatusBadge';
import { PlanDetailCard } from '@/components/admin/planos/molecules/plan-detail-card/PlanDetailCard';
import { CopyableId } from '@/components/admin/planos/molecules/copyable-id/CopyableId';
import { TerminalStateBanner } from '@/components/admin/planos/molecules/terminal-state-banner/TerminalStateBanner';
import { PlanPaymentsList } from '@/components/admin/planos/organisms/plan-payments-list/PlanPaymentsList';
import { PlanWebhookEventsList } from '@/components/admin/planos/organisms/plan-webhook-events-list/PlanWebhookEventsList';
import { isTerminalPlanStatus, type PlanWebhookEvent } from '@/lib/types/plan';

interface PageProps {
  params: Promise<{ id: string }>;
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

const longDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
  timeStyle: 'short',
});

const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
});

function formatDateTime(iso: string): string {
  try {
    return longDateFormatter.format(new Date(iso));
  } catch {
    return '—';
  }
}

function formatDate(iso: string): string {
  try {
    return shortDateFormatter.format(new Date(iso));
  } catch {
    return '—';
  }
}

function formatWeight(weight?: number): string {
  if (weight === undefined || weight === null) return '—';
  return `${weight} kg`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PlanoDetailPage({ params }: PageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect('/admin/login');
  }

  const me = await fetchMe(token);
  if (!me) {
    redirect('/admin/login');
  }

  const { id } = await params;

  let plan;
  try {
    plan = await getPlanByIdUseCase(id, token);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  // Webhook events — admin-only. Falhas (incluindo 403) são absorvidas pra
  // não quebrar a página: tudo que importa é não renderizar o card.
  let webhookEvents: PlanWebhookEvent[] | null = null;
  if (me.role === 'admin') {
    try {
      webhookEvents = await getPlanWebhookEventsUseCase(id, token);
    } catch {
      webhookEvents = null;
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/admin/planos"
          className="inline-flex items-center gap-1 text-sm text-[#4E8C75] hover:opacity-80"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para Planos
        </Link>
      </div>

      {/* Banner — estado terminal */}
      {isTerminalPlanStatus(plan.status) ? (
        <TerminalStateBanner status={plan.status} />
      ) : null}

      {/* Plano */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h1 className="mb-4 text-xl font-semibold text-[#2C2C2E] md:text-2xl">
          Detalhe do Plano
        </h1>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PlanDetailCard label="ID do Plano" value={<span className="font-mono text-xs">{plan.id}</span>} />
          <PlanDetailCard
            label="Status"
            value={<PlanStatusBadge status={plan.status} />}
          />
          <PlanDetailCard label="Criado em" value={formatDateTime(plan.createdAt)} />
        </dl>
      </div>

      {/* Assinatura Pagar.me */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h2 className="mb-4 text-base font-semibold text-[#2C2C2E]">
          Assinatura Pagar.me
        </h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PlanDetailCard
            label="ID da assinatura (Pagar.me)"
            value={
              plan.pagarmeSubscriptionId ? (
                <CopyableId
                  value={plan.pagarmeSubscriptionId}
                  label="ID da assinatura"
                />
              ) : (
                '—'
              )
            }
          />
          <PlanDetailCard
            label="Primeira cobrança paga em"
            value={plan.firstPaidAt ? formatDateTime(plan.firstPaidAt) : '—'}
          />
          <PlanDetailCard
            label="Carência termina em"
            value={
              plan.gracePeriodEndsAt ? formatDateTime(plan.gracePeriodEndsAt) : '—'
            }
          />
        </dl>
      </div>

      {/* Pet */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h2 className="mb-4 text-base font-semibold text-[#2C2C2E]">Pet</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PlanDetailCard
            label="Nome"
            value={
              <span>
                {plan.pet.name}{' '}
                <Link
                  href={`/admin/clientes/${plan.client.id}`}
                  className="text-xs text-[#4E8C75] hover:opacity-80 hover:underline underline-offset-4"
                  aria-label={`Ver detalhes do cliente de ${plan.pet.name}`}
                >
                  (ver cliente)
                </Link>
              </span>
            }
          />
          <PlanDetailCard
            label="Espécie"
            value={plan.pet.species.charAt(0).toUpperCase() + plan.pet.species.slice(1)}
          />
          <PlanDetailCard label="Raça" value={plan.pet.breed ?? '—'} />
          <PlanDetailCard label="Peso" value={formatWeight(plan.pet.weight)} />
          <PlanDetailCard
            label="Castrado"
            value={plan.pet.castrated ? 'Sim' : 'Não'}
          />
          <PlanDetailCard
            label="Data de nascimento"
            value={formatDate(plan.pet.birthDate)}
          />
        </dl>
      </div>

      {/* Cliente */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h2 className="mb-4 text-base font-semibold text-[#2C2C2E]">Cliente</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PlanDetailCard
            label="Nome"
            value={
              <Link
                href={`/admin/clientes/${plan.client.id}`}
                className="text-[#4E8C75] hover:opacity-80 hover:underline underline-offset-4"
                aria-label={`Ver detalhes do cliente ${plan.client.name}`}
              >
                {plan.client.name}
              </Link>
            }
          />
          <PlanDetailCard label="E-mail" value={plan.client.email} />
          <PlanDetailCard label="Telefone" value={plan.client.phone} />
        </dl>
      </div>

      {/* Contrato */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h2 className="mb-4 text-base font-semibold text-[#2C2C2E]">Contrato</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PlanDetailCard
            label="ID do Contrato"
            value={<span className="font-mono text-xs">{plan.contract.id}</span>}
          />
          <PlanDetailCard label="Versão" value={plan.contract.version} />
          <PlanDetailCard
            label="Aceito em"
            value={formatDateTime(plan.contract.consentedAt)}
          />
        </dl>
      </div>

      {/* Pagamentos */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h2 className="mb-4 text-base font-semibold text-[#2C2C2E]">
          Pagamentos ({plan.payments.length})
        </h2>
        <PlanPaymentsList payments={plan.payments} />
      </div>

      {/* Eventos do provider — admin-only */}
      {webhookEvents !== null ? (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
          <h2 className="mb-1 text-base font-semibold text-[#2C2C2E]">
            Eventos do provider ({webhookEvents.length})
          </h2>
          <p className="mb-4 text-xs text-[#6B6B6E]">
            Webhooks recebidos da Pagar.me para esta assinatura. Visível apenas
            para administradores.
          </p>
          <PlanWebhookEventsList events={webhookEvents} />
        </div>
      ) : null}
    </div>
  );
}
