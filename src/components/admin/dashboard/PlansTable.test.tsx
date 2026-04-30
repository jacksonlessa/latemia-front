import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { PlansTable } from "./PlansTable";
import type { PlanListItem, PlanListMeta } from "@/lib/types/plan";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: pushMock,
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

const meta: PlanListMeta = {
  total: 2,
  page: 1,
  limit: 20,
  totalPages: 1,
};

const rows: PlanListItem[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    status: "ativo",
    clientId: "c1",
    clientName: "João Silva",
    petName: "Rex",
    createdAt: "2026-04-12T10:00:00.000Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    status: "inadimplente",
    clientId: "c2",
    clientName: "Maria S.",
    petName: "Luna",
    createdAt: "2026-04-08T09:00:00.000Z",
  },
];

describe("PlansTable", () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  it("should render rows from the real plan contract when data is provided", () => {
    render(
      <PlansTable
        data={rows}
        meta={meta}
        currentFilters={{}}
        onSelectPlan={() => {}}
      />,
    );

    expect(screen.getAllByTestId("plans-table-row")).toHaveLength(2);
    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText("Rex")).toBeInTheDocument();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(screen.getByText("Inadimplente")).toBeInTheDocument();
    // createdAt formatted as DD/MM/YYYY (locale-tolerant via Date getters).
    expect(screen.getByText("12/04/2026")).toBeInTheDocument();
  });

  it("should render the empty placeholder when data is empty", () => {
    render(
      <PlansTable
        data={[]}
        meta={{ total: 0, page: 1, limit: 20, totalPages: 0 }}
        currentFilters={{}}
        onSelectPlan={() => {}}
      />,
    );

    expect(screen.getByTestId("plans-table-empty")).toBeInTheDocument();
    expect(screen.getByTestId("plans-table-total")).toHaveTextContent(
      "0 planos no total",
    );
  });

  it("should call onSelectPlan with the row data when a row is clicked", () => {
    const onSelect = vi.fn();
    render(
      <PlansTable
        data={rows}
        meta={meta}
        currentFilters={{}}
        onSelectPlan={onSelect}
      />,
    );

    fireEvent.click(screen.getAllByTestId("plans-table-row")[0]!);
    expect(onSelect).toHaveBeenCalledWith(rows[0]);
  });

  it("should push a new URL with debounced search when the search input changes", () => {
    vi.useFakeTimers();
    try {
      render(
        <PlansTable
          data={rows}
          meta={meta}
          currentFilters={{}}
          onSelectPlan={() => {}}
        />,
      );

      const search = screen.getByLabelText("Buscar planos");
      fireEvent.change(search, { target: { value: "rex" } });

      // Debounce: nothing yet.
      expect(pushMock).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(350);
      });

      expect(pushMock).toHaveBeenCalledTimes(1);
      const arg = pushMock.mock.calls[0]![0] as string;
      expect(arg).toContain("search=rex");
    } finally {
      vi.useRealTimers();
    }
  });
});
