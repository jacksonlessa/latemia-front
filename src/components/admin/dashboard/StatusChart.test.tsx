import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusChart } from "./StatusChart";
import type { DashboardStatusChartPoint } from "@/lib/types/dashboard";

function makePoints(days: number): DashboardStatusChartPoint[] {
  const points: DashboardStatusChartPoint[] = [];
  const end = new Date("2026-04-30T00:00:00.000Z");
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(end);
    d.setUTCDate(end.getUTCDate() - i);
    points.push({
      date: d.toISOString().slice(0, 10),
      ativos: 100 + i,
      carencia: 10 + i,
      inadimplentes: i % 3,
    });
  }
  return points;
}

describe("StatusChart", () => {
  it("should render the chart container when data points are provided", () => {
    render(<StatusChart data={makePoints(14)} />);
    expect(screen.getByTestId("status-chart")).toBeInTheDocument();
    expect(screen.queryByTestId("status-chart-empty")).toBeNull();
  });

  it("should render legend labels for the three series", () => {
    render(<StatusChart data={makePoints(3)} />);
    expect(screen.getByText("Ativos")).toBeInTheDocument();
    expect(screen.getByText("Carência")).toBeInTheDocument();
    expect(screen.getByText("Inadimplentes")).toBeInTheDocument();
  });

  it("should render the empty state message when data is empty", () => {
    render(<StatusChart data={[]} />);
    const empty = screen.getByTestId("status-chart-empty");
    expect(empty).toBeInTheDocument();
    expect(empty).toHaveTextContent("Sem dados históricos");
  });
});
