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
 * Row 1 (base de clientes): Tutores ativos · Pets cadastrados · Clientes consultados hoje · Receita do mês
 * Row 2 (carteira de planos): Total de planos · Planos novos no mês · Planos ativos · Planos em carência
 */
export function KPIGrid({ kpis }: KPIGridProps) {
  const {
    activeTutors,
    registeredPets,
    clientsAttendedToday,
    monthlyRevenue,
    totalPlans,
    newPlansThisMonth,
    activePlans,
    plansInGracePeriod,
    delinquentPlans,
  } = kpis;

  return (
    <div className="space-y-4 md:space-y-6" data-testid="kpi-grid">
      {/* Linha 1: base de clientes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        <KPICard title="Tutores ativos" value={activeTutors.value} comparison={toComparison(activeTutors)} />
        <KPICard title="Pets cadastrados" value={registeredPets.value} comparison={toComparison(registeredPets)} />
        <KPICard title="Clientes consultados hoje" value={clientsAttendedToday.value} comparison={toComparison(clientsAttendedToday)} />
        <KPICard title="Receita do mês" value={formatBRL(monthlyRevenue.value)} comparison={toComparison(monthlyRevenue)} masked={monthlyRevenue.masked} />
      </div>

      {/* Linha 2: carteira de planos */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        <KPICard title="Total de planos" value={totalPlans.value} comparison={toComparison(totalPlans)} />
        <KPICard title="Planos novos no mês" value={newPlansThisMonth.value} comparison={toComparison(newPlansThisMonth)} />
        <KPICard
          title="Planos ativos"
          value={`${Math.round(activePlans.activePercent)}%`}
          comparison={toComparison(activePlans)}
          segmentedProgress={{
            ativos: activePlans.value,
            carencia: plansInGracePeriod.value,
            inadimplentes: delinquentPlans.value,
            total: activePlans.totalNonCancelled,
          }}
        />
        <KPICard title="Planos em carência" value={plansInGracePeriod.value} comparison={toComparison(plansInGracePeriod)} />
      </div>
    </div>
  );
}
