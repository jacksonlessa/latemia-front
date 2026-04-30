"use client";

import { useState } from "react";
import { KPIGrid } from "@/components/admin/dashboard/KPIGrid";
import { StatusChart } from "@/components/admin/dashboard/StatusChart";
import { PlansTable } from "@/components/admin/dashboard/PlansTable";
import { AlertsPanel } from "@/components/admin/dashboard/AlertsPanel";
import { RecentUsage } from "@/components/admin/dashboard/RecentUsage";
import { PlanDetailDrawer } from "@/components/admin/dashboard/PlanDetailDrawer";
import type { Plan } from "@/components/admin/dashboard/PlansTable";
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
  role: SessionUser["role"];
}

/**
 * Client wrapper for the admin dashboard home page.
 *
 * Owns the `selectedPlan` state and the `PlanDetailDrawer`.
 * Receives all server-fetched data via props so each child component can be
 * independently refactored in tasks 8–12. The interfaces of the underlying
 * components are intentionally preserved for now — wiring of real data into
 * `KPIGrid`, `StatusChart`, `PlansTable` and `PlanDetailDrawer` lands with
 * those tasks.
 */
export function DashboardHomeClient({
  kpis,
  statusChart: _statusChart,
  plansInitial: _plansInitial,
  role: _role,
}: DashboardHomeClientProps) {
  // Suppress unused-warnings until tasks 9–12 wire these props into children.
  void _statusChart;
  void _plansInitial;
  void _role;

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* KPIs */}
      <KPIGrid kpis={kpis} />

      {/* Chart and Alerts */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StatusChart />
        </div>
        <div>
          <AlertsPanel />
        </div>
      </div>

      {/* Table and Recent Usage */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PlansTable onViewPlan={setSelectedPlan} />
        </div>
        <div>
          <RecentUsage />
        </div>
      </div>

      <PlanDetailDrawer
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
      />
    </div>
  );
}
