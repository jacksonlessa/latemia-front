/**
 * Storybook stories for the DelinquencyActionButtons molecule.
 *
 * NOTE: Storybook is not yet configured in this project. These stories
 * follow the CSF (Component Story Format) convention and will be picked up
 * automatically once Storybook is installed (see
 * payment-update-link-section.stories.tsx for the precedent).
 *
 * Variants required by task 6.9:
 * - default (idle, ready to dispatch)
 * - loading (WhatsApp / copy in progress) — via prop overrides
 * - error (STAGE_NOT_APPLICABLE / generic) — via prop override
 */

import type React from "react";
import { DelinquencyActionButtons } from "./delinquency-action-buttons";
import type { DelinquencyTemplateDto } from "@/lib/types/delinquency";

const meta = {
  title: "Admin - Inadimplência/Molecules/DelinquencyActionButtons",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;

type Story = {
  render?: () => React.ReactElement;
  name?: string;
};

const mockClient = {
  clientId: "client-uuid-0001",
  clientName: "Maria Silva",
  clientPhone: "+5511999998888",
  petNames: ["Rex"],
  applicableStage: 2,
};

const mockTemplate: DelinquencyTemplateDto = {
  stageDays: 2,
  title: "Lembrete",
  body: "Olá [nome do tutor], notamos que o pagamento do [nome do pet] está em atraso. Regularize por aqui: [LINK]",
  updatedById: null,
  updatedAt: "2026-08-01T00:00:00.000Z",
};

export const Default: Story = {
  name: "Padrão (pronto para disparar)",
  render: () => (
    <DelinquencyActionButtons client={mockClient} template={mockTemplate} />
  ),
};

export const LoadingWhatsApp: Story = {
  name: "Carregando (Abrir WhatsApp)",
  render: () => (
    <DelinquencyActionButtons
      client={mockClient}
      template={mockTemplate}
      isSendingWhatsApp={true}
    />
  ),
};

export const LoadingCopy: Story = {
  name: "Carregando (Copiar mensagem)",
  render: () => (
    <DelinquencyActionButtons
      client={mockClient}
      template={mockTemplate}
      isCopying={true}
    />
  ),
};

export const StageNotApplicableError: Story = {
  name: "Erro — estágio não mais pendente",
  render: () => (
    <DelinquencyActionButtons
      client={mockClient}
      template={mockTemplate}
      errorMessage="Este estágio não está mais pendente para este cliente. A lista será atualizada."
    />
  ),
};

export const GenericError: Story = {
  name: "Erro genérico",
  render: () => (
    <DelinquencyActionButtons
      client={mockClient}
      template={mockTemplate}
      errorMessage="Não foi possível registrar o disparo. Tente novamente."
    />
  ),
};
