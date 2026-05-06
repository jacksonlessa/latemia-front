/**
 * Storybook stories for SettingsForm organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from "react";
import { SettingsForm } from "./settings-form";
import type { SystemSettingsDto, UpdateSystemSettingsInput } from "@/lib/types/system-settings";

// ---------------------------------------------------------------------------
// Meta / StoryObj types (local shim — replace with @storybook/react once installed)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof SettingsForm> = {
  title: "Admin/Configuracoes/Organisms/SettingsForm",
  component: SettingsForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Shared mock save action
// ---------------------------------------------------------------------------

const mockSaveSuccess = async (_payload: UpdateSystemSettingsInput) => ({
  success: true as const,
  data: { payment_provider: "pagarme", subscription_plan_id: "plan_abc123" } as SystemSettingsDto,
});

const mockSaveError = async (_payload: UpdateSystemSettingsInput) => ({
  success: false as const,
  error: { code: "INVALID_SUBSCRIPTION_PLAN_ID", message: "ID inválido." },
});

const mockSavePending = (): Promise<never> => new Promise(() => {});

const filledValues: SystemSettingsDto = {
  payment_provider: "pagarme",
  subscription_plan_id: "plan_abc123",
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Estado padrão com valores preenchidos */
export const Default: StoryObj<typeof SettingsForm> = {
  name: "Padrão (com valores)",
  args: {
    initialValues: filledValues,
    saveAction: mockSaveSuccess,
  },
};

/** Estado de carregamento — botão Salvar em estado pendente */
export const Loading: StoryObj<typeof SettingsForm> = {
  name: "Carregando (submit em andamento)",
  args: {
    initialValues: filledValues,
    saveAction: mockSavePending,
  },
};

/** Estado vazio — sem valores iniciais (primeira configuração) */
export const Empty: StoryObj<typeof SettingsForm> = {
  name: "Vazio (sem configurações)",
  args: {
    initialValues: null,
    saveAction: mockSaveSuccess,
  },
};

/** Estado de erro no fetch inicial */
export const FetchError: StoryObj<typeof SettingsForm> = {
  name: "Erro no carregamento",
  args: {
    initialValues: null,
    fetchError: "Não foi possível carregar as configurações do sistema.",
    saveAction: mockSaveSuccess,
  },
};

/** Estado de erro no submit */
export const SubmitError: StoryObj<typeof SettingsForm> = {
  name: "Erro ao salvar",
  render: () => (
    <SettingsForm
      initialValues={filledValues}
      saveAction={mockSaveError}
    />
  ),
};

/** Botão desabilitado quando não há mudanças */
export const Disabled: StoryObj<typeof SettingsForm> = {
  name: "Sem alterações (botão desabilitado)",
  args: {
    initialValues: filledValues,
    saveAction: mockSaveSuccess,
  },
};
