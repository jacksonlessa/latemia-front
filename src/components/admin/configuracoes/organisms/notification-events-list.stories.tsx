/**
 * Storybook stories for NotificationEventsList organism.
 * NOTE: Storybook is not yet configured. CSF stories.
 */

import type React from "react";
import { NotificationEventsList } from "./notification-events-list";
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

const meta: Meta<typeof NotificationEventsList> = {
  title: "Admin/Configuracoes/Organisms/NotificationEventsList",
  component: NotificationEventsList,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;

const events: NotificationEventConfigDto[] = (
  [
    "plan.created",
    "plan.statusChanged",
    "plan.paymentFailed",
    "plan.renewed",
  ] as NotificationEventType[]
).map((type, idx) => ({
  type,
  enabled: idx % 2 === 0,
  updatedAt: new Date().toISOString(),
}));

const okAction = async (type: NotificationEventType, enabled: boolean) => ({
  success: true as const,
  data: { type, enabled, updatedAt: new Date().toISOString() },
});

const errorAction = async () => ({
  success: false as const,
  error: { code: "UNKNOWN_EVENT_TYPE", message: "Erro." },
});

const pendingAction = (): Promise<never> => new Promise(() => {});

export const Default: StoryObj<typeof NotificationEventsList> = {
  name: "Padrão",
  args: { events, toggleAction: okAction },
};

export const Loading: StoryObj<typeof NotificationEventsList> = {
  name: "Carregando (toggle pendente)",
  args: { events, toggleAction: pendingAction },
};

export const Empty: StoryObj<typeof NotificationEventsList> = {
  name: "Vazio",
  args: { events: [], toggleAction: okAction },
};

export const Error: StoryObj<typeof NotificationEventsList> = {
  name: "Erro de carregamento",
  args: {
    events: [],
    fetchError: "Falha ao carregar eventos.",
    toggleAction: okAction,
  },
};

export const Disabled: StoryObj<typeof NotificationEventsList> = {
  name: "Erro ao alternar",
  args: { events, toggleAction: errorAction },
};
