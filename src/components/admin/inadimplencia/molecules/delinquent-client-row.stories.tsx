/**
 * Storybook stories for the DelinquentClientRow molecule.
 *
 * NOTE: Storybook is not yet configured in this project. These stories
 * follow the CSF (Component Story Format) convention and will be picked up
 * automatically once Storybook is installed (see
 * payment-update-link-section.stories.tsx for the precedent).
 *
 * Variants required by task 6.9:
 * - severity ranges (1-2 yellow, 5-10 orange, 14 red)
 * - no pending message (applicableStage: null)
 * - trackingUnavailable (backfill gap — neutral badge)
 */

import type React from "react";
import { DelinquentClientRow } from "./delinquent-client-row";
import type { DelinquentClientDto } from "@/lib/types/delinquency";

const meta = {
  title: "Admin - Inadimplência/Molecules/DelinquentClientRow",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;

type Story = {
  render?: () => React.ReactElement;
  name?: string;
};

function buildClient(
  overrides: Partial<DelinquentClientDto>,
): DelinquentClientDto {
  return {
    clientId: "client-uuid-0001",
    clientName: "Maria Silva",
    clientPhone: "+5511999998888",
    daysOverdue: 2,
    delinquentSince: "2026-08-01T00:00:00.000Z",
    applicableStage: 2,
    petNames: ["Rex"],
    trackingUnavailable: false,
    ...overrides,
  };
}

export const YellowSeverity: Story = {
  name: "Severidade amarela (1-2 dias)",
  render: () => <DelinquentClientRow client={buildClient({ daysOverdue: 2, applicableStage: 2 })} />,
};

export const OrangeSeverity: Story = {
  name: "Severidade laranja (5-10 dias)",
  render: () => (
    <DelinquentClientRow
      client={buildClient({ daysOverdue: 7, applicableStage: 5, petNames: ["Rex", "Mel"] })}
    />
  ),
};

export const RedSeverity: Story = {
  name: "Severidade vermelha (14 dias)",
  render: () => <DelinquentClientRow client={buildClient({ daysOverdue: 14, applicableStage: 14 })} />,
};

export const NoPendingMessage: Story = {
  name: "Sem mensagem pendente",
  render: () => (
    <DelinquentClientRow client={buildClient({ daysOverdue: 3, applicableStage: null })} />
  ),
};

export const TrackingUnavailable: Story = {
  name: "Atraso desde antes do rastreamento",
  render: () => (
    <DelinquentClientRow
      client={buildClient({
        daysOverdue: null,
        delinquentSince: null,
        applicableStage: null,
        trackingUnavailable: true,
      })}
    />
  ),
};

export const WithActions: Story = {
  name: "Com ações (slot preenchido)",
  render: () => (
    <DelinquentClientRow
      client={buildClient({ daysOverdue: 5, applicableStage: 5 })}
      actions={<span className="text-xs text-[#4E8C75]">[ações aqui]</span>}
    />
  ),
};
