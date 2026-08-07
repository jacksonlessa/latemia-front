/**
 * Storybook stories for the DelinquentClientsList organism.
 *
 * NOTE: Storybook is not yet configured in this project. These stories
 * follow the CSF (Component Story Format) convention and will be picked up
 * automatically once Storybook is installed (see
 * payment-update-link-section.stories.tsx for the precedent).
 *
 * Variants required by task 6.9:
 * - default (mixed severities, with/without pending message)
 * - empty (no delinquent clients)
 * - error (fetchError set — initial server-side load failed)
 */

import type React from "react";
import { DelinquentClientsList } from "./delinquent-clients-list";
import type {
  DelinquencyTemplateDto,
  DelinquentClientDto,
} from "@/lib/types/delinquency";

const meta = {
  title: "Admin - Inadimplência/Organisms/DelinquentClientsList",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;

type Story = {
  render?: () => React.ReactElement;
  name?: string;
};

const mockTemplates: DelinquencyTemplateDto[] = [1, 2, 5, 10, 14].map(
  (stageDays) => ({
    stageDays,
    title: `Estágio ${stageDays}`,
    body: `Olá [nome do tutor], mensagem do estágio de ${stageDays} dias para [nome do pet]. Link: [LINK]`,
    updatedById: null,
    updatedAt: "2026-08-01T00:00:00.000Z",
  }),
);

const mockClients: DelinquentClientDto[] = [
  {
    clientId: "client-uuid-0001",
    clientName: "Maria Silva",
    clientPhone: "+5511999998888",
    daysOverdue: 14,
    delinquentSince: "2026-07-24T00:00:00.000Z",
    applicableStage: 14,
    petNames: ["Rex"],
    trackingUnavailable: false,
  },
  {
    clientId: "client-uuid-0002",
    clientName: "João Pereira",
    clientPhone: "+5511988887777",
    daysOverdue: 7,
    delinquentSince: "2026-07-31T00:00:00.000Z",
    applicableStage: 5,
    petNames: ["Mel", "Thor"],
    trackingUnavailable: false,
  },
  {
    clientId: "client-uuid-0003",
    clientName: "Ana Souza",
    clientPhone: "+5511977776666",
    daysOverdue: 2,
    delinquentSince: "2026-08-05T00:00:00.000Z",
    applicableStage: 2,
    petNames: ["Luna"],
    trackingUnavailable: false,
  },
  {
    clientId: "client-uuid-0004",
    clientName: "Carlos Lima",
    clientPhone: "+5511966665555",
    daysOverdue: 4,
    delinquentSince: "2026-08-03T00:00:00.000Z",
    applicableStage: null,
    petNames: ["Bolt"],
    trackingUnavailable: false,
  },
  {
    clientId: "client-uuid-0005",
    clientName: "Fernanda Costa",
    clientPhone: "+5511955554444",
    daysOverdue: null,
    delinquentSince: null,
    applicableStage: null,
    petNames: ["Nina"],
    trackingUnavailable: true,
  },
];

export const Default: Story = {
  name: "Padrão (severidades mistas)",
  render: () => (
    <DelinquentClientsList initialClients={mockClients} templates={mockTemplates} />
  ),
};

export const Empty: Story = {
  name: "Vazio (nenhum cliente inadimplente)",
  render: () => <DelinquentClientsList initialClients={[]} templates={mockTemplates} />,
};

export const Error: Story = {
  name: "Erro ao carregar",
  render: () => (
    <DelinquentClientsList
      initialClients={[]}
      templates={mockTemplates}
      fetchError="Não foi possível carregar a listagem de inadimplência."
    />
  ),
};
