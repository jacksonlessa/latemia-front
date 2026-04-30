/**
 * Shared types for the Dashboard domain.
 * These mirror the backend interfaces declared in
 * `latemia-back/src/dashboard/dashboard.service.ts`.
 */

export interface KpiComparison {
  previous: number;
  deltaAbsolute: number;
  /** Rounded to 1 decimal. */
  deltaPercent: number;
}

export interface KpiValue {
  value: number;
  /** `null` when no snapshot was available for the comparison period. */
  comparison: KpiComparison | null;
}

export interface ActivePlansKpi extends KpiValue {
  totalNonCancelled: number;
  /** Percentage of active plans over total non-cancelled (rounded). */
  activePercent: number;
}

export interface MonthlyRevenueKpi extends KpiValue {
  /** When `true`, `value` is `0` and `comparison` is `null` (atendente role). */
  masked: boolean;
}

export interface DashboardKpisResponse {
  activeTutors: KpiValue;
  registeredPets: KpiValue;
  newPlansThisMonth: KpiValue;
  plansInGracePeriod: KpiValue;
  activePlans: ActivePlansKpi;
  delinquentPlans: KpiValue;
  clientsAttendedToday: KpiValue;
  monthlyRevenue: MonthlyRevenueKpi;
  /** ISO timestamp produced server-side. */
  generatedAt: string;
  /** Labels of KPIs that lack a comparison snapshot. */
  snapshotMissingFor: string[];
}

export interface DashboardStatusChartPoint {
  /** ISO date `YYYY-MM-DD`. */
  date: string;
  ativos: number;
  carencia: number;
  inadimplentes: number;
}

export interface DashboardStatusChartResponse {
  /** 14 points: 13 snapshots + today. */
  data: DashboardStatusChartPoint[];
}
