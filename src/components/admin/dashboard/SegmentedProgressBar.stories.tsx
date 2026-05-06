/**
 * Storybook stories for the SegmentedProgressBar component.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from "react";
import { SegmentedProgressBar } from "./SegmentedProgressBar";

const meta = {
  title: "Admin/Dashboard/SegmentedProgressBar",
  component: SegmentedProgressBar,
};
export default meta;

type Story = {
  render?: (args: React.ComponentProps<typeof SegmentedProgressBar>) => React.ReactElement;
  args?: Partial<React.ComponentProps<typeof SegmentedProgressBar>>;
  name?: string;
};

/** Distribuição típica com três segmentos. */
export const Default: Story = {
  name: "Default (distribuição típica)",
  args: { ativos: 60, carencia: 25, inadimplentes: 15, total: 100 },
};

/** Apenas planos ativos — barra totalmente verde. */
export const SóAtivos: Story = {
  name: "Só Ativos",
  args: { ativos: 100, carencia: 0, inadimplentes: 0, total: 100 },
};

/** Apenas planos em carência — barra totalmente âmbar. */
export const SóCarência: Story = {
  name: "Só Carência",
  args: { ativos: 0, carencia: 100, inadimplentes: 0, total: 100 },
};

/** Total zero — nenhum plano ativo (sem divisão por zero). */
export const TotalZero: Story = {
  name: "Total Zero",
  args: { ativos: 0, carencia: 0, inadimplentes: 0, total: 0 },
};
