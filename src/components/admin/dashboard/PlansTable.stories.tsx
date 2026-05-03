/**
 * Storybook stories for the PlansTable organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention.
 */

import type React from "react";
import { PlansTable } from "./PlansTable";
import type { PlanListItem, PlanListMeta } from "@/lib/types/plan";

const meta = {
  title: "Admin/Dashboard/PlansTable",
  component: PlansTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = {
  render?: (args: React.ComponentProps<typeof PlansTable>) => React.ReactElement;
  args?: Partial<React.ComponentProps<typeof PlansTable>>;
  name?: string;
};

const adminRows: PlanListItem[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    status: "ativo",
    clientId: "c1",
    clientName: "João Silva",
    petId: "pet-1",
    petName: "Rex",
    createdAt: "2026-04-12T10:00:00.000Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    status: "carencia",
    clientId: "c2",
    clientName: "Maria Santos",
    petId: "pet-2",
    petName: "Luna",
    createdAt: "2026-04-08T09:00:00.000Z",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    status: "inadimplente",
    clientId: "c3",
    clientName: "Carlos Souza",
    petId: "pet-3",
    petName: "Bolt",
    createdAt: "2026-03-25T11:30:00.000Z",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    status: "cancelado",
    clientId: "c4",
    clientName: "Ana Paula",
    petId: "pet-4",
    petName: "Mel",
    createdAt: "2026-03-15T14:00:00.000Z",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    status: "pendente",
    clientId: "c5",
    clientName: "Pedro Lima",
    petId: "pet-5",
    petName: "Thor",
    createdAt: "2026-04-22T16:45:00.000Z",
  },
];

const atendenteRows: PlanListItem[] = adminRows.map((row) => {
  const parts = row.clientName.split(" ");
  const masked =
    parts.length <= 1
      ? row.clientName
      : `${parts.slice(0, -1).join(" ")} ${parts[parts.length - 1]!.charAt(0).toUpperCase()}.`;
  return { ...row, clientName: masked };
});

function meta5(total: number): PlanListMeta {
  return { total, page: 1, limit: 20, totalPages: Math.max(1, Math.ceil(total / 20)) };
}

/** Default — admin sees full client names. */
export const Default: Story = {
  name: "Admin (default)",
  args: {
    data: adminRows,
    meta: meta5(adminRows.length),
    currentFilters: {},
    onSelectPlan: () => {},
  },
};

/** Atendente — clientName is masked server-side (last name as initial). */
export const Atendente: Story = {
  name: "Atendente (clientName mascarado)",
  args: {
    data: atendenteRows,
    meta: meta5(atendenteRows.length),
    currentFilters: {},
    onSelectPlan: () => {},
  },
};

/** Empty state. */
export const Empty: Story = {
  name: "Vazio",
  args: {
    data: [],
    meta: meta5(0),
    currentFilters: {},
    onSelectPlan: () => {},
  },
};

/** With status filter applied. */
export const WithFilter: Story = {
  name: "Com filtro de status aplicado",
  args: {
    data: adminRows.filter((r) => r.status === "ativo"),
    meta: meta5(1),
    currentFilters: { status: "ativo", search: "joão" },
    onSelectPlan: () => {},
  },
};
