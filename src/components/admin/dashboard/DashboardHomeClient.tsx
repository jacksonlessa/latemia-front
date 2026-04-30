"use client";

import { useState } from "react";
import { KPIGrid } from "@/components/admin/dashboard/KPIGrid";
import { StatusChart } from "@/components/admin/dashboard/StatusChart";
import { PlansTable } from "@/components/admin/dashboard/PlansTable";
import { AlertsPanel } from "@/components/admin/dashboard/AlertsPanel";
import { RecentUsage } from "@/components/admin/dashboard/RecentUsage";
import { PlanDetailDrawer } from "@/components/admin/dashboard/PlanDetailDrawer";
import type {
  DashboardKpisResponse,
  DashboardStatusChartResponse,
} from "@/lib/types/dashboard";
import type { PlanListResponse } from "@/lib/types/plan";
import type { SessionUser } from "@/lib/session";

interface DashboardHomeClientProps {
  kpis: DashboardKpisResponse;
  statusChart: DashboardStatusChartResponse;
  plansInitial: PlanListResponse;
  plansFilters: { status?: string; search?: string };
  role: SessionUser["role"];
}

/**
 * Client wrapper for the admin dashboard home page.
 *
 * Owns the `selectedPlan` state and the `PlanDetailDrawer`.
 * Receives all server-fetched data via props.
 */
export function DashboardHomeClient({
  kpis,
  statusChart,
  plansInitial,
  plansFilters,
  role: _role,
}: DashboardHomeClientProps) {
  void _role;

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* KPIs */}
      <KPIGrid kpis={kpis} />

      {/* Chart and Alerts */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StatusChart data={statusChart.data} />
        </div>
        <div>
          <AlertsPanel />
        </div>
      </div>

      {/* Table and Recent Usage */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PlansTable
            data={plansInitial.data}
            meta={plansInitial.meta}
            currentFilters={plansFilters}
            onSelectPlan={(plan) => setSelectedPlanId(plan.id)}
          />
        </div>
        <div>
          <RecentUsage />
        </div>
      </div>

      <PlanDetailDrawer
        planId={selectedPlanId}
        onClose={() => setSelectedPlanId(null)}
      />
    </div>
  );
}
