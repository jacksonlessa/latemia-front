/**
 * Storybook stories for the HeaderClientSearch organism.
 *
 * NOTE: Storybook is not yet configured in this project. These stories
 * follow the CSF (Component Story Format) convention and will be picked
 * up automatically once Storybook is installed — same approach as
 * `HeaderSearchResultItem.stories.tsx` (task 3.0).
 *
 * Variants required by task 4.0:
 *   - Default              → idle, popover closed.
 *   - Loading              → fetcher pending → "Buscando…".
 *   - Empty                → fetcher returns []  → "Nenhum cliente encontrado".
 *   - Error                → fetcher rejects     → "Não foi possível buscar.".
 *   - WithResults          → fetcher returns 3 hits + footer link.
 *   - KeyboardNavigation   → focused, item index 1 highlighted.
 *
 * The fetcher is injected via prop (`fetcher`) so each story renders
 * deterministically without touching `globalThis.fetch`.
 */

import type React from "react";

import { HeaderClientSearch } from "./HeaderClientSearch";
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

const meta: Meta<typeof HeaderClientSearch> = {
  title: "Admin/Layout/HeaderClientSearch/HeaderClientSearch",
  component: HeaderClientSearch,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const sampleClients: ClientListItem[] = [
  {
    id: "clt_01HABCXYZ001",
    name: "Maria da Silva",
    cpfMasked: "123.***.***-99",
    phoneMasked: "(11) 9****-4321",
    email: "maria.silva@example.com",
    createdAt: "2026-04-15T13:24:00.000Z",
  },
  {
    id: "clt_01HABCXYZ002",
    name: "Mario Rodrigues",
    cpfMasked: "987.***.***-11",
    phoneMasked: "(11) 9****-1234",
    email: "mario.rodrigues@example.com",
    createdAt: "2026-04-12T09:10:00.000Z",
  },
  {
    id: "clt_01HABCXYZ003",
    name: "Marcela Faria",
    cpfMasked: "456.***.***-22",
    phoneMasked: "(21) 9****-5678",
    email: "marcela.faria@example.com",
    createdAt: "2026-04-10T16:42:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

/** Resolves immediately with the sample list (truncated to `count`). */
function makeResolvedFetcher(count: number) {
  return async (
    _term: string,
    _signal: AbortSignal,
  ): Promise<ClientListItem[]> => {
    return sampleClients.slice(0, count);
  };
}

/** Never resolves — keeps the popover in `loading` indefinitely. */
function makePendingFetcher() {
  return (_term: string, _signal: AbortSignal): Promise<ClientListItem[]> => {
    return new Promise<ClientListItem[]>(() => {
      /* never resolves */
    });
  };
}

/** Always rejects with a generic error. */
function makeRejectedFetcher() {
  return async (
    _term: string,
    _signal: AbortSignal,
  ): Promise<ClientListItem[]> => {
    throw new Error("UPSTREAM_FAILURE");
  };
}

/** Wraps the search in a fixed-width column so the popover positioning is
 *  obvious in Storybook. */
function HeaderShell({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="w-[480px] bg-white p-4">
      <div className="hidden max-w-lg flex-1 md:block">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Estado inicial — popover fechado, input vazio. */
export const Default: StoryObj<typeof HeaderClientSearch> = {
  name: "Padrão (idle, fechado)",
  args: {
    fetcher: makeResolvedFetcher(3),
  },
  render: (args) => (
    <HeaderShell>
      <HeaderClientSearch {...args} />
    </HeaderShell>
  ),
};

/** Termo digitado e fetch pendente — popover com spinner "Buscando…". */
export const Loading: StoryObj<typeof HeaderClientSearch> = {
  name: "Carregando",
  args: {
    fetcher: makePendingFetcher(),
    initialTerm: "ma",
    initialOpen: true,
  },
  render: (args) => (
    <HeaderShell>
      <HeaderClientSearch {...args} />
    </HeaderShell>
  ),
};

/** Backend respondeu sem nenhum hit. */
export const Empty: StoryObj<typeof HeaderClientSearch> = {
  name: "Vazio (nenhum cliente)",
  args: {
    fetcher: makeResolvedFetcher(0),
    initialTerm: "zzz",
    initialOpen: true,
  },
  render: (args) => (
    <HeaderShell>
      <HeaderClientSearch {...args} />
    </HeaderShell>
  ),
};

/** Falha no upstream — mensagem genérica de erro. */
export const ErrorState: StoryObj<typeof HeaderClientSearch> = {
  name: "Erro",
  args: {
    fetcher: makeRejectedFetcher(),
    initialTerm: "ma",
    initialOpen: true,
  },
  render: (args) => (
    <HeaderShell>
      <HeaderClientSearch {...args} />
    </HeaderShell>
  ),
};

/** Lista de resultados + rodapé "Ver todos os resultados →". */
export const WithResults: StoryObj<typeof HeaderClientSearch> = {
  name: "Com resultados",
  args: {
    fetcher: makeResolvedFetcher(3),
    initialTerm: "ma",
    initialOpen: true,
  },
  render: (args) => (
    <HeaderShell>
      <HeaderClientSearch {...args} />
    </HeaderShell>
  ),
};

/** Demonstra o estado de navegação por teclado: 2º item destacado. */
export const KeyboardNavigation: StoryObj<typeof HeaderClientSearch> = {
  name: "Navegação por teclado (item destacado)",
  args: {
    fetcher: makeResolvedFetcher(3),
    initialTerm: "ma",
    initialOpen: true,
    initialHighlightedIndex: 1,
  },
  render: (args) => (
    <HeaderShell>
      <HeaderClientSearch {...args} />
    </HeaderShell>
  ),
};
