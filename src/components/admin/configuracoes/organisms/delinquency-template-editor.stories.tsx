/**
 * Storybook stories for DelinquencyTemplateEditor organism.
 * NOTE: Storybook is not yet configured. CSF stories.
 */

import type React from "react";
import { DelinquencyTemplateEditor } from "./delinquency-template-editor";
import type { DelinquencyTemplateDto } from "@/lib/types/delinquency";

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

const meta: Meta<typeof DelinquencyTemplateEditor> = {
  title: "Admin/Configuracoes/Organisms/DelinquencyTemplateEditor",
  component: DelinquencyTemplateEditor,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;

const templates: DelinquencyTemplateDto[] = [1, 2, 5, 10, 14].map(
  (stageDays) => ({
    stageDays,
    title: `Lembrete — ${stageDays} dia(s) de atraso`,
    body: `Olá [nome do tutor], notamos que o pagamento do plano de [nome do pet] está com ${stageDays} dia(s) de atraso. Atualize seus dados aqui: [LINK]`,
    updatedById: "user-uuid-0001",
    updatedAt: new Date().toISOString(),
  }),
);

const okAction = async (
  stageDays: number,
  input: { title: string; body: string },
) => ({
  success: true as const,
  data: {
    stageDays,
    title: input.title,
    body: input.body,
    updatedById: "user-uuid-0001",
    updatedAt: new Date().toISOString(),
  },
});

const errorAction = async () => ({
  success: false as const,
  error: {
    code: "TEMPLATE_MISSING_LINK_PLACEHOLDER",
    message: "O corpo da mensagem deve conter o placeholder [LINK].",
  },
});

const pendingAction = (): Promise<never> => new Promise(() => {});

export const Default: StoryObj<typeof DelinquencyTemplateEditor> = {
  name: "Padrão",
  args: { templates, saveAction: okAction },
};

export const Loading: StoryObj<typeof DelinquencyTemplateEditor> = {
  name: "Carregando (salvamento pendente)",
  args: { templates, saveAction: pendingAction },
};

export const Error: StoryObj<typeof DelinquencyTemplateEditor> = {
  name: "Erro de carregamento",
  args: {
    templates: [],
    fetchError: "Não foi possível carregar os templates de mensagem.",
    saveAction: okAction,
  },
};

export const Disabled: StoryObj<typeof DelinquencyTemplateEditor> = {
  name: "Desabilitado (sem permissão de escrita)",
  args: { templates, saveAction: errorAction, disabled: true },
};
