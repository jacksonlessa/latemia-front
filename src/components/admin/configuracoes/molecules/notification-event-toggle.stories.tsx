/**
 * Storybook stories for NotificationEventToggle molecule.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from "react";
import { NotificationEventToggle } from "./notification-event-toggle";
import type {
  NotificationEventConfigDto,
  NotificationEventType,
} from "@/lib/types/notifications";

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

const meta: Meta<typeof NotificationEventToggle> = {
  title: "Admin/Configuracoes/Molecules/NotificationEventToggle",
  component: NotificationEventToggle,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;

const baseConfig: NotificationEventConfigDto = {
  type: "plan.created" as NotificationEventType,
  enabled: true,
  updatedAt: new Date().toISOString(),
};

const okAction = async (_t: NotificationEventType, enabled: boolean) => ({
  success: true as const,
  data: { ...baseConfig, enabled },
});

const errorAction = async () => ({
  success: false as const,
  error: { code: "UNKNOWN_EVENT_TYPE", message: "Evento desconhecido." },
});

const pendingAction = (): Promise<never> => new Promise(() => {});

export const Default: StoryObj<typeof NotificationEventToggle> = {
  name: "Padrão (ativado)",
  args: { config: baseConfig, toggleAction: okAction },
};

export const Loading: StoryObj<typeof NotificationEventToggle> = {
  name: "Carregando (toggle pendente)",
  args: { config: baseConfig, toggleAction: pendingAction },
};

export const Empty: StoryObj<typeof NotificationEventToggle> = {
  name: "Vazio (desativado)",
  args: {
    config: { ...baseConfig, enabled: false },
    toggleAction: okAction,
  },
};

export const Error: StoryObj<typeof NotificationEventToggle> = {
  name: "Erro ao alternar",
  args: { config: baseConfig, toggleAction: errorAction },
};

export const Disabled: StoryObj<typeof NotificationEventToggle> = {
  name: "Desabilitado",
  args: { config: baseConfig, toggleAction: okAction, disabled: true },
};
