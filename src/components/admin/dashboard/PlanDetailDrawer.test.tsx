import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

import { PlanDetailDrawer } from "./PlanDetailDrawer";
import type { DrawerPlanDetail } from "@/lib/types/plan";

const PLAN_ID = "11111111-1111-1111-1111-111111111111";

function makePlan(overrides: Partial<DrawerPlanDetail> = {}): DrawerPlanDetail {
  return {
    id: PLAN_ID,
    status: "ativo",
    createdAt: "2026-03-16T13:30:00.000Z",
    pagarmeSubscriptionId: "sub_abcdef",
    firstPaidAt: "2026-03-16T14:00:00.000Z",
    gracePeriodEndsAt: "2026-09-16T14:00:00.000Z",
    pet: {
      id: "pet-1",
      name: "Rex",
      species: "cao",
      breed: "Golden Retriever",
      weight: 28,
      castrated: true,
      birthDate: "2023-05-12T00:00:00.000Z",
    },
    client: {
      id: "client-1",
      name: "João da Silva",
      emailMasked: "j***@email.com",
      phoneMasked: "(47) 9****-4567",
    },
    contract: {
      id: "contract-1",
      contractVersion: "v3",
      consentedAt: "2026-03-16T13:29:55.000Z",
    },
    payments: [
      {
        id: "pay-1",
        status: "pago",
        amount: "59.90",
        createdAt: "2026-04-16T10:00:00.000Z",
        paidAt: "2026-04-16T10:00:30.000Z",
      },
    ],
    ...overrides,
  };
}

describe("PlanDetailDrawer", () => {
  it("should render nothing when planId is null", () => {
    const { container } = render(
      <PlanDetailDrawer planId={null} onClose={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should show the loading skeleton while the fetch is pending", () => {
    const fetchPlan = vi.fn(
      () => new Promise<DrawerPlanDetail>(() => {}),
    );
    render(
      <PlanDetailDrawer
        planId={PLAN_ID}
        onClose={() => {}}
        fetchPlan={fetchPlan}
      />,
    );

    expect(screen.getByTestId("plan-detail-drawer-loading")).toBeInTheDocument();
    expect(fetchPlan).toHaveBeenCalledWith(PLAN_ID, expect.any(AbortSignal));
  });

  it("should render the error state with a retry button when the fetch rejects", async () => {
    let attempts = 0;
    const fetchPlan = vi.fn(() => {
      attempts += 1;
      if (attempts === 1) {
        return Promise.reject(new Error("Falha de rede."));
      }
      return Promise.resolve(makePlan());
    });

    render(
      <PlanDetailDrawer
        planId={PLAN_ID}
        onClose={() => {}}
        fetchPlan={fetchPlan}
      />,
    );

    expect(
      await screen.findByTestId("plan-detail-drawer-error"),
    ).toBeInTheDocument();
    expect(screen.getByText("Falha de rede.")).toBeInTheDocument();

    const retry = screen.getByRole("button", { name: "Tentar novamente" });
    fireEvent.click(retry);

    expect(
      await screen.findByTestId("plan-detail-drawer-success"),
    ).toBeInTheDocument();
    expect(fetchPlan).toHaveBeenCalledTimes(2);
  });

  it("should render the populated detail with payments and a link to plan management", async () => {
    const fetchPlan = vi.fn(() => Promise.resolve(makePlan()));
    render(
      <PlanDetailDrawer
        planId={PLAN_ID}
        onClose={() => {}}
        fetchPlan={fetchPlan}
      />,
    );

    await screen.findByTestId("plan-detail-drawer-success");

    // Full client name shown (operational requirement per PRD §5.2).
    expect(screen.getByText("João da Silva")).toBeInTheDocument();
    expect(screen.getByText("Rex")).toBeInTheDocument();
    expect(screen.getByText("j***@email.com")).toBeInTheDocument();
    expect(screen.getByText("(47) 9****-4567")).toBeInTheDocument();
    expect(screen.getAllByTestId("plan-detail-drawer-payment")).toHaveLength(1);

    const link = screen.getByTestId("plan-detail-drawer-open-management");
    expect(link).toHaveAttribute("href", `/admin/planos/${PLAN_ID}`);
  });

  it("should render the empty payments placeholder when the plan has no payments", async () => {
    const fetchPlan = vi.fn(() => Promise.resolve(makePlan({ payments: [] })));
    render(
      <PlanDetailDrawer
        planId={PLAN_ID}
        onClose={() => {}}
        fetchPlan={fetchPlan}
      />,
    );

    await screen.findByTestId("plan-detail-drawer-success");
    expect(
      screen.getByTestId("plan-detail-drawer-no-payments"),
    ).toBeInTheDocument();
  });

  it("should call onClose when the overlay is clicked", async () => {
    const onClose = vi.fn();
    const fetchPlan = vi.fn(() => Promise.resolve(makePlan()));
    render(
      <PlanDetailDrawer
        planId={PLAN_ID}
        onClose={onClose}
        fetchPlan={fetchPlan}
      />,
    );

    await screen.findByTestId("plan-detail-drawer-success");
    fireEvent.click(screen.getByTestId("plan-detail-drawer-overlay"));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });
});
