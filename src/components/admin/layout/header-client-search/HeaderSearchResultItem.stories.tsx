/**
 * Storybook stories for HeaderSearchResultItem molecule.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 *
 * Variants required by task 3.0:
 *   - Default              → idle row, masked CPF/phone present
 *   - Highlighted          → keyboard/mouse highlight active
 *   - LongName             → very long client name (overflow check)
 *   - MissingMaskedFields  → backend returned placeholders for CPF/phone
 */

import type React from "react";
import { HeaderSearchResultItem } from "./HeaderSearchResultItem";
import type { ClientListItem } from "@/lib/types/client";

// ---------------------------------------------------------------------------
// Meta
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

const meta: Meta<typeof HeaderSearchResultItem> = {
  title: "Admin/Layout/HeaderClientSearch/HeaderSearchResultItem",
  component: HeaderSearchResultItem,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const baseClient: ClientListItem = {
  id: "clt_01HABCXYZ",
  name: "Maria da Silva",
  cpfMasked: "123.***.***-99",
  phoneMasked: "(11) 9****-4321",
  email: "maria.silva@example.com",
  createdAt: "2026-04-15T13:24:00.000Z",
};

const longNameClient: ClientListItem = {
  ...baseClient,
  id: "clt_long",
  name: "Maria Aparecida Conceição dos Santos Albuquerque de Oliveira Junior",
};

const missingMasksClient: ClientListItem = {
  ...baseClient,
  id: "clt_missing",
  name: "João Pereira",
  cpfMasked: "—",
  phoneMasked: "—",
};

// All callbacks are no-ops in stories; the parent organism (task 4.0) owns the
// real handlers. Stories only assert visual states.
const noop = (): void => {};

// Render helper wraps the row in a styled <ul> so the dropdown context is
// realistic (the molecule is always rendered inside a listbox).
function ListContainer({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <ul
      role="listbox"
      aria-label="Resultados da busca de clientes"
      className="w-[400px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm"
    >
      {children}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Linha padrão — não destacada, com máscaras presentes. */
export const Default: StoryObj<typeof HeaderSearchResultItem> = {
  name: "Padrão",
  args: {
    client: baseClient,
    isHighlighted: false,
    onSelect: noop,
    onMouseEnter: noop,
    id: "header-search-option-0",
  },
  render: (args) => (
    <ListContainer>
      <HeaderSearchResultItem {...args} />
    </ListContainer>
  ),
};

/** Linha destacada — bg verde claro e nome em verde de marca. */
export const Highlighted: StoryObj<typeof HeaderSearchResultItem> = {
  name: "Destacada (highlight ativo)",
  args: {
    client: baseClient,
    isHighlighted: true,
    onSelect: noop,
    onMouseEnter: noop,
    id: "header-search-option-0",
  },
  render: (args) => (
    <ListContainer>
      <HeaderSearchResultItem {...args} />
    </ListContainer>
  ),
};

/** Nome muito longo — verifica wrap/overflow dentro do container do dropdown. */
export const LongName: StoryObj<typeof HeaderSearchResultItem> = {
  name: "Nome longo",
  args: {
    client: longNameClient,
    isHighlighted: false,
    onSelect: noop,
    onMouseEnter: noop,
    id: "header-search-option-1",
  },
  render: (args) => (
    <ListContainer>
      <HeaderSearchResultItem {...args} />
    </ListContainer>
  ),
};

/** CPF/telefone retornados como placeholders pelo backend. */
export const MissingMaskedFields: StoryObj<typeof HeaderSearchResultItem> = {
  name: "Sem CPF/telefone mascarados",
  args: {
    client: missingMasksClient,
    isHighlighted: false,
    onSelect: noop,
    onMouseEnter: noop,
    id: "header-search-option-2",
  },
  render: (args) => (
    <ListContainer>
      <HeaderSearchResultItem {...args} />
    </ListContainer>
  ),
};
