'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CopyableId } from '@/components/admin/planos/molecules/copyable-id/CopyableId';
import { PlanDetailCard } from '@/components/admin/planos/molecules/plan-detail-card/PlanDetailCard';
import { PlanDetailHeader } from '@/components/admin/planos/molecules/plan-detail-header/PlanDetailHeader';
import { PlanDetailSection } from '@/components/admin/planos/molecules/plan-detail-section/PlanDetailSection';
import { PlanMetricsStrip } from '@/components/admin/planos/molecules/plan-metrics-strip/PlanMetricsStrip';
import {
  PlanDetailTabs,
  type PlanDetailTabDefinition,
} from '@/components/admin/planos/organisms/plan-detail-tabs/PlanDetailTabs';
import { PlanPaymentsList } from '@/components/admin/planos/organisms/plan-payments-list/PlanPaymentsList';
import { PlanWebhookEventsList } from '@/components/admin/planos/organisms/plan-webhook-events-list/PlanWebhookEventsList';
import { BenefitUsageSection } from '@/components/admin/uso-beneficio/organisms/benefit-usage-section/BenefitUsageSection';
import type { PlanDetail, PlanWebhookEvent } from '@/lib/types/plan';
import type { BenefitUsageResponse } from '@/lib/types/benefit-usage';

interface PlanDetailPageClientProps {
  plan: PlanDetail;
  benefitUsages: BenefitUsageResponse[];
  /** `null` when the current user does not have permission (atendente). */
  webhookEvents: PlanWebhookEvent[] | null;
}

const longDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
  timeStyle: 'short',
});

const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
});

function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : longDateFormatter.format(d);
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : shortDateFormatter.format(d);
}

function formatWeight(weight?: number): string {
  if (weight === undefined || weight === null) return '—';
  return `${weight} kg`;
}

function capitalize(value: string): string {
  return value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1);
}

export function PlanDetailPageClient({
  plan,
  benefitUsages,
  webhookEvents,
}: PlanDetailPageClientProps) {
  const [activeTab, setActiveTab] = useState('geral');

  const tabs: PlanDetailTabDefinition[] = [
    {
      id: 'geral',
      label: 'Visão Geral',
      content: (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <PlanDetailSection title="Pet">
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <PlanDetailCard
                label="Nome"
                value={
                  <span className="inline-flex flex-wrap items-baseline gap-1">
                    <span>{plan.pet.name}</span>
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
              <PlanDetailCard label="Espécie" value={capitalize(plan.pet.species)} />
              <PlanDetailCard label="Raça" value={plan.pet.breed ?? '—'} />
              <PlanDetailCard label="Peso" value={formatWeight(plan.pet.weight)} />
              <PlanDetailCard
                label="Castrado"
                value={plan.pet.castrated ? 'Sim' : 'Não'}
              />
              <PlanDetailCard
                label="Nascimento"
                value={formatDate(plan.pet.birthDate)}
              />
            </dl>
          </PlanDetailSection>

          <PlanDetailSection title="Cliente">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </PlanDetailSection>

          <PlanDetailSection title="Assinatura Pagar.me" className="lg:col-span-2">
            <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <PlanDetailCard
                label="ID da assinatura"
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
                value={formatDateTime(plan.firstPaidAt)}
              />
              <PlanDetailCard
                label="Carência termina em"
                value={
                  <span className="text-amber-700 font-semibold">
                    {formatDateTime(plan.gracePeriodEndsAt)}
                  </span>
                }
              />
            </dl>
          </PlanDetailSection>

          <PlanDetailSection
            title="Contrato"
            subtitle="Consultado em disputas ou reclamações"
            className="lg:col-span-2"
          >
            <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <PlanDetailCard
                label="ID do contrato"
                value={
                  <span className="font-mono text-xs break-all">
                    {plan.contract.id}
                  </span>
                }
              />
              <PlanDetailCard label="Versão" value={plan.contract.version} />
              <PlanDetailCard
                label="Aceito em"
                value={formatDateTime(plan.contract.consentedAt)}
              />
            </dl>
          </PlanDetailSection>
        </div>
      ),
    },
    {
      id: 'pagamentos',
      label: 'Pagamentos',
      count: plan.payments.length,
      content: (
        <PlanDetailSection title="Pagamentos">
          <PlanPaymentsList payments={plan.payments} />
        </PlanDetailSection>
      ),
    },
    {
      id: 'beneficio',
      label: 'Benefício',
      count: benefitUsages.length,
      content: <BenefitUsageSection plan={plan} initialUsages={benefitUsages} />,
    },
  ];

  if (webhookEvents !== null) {
    tabs.push({
      id: 'eventos',
      label: 'Eventos',
      count: webhookEvents.length,
      content: (
        <PlanDetailSection
          title="Eventos do provider"
          subtitle="Webhooks recebidos da Pagar.me · visível apenas para administradores"
        >
          <PlanWebhookEventsList events={webhookEvents} />
        </PlanDetailSection>
      ),
    });
  }

  function handleRegisterUsageClick() {
    setActiveTab('beneficio');
  }

  return (
    <div className="space-y-5">
      <PlanDetailHeader
        plan={plan}
        onRegisterUsageClick={handleRegisterUsageClick}
      />
      <PlanMetricsStrip plan={plan} benefitUsages={benefitUsages} />
      <PlanDetailTabs
        tabs={tabs}
        activeTab={activeTab}
        onActiveTabChange={setActiveTab}
      />
    </div>
  );
}
