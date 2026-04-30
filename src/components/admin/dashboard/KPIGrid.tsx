import { KPICard } from "@/components/admin/dashboard/KPICard";
import type { DashboardKpisResponse, KpiValue } from "@/lib/types/dashboard";

interface KPIGridProps {
  kpis: DashboardKpisResponse;
}

function toComparison(kpi: KpiValue) {
  if (kpi.comparison === null) return null;
  return {
    delta: kpi.comparison.deltaAbsolute,
    deltaPercent: kpi.comparison.deltaPercent,
  };
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Renders the 8 dashboard KPIs in a 4+4 responsive grid.
 *
 * Row 1 (highlight): Tutores ativos · Planos ativos · Planos inadimplentes · Clientes consultados hoje
 * Row 2 (complementary): Pets cadastrados · Planos novos no mês · Planos em carência · Receita do mês
 */
export function KPIGrid({ kpis }: KPIGridProps) {
  const {
    activeTutors,
    activePlans,
    delinquentPlans,
    clientsAttendedToday,
    registeredPets,
    newPlansThisMonth,
    plansInGracePeriod,
    monthlyRevenue,
  } = kpis;

  return (
    <div className="space-y-4 md:space-y-6" data-testid="kpi-grid">
      {/* Row 1: highlight KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        <KPICard
          title="Tutores ativos"
          value={activeTutors.value}
          comparison={toComparison(activeTutors)}
        />
        <KPICard
          title="Planos ativos"
          value={`${Math.round(activePlans.activePercent)}%`}
          comparison={toComparison(activePlans)}
          progress={{
            current: activePlans.value,
            total: activePlans.totalNonCancelled,
          }}
        />
        <KPICard
          title="Planos inadimplentes"
          value={delinquentPlans.value}
          comparison={toComparison(delinquentPlans)}
        />
        <KPICard
          title="Clientes consultados hoje"
          value={clientsAttendedToday.value}
          comparison={toComparison(clientsAttendedToday)}
        />
      </div>

      {/* Row 2: complementary KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        <KPICard
          title="Pets cadastrados"
          value={registeredPets.value}
          comparison={toComparison(registeredPets)}
        />
        <KPICard
          title="Planos novos no mês"
          value={newPlansThisMonth.value}
          comparison={toComparison(newPlansThisMonth)}
        />
        <KPICard
          title="Planos em carência"
          value={plansInGracePeriod.value}
          comparison={toComparison(plansInGracePeriod)}
        />
        <KPICard
          title="Receita do mês"
          value={formatBRL(monthlyRevenue.value)}
          comparison={toComparison(monthlyRevenue)}
          masked={monthlyRevenue.masked}
        />
      </div>
    </div>
  );
}
