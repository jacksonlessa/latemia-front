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
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: "Admin/Configuracoes/Organisms/SettingsForm",
  component: SettingsForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story type helper (minimal — no @storybook/react dependency)
// ---------------------------------------------------------------------------

type Story = {
  render?: () => React.ReactElement;
  args?: Partial<React.ComponentProps<typeof SettingsForm>>;
  name?: string;
};

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
export const Default: Story = {
  name: "Padrão (com valores)",
  args: {
    initialValues: filledValues,
    saveAction: mockSaveSuccess,
  },
};

/** Estado de carregamento — botão Salvar em estado pendente */
export const Loading: Story = {
  name: "Carregando (submit em andamento)",
  args: {
    initialValues: filledValues,
    saveAction: mockSavePending,
  },
};

/** Estado vazio — sem valores iniciais (primeira configuração) */
export const Empty: Story = {
  name: "Vazio (sem configurações)",
  args: {
    initialValues: null,
    saveAction: mockSaveSuccess,
  },
};

/** Estado de erro no fetch inicial */
export const FetchError: Story = {
  name: "Erro no carregamento",
  args: {
    initialValues: null,
    fetchError: "Não foi possível carregar as configurações do sistema.",
    saveAction: mockSaveSuccess,
  },
};

/** Estado de erro no submit */
export const SubmitError: Story = {
  name: "Erro ao salvar",
  render: () => (
    <SettingsForm
      initialValues={filledValues}
      saveAction={mockSaveError}
    />
  ),
};

/** Botão desabilitado quando não há mudanças */
export const Disabled: Story = {
  name: "Sem alterações (botão desabilitado)",
  args: {
    initialValues: filledValues,
    saveAction: mockSaveSuccess,
  },
};
