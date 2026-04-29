/**
 * Storybook stories for NotificationBufferTable organism.
 *
 * NOTE: Storybook is not yet configured in this project. CSF stories.
 */

import type React from "react";
import { NotificationBufferTable } from "./notification-buffer-table";
import type {
  NotificationBufferEntryDto,
  NotificationBufferListResponse,
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

const meta: Meta<typeof NotificationBufferTable> = {
  title: "Admin/Configuracoes/Organisms/NotificationBufferTable",
  component: NotificationBufferTable,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;

const sampleItems: NotificationBufferEntryDto[] = [
  {
    id: "1",
    type: "plan.created",
    provider: "telegram",
    status: "sent",
    reason: "quiet_hours",
    occurredAt: "2026-04-29T01:00:00Z",
    createdAt: "2026-04-29T01:00:00Z",
    sentAt: "2026-04-29T07:01:00Z",
    attempts: 1,
    lastError: null,
  },
  {
    id: "2",
    type: "plan.paymentFailed",
    provider: "telegram",
    status: "pending",
    reason: "provider_failure",
    occurredAt: "2026-04-29T03:30:00Z",
    createdAt: "2026-04-29T03:30:00Z",
    sentAt: null,
    attempts: 2,
    lastError: "HTTP 502 Bad Gateway",
  },
];

const filled: NotificationBufferListResponse = {
  items: sampleItems,
  nextCursor: null,
};

const empty: NotificationBufferListResponse = { items: [], nextCursor: null };

const okAction = async () => ({ success: true as const, data: filled });
const emptyAction = async () => ({ success: true as const, data: empty });
const errorAction = async () => ({
  success: false as const,
  error: { code: "UNKNOWN_ERROR", message: "Falha ao listar buffer." },
});
const pendingAction = (): Promise<never> => new Promise(() => {});

export const Default: StoryObj<typeof NotificationBufferTable> = {
  name: "Padrão",
  args: { initialData: filled, listAction: okAction },
};

export const Loading: StoryObj<typeof NotificationBufferTable> = {
  name: "Carregando",
  args: { initialData: null, listAction: pendingAction },
};

export const Empty: StoryObj<typeof NotificationBufferTable> = {
  name: "Vazio",
  args: { initialData: empty, listAction: emptyAction },
};

export const Error: StoryObj<typeof NotificationBufferTable> = {
  name: "Erro",
  args: {
    initialData: null,
    initialError: "Falha ao carregar buffer.",
    listAction: errorAction,
  },
};

export const Disabled: StoryObj<typeof NotificationBufferTable> = {
  name: "Sem mais entradas",
  args: { initialData: { items: sampleItems, nextCursor: null }, listAction: okAction },
};
