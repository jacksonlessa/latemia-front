/**
 * Storybook stories for QuietHoursForm molecule.
 *
 * NOTE: Storybook is not yet configured in this project. CSF stories.
 */

import type React from "react";
import { QuietHoursForm } from "./quiet-hours-form";
import type { QuietHoursDto } from "@/lib/types/notifications";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Meta<T extends React.ComponentType<any>> = {
  title: string;
  component: T;
  tags?: string[];
  parameters?: Record<string, unknown>;
  args?: Partial<React.ComponentProps<T>>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StoryObj<T extends React.ComponentType<any>> = {
  name?: string;
  render?: (args: React.ComponentProps<T>) => React.ReactElement;
  args?: Partial<React.ComponentProps<T>>;
};

const meta: Meta<typeof QuietHoursForm> = {
  title: "Admin/Configuracoes/Molecules/QuietHoursForm",
  component: QuietHoursForm,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;

const filled: QuietHoursDto = {
  enabled: true,
  start: "22:00",
  end: "07:00",
  timezone: "America/Sao_Paulo",
};

const okAction = async (payload: QuietHoursDto) => ({
  success: true as const,
  data: payload,
});

const errorAction = async () => ({
  success: false as const,
  error: {
    code: "INVALID_QUIET_HOURS_RANGE",
    message: "Faixa inválida.",
  },
});

const pendingAction = (): Promise<never> => new Promise(() => {});

export const Default: StoryObj<typeof QuietHoursForm> = {
  name: "Padrão",
  args: { initialValues: filled, saveAction: okAction },
};

export const Loading: StoryObj<typeof QuietHoursForm> = {
  name: "Carregando (submit em andamento)",
  args: { initialValues: filled, saveAction: pendingAction },
};

export const Empty: StoryObj<typeof QuietHoursForm> = {
  name: "Vazio (sem valores iniciais)",
  args: { initialValues: null, saveAction: okAction },
};

export const Error: StoryObj<typeof QuietHoursForm> = {
  name: "Erro ao salvar",
  args: { initialValues: filled, saveAction: errorAction },
};

export const Disabled: StoryObj<typeof QuietHoursForm> = {
  name: "Desabilitado",
  args: { initialValues: filled, saveAction: okAction, disabled: true },
};

export const FetchError: StoryObj<typeof QuietHoursForm> = {
  name: "Erro no carregamento",
  args: {
    initialValues: null,
    saveAction: okAction,
    fetchError: "Não foi possível carregar a janela de silêncio.",
  },
};
