/**
 * Storybook stories for the DelinquencySummaryCard organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from "react";
import { DelinquencySummaryCard } from "./DelinquencySummaryCard";

const meta = {
  title: "Admin/Dashboard/DelinquencySummaryCard",
  component: DelinquencySummaryCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = {
  render?: (
    args: React.ComponentProps<typeof DelinquencySummaryCard>,
  ) => React.ReactElement;
  args?: Partial<React.ComponentProps<typeof DelinquencySummaryCard>>;
  name?: string;
};

/** Variante padrão — clientes inadimplentes e mensagens pendentes hoje. */
export const Default: Story = {
  name: "Padrão",
  args: {
    totalDelinquentClients: 12,
    clientsWithPendingMessageToday: 5,
  },
};

/** Nenhum cliente inadimplente no momento. */
export const ZeroInadimplentes: Story = {
  name: "Zero inadimplentes",
  args: {
    totalDelinquentClients: 0,
    clientsWithPendingMessageToday: 0,
  },
};

/** Estado de carregamento (skeleton). */
export const Loading: Story = {
  name: "Loading",
  args: {
    state: "loading",
  },
};

/** Estado de erro — falha ao carregar o resumo, sem quebrar o dashboard. */
export const ErrorState: Story = {
  name: "Error",
  args: {
    state: "error",
    errorMessage: "Não foi possível carregar o resumo de inadimplência",
  },
};
