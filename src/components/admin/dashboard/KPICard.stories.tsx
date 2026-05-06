/**
 * Storybook stories for the KPICard atom.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from "react";
import { KPICard } from "./KPICard";

const meta = {
  title: "Admin/Dashboard/KPICard",
  component: KPICard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = {
  render?: (args: React.ComponentProps<typeof KPICard>) => React.ReactElement;
  args?: Partial<React.ComponentProps<typeof KPICard>>;
  name?: string;
};

/** Variante padrão com valor e variação positiva. */
export const Default: Story = {
  name: "Padrão (com variação)",
  args: {
    title: "Tutores ativos",
    value: 142,
    comparison: { delta: 8, deltaPercent: 5.6 },
  },
};

/** Estado de carregamento (skeleton). */
export const Loading: Story = {
  name: "Loading",
  args: {
    title: "Tutores ativos",
    value: 0,
    state: "loading",
  },
};

/** Estado vazio — sem dados disponíveis. */
export const Empty: Story = {
  name: "Empty",
  args: {
    title: "Tutores ativos",
    value: 0,
    state: "empty",
  },
};

/** Estado de erro — falha ao carregar dado. */
export const ErrorState: Story = {
  name: "Error",
  args: {
    title: "Tutores ativos",
    value: 0,
    state: "error",
    errorMessage: "Falha ao carregar",
  },
};

/** Sem comparativo disponível — placeholder textual. */
export const SemComparativo: Story = {
  name: "Sem comparativo",
  args: {
    title: "Pets cadastrados",
    value: 87,
    comparison: null,
  },
};

/** Valor mascarado (atendente em "Receita do mês"). */
export const Masked: Story = {
  name: "Mascarado",
  args: {
    title: "Receita do mês",
    value: "R$ 12.345,00",
    masked: true,
  },
};

/** Com barra de progresso (Planos ativos). */
export const WithProgress: Story = {
  name: "Com progress bar",
  args: {
    title: "Planos ativos",
    value: "92%",
    comparison: { delta: 3, deltaPercent: 3.4 },
    progress: { current: 92, total: 100 },
  },
};

/** Variação negativa — ícone vermelho. */
export const NegativeTrend: Story = {
  name: "Variação negativa",
  args: {
    title: "Planos inadimplentes",
    value: 3,
    comparison: { delta: -2, deltaPercent: -40 },
  },
};

/** Com barra segmentada (ativos / carência / inadimplentes). */
export const WithSegmentedProgress: Story = {
  name: "Com barra segmentada",
  args: {
    title: "Planos ativos",
    value: "92%",
    comparison: { delta: 6, deltaPercent: 3.4 },
    segmentedProgress: { ativos: 184, carencia: 12, inadimplentes: 4, total: 200 },
  },
};
