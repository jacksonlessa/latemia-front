/**
 * Storybook stories for the RecentUsage organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from "react";
import { RecentUsage } from "./RecentUsage";

const meta = {
  title: "Admin/Dashboard/RecentUsage",
  component: RecentUsage,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = {
  render?: (args: React.ComponentProps<typeof RecentUsage>) => React.ReactElement;
  args?: Partial<React.ComponentProps<typeof RecentUsage>>;
  name?: string;
};

/** Variante padrão — usa mocks internos com 6 usos recentes. */
export const Default: Story = {
  name: "Padrão",
  args: {},
};

/** Estado vazio — nenhum uso registrado. */
export const Empty: Story = {
  name: "Empty",
  args: {
    usages: [],
  },
};
