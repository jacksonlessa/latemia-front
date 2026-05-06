import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { fetchBenefitUsagesByPlan, fetchMe } from '@/lib/api-server';
import { SESSION_COOKIE } from '@/lib/session';
import { ApiError } from '@/lib/api-errors';
import { getPlanByIdUseCase } from '@/domain/plan/get-plan-by-id.use-case';
import { getPlanWebhookEventsUseCase } from '@/domain/plan/get-plan-webhook-events.use-case';
import { TerminalStateBanner } from '@/components/admin/planos/molecules/terminal-state-banner/TerminalStateBanner';
import { PlanDetailPageClient } from '@/components/admin/planos/organisms/plan-detail-page-client/PlanDetailPageClient';
import { isTerminalPlanStatus, type PlanWebhookEvent } from '@/lib/types/plan';
import type { BenefitUsageResponse } from '@/lib/types/benefit-usage';

interface PageProps {
  params: Promise<{ id: string }>;
}

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

  // Plan + benefit usages run in parallel; usages are tolerant to failure so
  // the page still renders the plan detail even if that endpoint is degraded.
  let plan;
  let benefitUsages: BenefitUsageResponse[] = [];
  try {
    const [planResult, usagesResult] = await Promise.all([
      getPlanByIdUseCase(id, token),
      fetchBenefitUsagesByPlan({ planId: id, token }).catch(
        () => [] as BenefitUsageResponse[],
      ),
    ]);
    plan = planResult;
    benefitUsages = usagesResult;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  // Webhook events are admin-only on the backend. We absorb failures (incl.
  // 403) to keep the page rendering — `null` means "do not show the tab".
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
      <div>
        <Link
          href="/admin/planos"
          className="inline-flex items-center gap-1 text-sm text-[#4E8C75] hover:opacity-80"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para Planos
        </Link>
      </div>

      {isTerminalPlanStatus(plan.status) ? (
        <TerminalStateBanner status={plan.status} />
      ) : null}

      <PlanDetailPageClient
        plan={plan}
        benefitUsages={benefitUsages}
        webhookEvents={webhookEvents}
      />
    </div>
  );
}
