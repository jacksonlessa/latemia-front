/**
 * Storybook stories for the StatusChart organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention.
 */

import type React from "react";
import { StatusChart } from "./StatusChart";
import type { DashboardStatusChartPoint } from "@/lib/types/dashboard";

const meta = {
  title: "Admin/Dashboard/StatusChart",
  component: StatusChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = {
  render?: (args: React.ComponentProps<typeof StatusChart>) => React.ReactElement;
  args?: Partial<React.ComponentProps<typeof StatusChart>>;
  name?: string;
};

function buildSeries(days: number): DashboardStatusChartPoint[] {
  const points: DashboardStatusChartPoint[] = [];
  // Datas determinísticas, terminando em 2026-04-30.
  const end = new Date("2026-04-30T00:00:00.000Z");
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(end);
    d.setUTCDate(end.getUTCDate() - i);
    const iso = d.toISOString().slice(0, 10);
    points.push({
      date: iso,
      ativos: 140 + (days - i) * 3,
      carencia: 25 - i,
      inadimplentes: 8 - (i % 5),
    });
  }
  return points;
}

/** 14 pontos (cenário padrão da API). */
export const Default: Story = {
  name: "14 pontos (padrão)",
  args: {
    data: buildSeries(14),
  },
};

/** Poucos pontos (ex.: primeiros dias após go-live). */
export const FewPoints: Story = {
  name: "Poucos pontos (3)",
  args: {
    data: buildSeries(3),
  },
};

/** Sem dados históricos. */
export const Empty: Story = {
  name: "Vazio",
  args: {
    data: [],
  },
};
