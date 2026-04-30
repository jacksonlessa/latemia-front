/**
 * Storybook stories for the MockDataBanner atom.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from "react";
import { MockDataBanner } from "./MockDataBanner";

const meta = {
  title: "Admin/Dashboard/MockDataBanner",
  component: MockDataBanner,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = {
  render?: () => React.ReactElement;
  name?: string;
};

/** Variante padrão — faixa amarela com texto fixo. */
export const Default: Story = {
  name: "Padrão",
};
