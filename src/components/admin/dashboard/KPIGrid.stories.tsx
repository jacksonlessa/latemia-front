/**
 * Storybook stories for the KPIGrid organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention.
 */

import type React from "react";
import { KPIGrid } from "./KPIGrid";
import type { DashboardKpisResponse } from "@/lib/types/dashboard";

const meta = {
  title: "Admin/Dashboard/KPIGrid",
  component: KPIGrid,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = {
  render?: (args: React.ComponentProps<typeof KPIGrid>) => React.ReactElement;
  args?: Partial<React.ComponentProps<typeof KPIGrid>>;
  name?: string;
};

const baseKpis: DashboardKpisResponse = {
  activeTutors: {
    value: 142,
    comparison: { previous: 134, deltaAbsolute: 8, deltaPercent: 5.9 },
  },
  registeredPets: {
    value: 218,
    comparison: { previous: 210, deltaAbsolute: 8, deltaPercent: 3.8 },
  },
  newPlansThisMonth: {
    value: 24,
    comparison: { previous: 18, deltaAbsolute: 6, deltaPercent: 33.3 },
  },
  plansInGracePeriod: {
    value: 13,
    comparison: { previous: 14, deltaAbsolute: -1, deltaPercent: -7.1 },
  },
  activePlans: {
    value: 184,
    comparison: { previous: 178, deltaAbsolute: 6, deltaPercent: 3.4 },
    totalNonCancelled: 200,
    activePercent: 92,
  },
  delinquentPlans: {
    value: 3,
    comparison: { previous: 5, deltaAbsolute: -2, deltaPercent: -40 },
  },
  clientsAttendedToday: {
    value: 47,
    comparison: { previous: 42, deltaAbsolute: 5, deltaPercent: 11.9 },
  },
  monthlyRevenue: {
    value: 12345,
    comparison: { previous: 11000, deltaAbsolute: 1345, deltaPercent: 12.2 },
    masked: false,
  },
  totalPlans: {
    value: 200,
    comparison: { previous: 190, deltaAbsolute: 10, deltaPercent: 5.3 },
  },
  generatedAt: new Date().toISOString(),
  snapshotMissingFor: [],
};

/** Admin: todos os KPIs com comparativo e receita visível. */
export const Default: Story = {
  name: "Admin (completo)",
  args: {
    kpis: baseKpis,
  },
};

/** Atendente: receita do mês mascarada. */
export const AtendenteMasked: Story = {
  name: "Atendente (receita mascarada)",
  args: {
    kpis: {
      ...baseKpis,
      monthlyRevenue: {
        value: 0,
        comparison: null,
        masked: true,
      },
    },
  },
};

/** Sem snapshots de comparação (primeira execução). */
export const SemComparativos: Story = {
  name: "Sem comparativos",
  args: {
    kpis: {
      ...baseKpis,
      activeTutors: { value: 142, comparison: null },
      registeredPets: { value: 218, comparison: null },
      newPlansThisMonth: { value: 24, comparison: null },
      plansInGracePeriod: { value: 13, comparison: null },
      activePlans: {
        value: 184,
        comparison: null,
        totalNonCancelled: 200,
        activePercent: 92,
      },
      delinquentPlans: { value: 3, comparison: null },
      clientsAttendedToday: { value: 47, comparison: null },
      totalPlans: { value: 200, comparison: null },
      snapshotMissingFor: [
        "Tutores ativos",
        "Pets cadastrados",
        "Planos novos no mês",
        "Planos em carência",
        "Planos ativos",
        "Clientes consultados hoje",
        "Total de planos",
      ],
    },
  },
};
