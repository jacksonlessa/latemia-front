/**
 * Storybook stories for ClientFilterBar molecule.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 *
 * NOTE: ClientFilterBar uses useRouter and useSearchParams from Next.js.
 * When Storybook is configured, a Next.js router decorator/mock will be
 * required. The stories below render the visual shell for documentation
 * purposes; full interactivity requires the router decorator.
 */

import type React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Admin - Clientes/Molecules/ClientFilterBar',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story type helper (minimal — no @storybook/react dependency)
// ---------------------------------------------------------------------------

type Story = {
  render?: () => React.ReactElement;
  name?: string;
};

// ---------------------------------------------------------------------------
// Visual shell (no router dependency)
// ---------------------------------------------------------------------------

function ClientFilterBarShell({ value = '' }: { value?: string }) {
  return (
    <div className="relative flex-1">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6E]"
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder="Buscar por nome, CPF ou telefone..."
        defaultValue={value}
        className="pl-9"
        aria-label="Buscar clientes"
        readOnly
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Barra de busca vazia — estado inicial */
export const Default: Story = {
  name: 'Padrão (vazio)',
  render: () => <ClientFilterBarShell />,
};

/** Barra de busca com valor preenchido */
export const WithSearchValue: Story = {
  name: 'Com busca preenchida',
  render: () => <ClientFilterBarShell value="Maria da Silva" />,
};
