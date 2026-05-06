/**
 * Storybook stories for the AlertsPanel organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from "react";
import { AlertsPanel } from "./AlertsPanel";

const meta = {
  title: "Admin/Dashboard/AlertsPanel",
  component: AlertsPanel,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = {
  render?: (args: React.ComponentProps<typeof AlertsPanel>) => React.ReactElement;
  args?: Partial<React.ComponentProps<typeof AlertsPanel>>;
  name?: string;
};

/** Variante padrão — usa mocks internos com 5 alertas. */
export const Default: Story = {
  name: "Padrão",
  args: {},
};

/** Estado vazio — sem alertas no momento. */
export const Empty: Story = {
  name: "Empty",
  args: {
    alerts: [],
  },
};
