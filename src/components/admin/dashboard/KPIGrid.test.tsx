import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { KPIGrid } from "./KPIGrid";
import type { DashboardKpisResponse } from "@/lib/types/dashboard";

function makeKpis(
  overrides: Partial<DashboardKpisResponse> = {},
): DashboardKpisResponse {
  return {
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
    generatedAt: "2026-04-30T12:00:00.000Z",
    snapshotMissingFor: [],
    ...overrides,
  };
}

describe("KPIGrid", () => {
  it("should render all 8 KPI cards when given a complete payload", () => {
    render(<KPIGrid kpis={makeKpis()} />);
    const cards = screen.getAllByTestId("kpi-card");
    expect(cards).toHaveLength(8);
  });

  it("should render KPIs in the new 4+4 semantic order", () => {
    render(<KPIGrid kpis={makeKpis()} />);
    const titles = screen
      .getAllByTestId("kpi-card")
      .map((card) => within(card).getByRole("heading", { level: 3 }).textContent);

    expect(titles).toEqual([
      "Tutores ativos",
      "Pets cadastrados",
      "Clientes consultados hoje",
      "Receita do mês",
      "Total de planos",
      "Planos novos no mês",
      "Planos ativos",
      "Planos em carência",
    ]);
  });

  it("should not render the 'Planos inadimplentes' card in the grid", () => {
    render(<KPIGrid kpis={makeKpis()} />);
    const titles = screen
      .getAllByTestId("kpi-card")
      .map((card) => within(card).getByRole("heading", { level: 3 }).textContent);
    expect(titles).not.toContain("Planos inadimplentes");
  });

  it("should render the 'Total de planos' card in the grid", () => {
    render(<KPIGrid kpis={makeKpis()} />);
    expect(screen.getByText("Total de planos")).toBeInTheDocument();
  });

  it("should mask the monthly revenue value when monthlyRevenue.masked is true", () => {
    const kpis = makeKpis({
      monthlyRevenue: { value: 0, comparison: null, masked: true },
    });
    render(<KPIGrid kpis={kpis} />);

    const revenueCard = screen
      .getAllByTestId("kpi-card")
      .find((card) =>
        within(card).queryByText("Receita do mês"),
      );
    expect(revenueCard).toBeDefined();
    expect(within(revenueCard!).getByTestId("kpi-card-value")).toHaveTextContent(
      "••••",
    );
    // When masked, no comparison badge should be rendered.
    expect(
      within(revenueCard!).queryByTestId("kpi-card-comparison"),
    ).toBeNull();
  });

  it("should render 'sem comparativo disponível' when comparison is null", () => {
    const kpis = makeKpis({
      activeTutors: { value: 142, comparison: null },
    });
    render(<KPIGrid kpis={kpis} />);

    expect(
      screen.getByText("sem comparativo disponível"),
    ).toBeInTheDocument();
  });

  it("should render the active plans card with a segmented progress bar", () => {
    render(<KPIGrid kpis={makeKpis()} />);
    const segmentedBar = screen.getByRole("img", {
      name: /ativos · \d+ carência · \d+ inadimplentes/,
    });
    expect(segmentedBar).toBeInTheDocument();
  });
});
