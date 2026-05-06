/**
 * Storybook stories for the PlanDetailDrawer organism.
 *
 * NOTE: Storybook is not yet configured in this project. These stories
 * follow the CSF (Component Story Format) convention and inject custom
 * `fetchPlan` implementations to exercise each lifecycle state without
 * a real backend or Route Handler.
 */

import type React from "react";
import { PlanDetailDrawer } from "./PlanDetailDrawer";
import type { DrawerPlanDetail } from "@/lib/types/plan";

const meta = {
  title: "Admin/Dashboard/PlanDetailDrawer",
  component: PlanDetailDrawer,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = {
  render?: (
    args: React.ComponentProps<typeof PlanDetailDrawer>,
  ) => React.ReactElement;
  args?: Partial<React.ComponentProps<typeof PlanDetailDrawer>>;
  name?: string;
};

const FAKE_PLAN_ID = "11111111-1111-1111-1111-111111111111";

const successPlan: DrawerPlanDetail = {
  id: FAKE_PLAN_ID,
  status: "ativo",
  createdAt: "2026-03-16T13:30:00.000Z",
  pagarmeSubscriptionId: "sub_abcdef0123456789",
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
    {
      id: "pay-2",
      status: "pago",
      amount: "59.90",
      createdAt: "2026-03-16T13:30:00.000Z",
      paidAt: "2026-03-16T13:30:45.000Z",
    },
  ],
};

const successPlanNoPayments: DrawerPlanDetail = {
  ...successPlan,
  status: "pendente",
  firstPaidAt: undefined,
  gracePeriodEndsAt: undefined,
  pagarmeSubscriptionId: undefined,
  payments: [],
};

/** Loading state — fetcher never resolves while the story is open. */
export const Loading: Story = {
  name: "Loading",
  args: {
    planId: FAKE_PLAN_ID,
    onClose: () => {},
    fetchPlan: () => new Promise<DrawerPlanDetail>(() => {}),
  },
};

/** Error state — fetcher rejects with a representative backend message. */
export const Error: Story = {
  name: "Error",
  args: {
    planId: FAKE_PLAN_ID,
    onClose: () => {},
    fetchPlan: () =>
      Promise.reject(new globalThis.Error("Falha ao carregar o plano.")),
  },
};

/** Success state — fetched plan renders with two paid charges. */
export const SuccessWithPayments: Story = {
  name: "Success — with payments",
  args: {
    planId: FAKE_PLAN_ID,
    onClose: () => {},
    fetchPlan: () => Promise.resolve(successPlan),
  },
};

/** Success state — fetched plan renders without any payment yet. */
export const SuccessNoPayments: Story = {
  name: "Success — no payments",
  args: {
    planId: FAKE_PLAN_ID,
    onClose: () => {},
    fetchPlan: () => Promise.resolve(successPlanNoPayments),
  },
};
