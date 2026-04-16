"use client";

import { useState } from "react";
import { KPICard } from "@/components/admin/dashboard/KPICard";
import { StatusChart } from "@/components/admin/dashboard/StatusChart";
import { PlansTable } from "@/components/admin/dashboard/PlansTable";
import { AlertsPanel } from "@/components/admin/dashboard/AlertsPanel";
import { RecentUsage } from "@/components/admin/dashboard/RecentUsage";
import { PlanDetailDrawer } from "@/components/admin/dashboard/PlanDetailDrawer";
import type { Plan } from "@/components/admin/dashboard/PlansTable";

export default function DashboardPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        <KPICard
          title="Clientes consultados hoje"
          value={47}
          trend={{ value: "+12%", isPositive: true }}
        />
        <KPICard
          title="Planos em carência"
          value={13}
          trend={{ value: "-8%", isPositive: true }}
        />
        <KPICard title="Planos ativos" value="92%" progress={92} />
        <KPICard
          title="Planos inadimplentes"
          value={3}
          trend={{ value: "-2", isPositive: true }}
        />
      </div>

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
