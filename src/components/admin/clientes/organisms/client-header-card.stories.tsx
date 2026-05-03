/**
 * Storybook stories for ClientHeaderCard organism.
 */

import type React from 'react';
import { ClientHeaderCard } from './client-header-card';
import type { ClientDetail } from '@/lib/types/client';

const meta = {
  title: 'Admin - Clientes/Organisms/ClientHeaderCard',
  component: ClientHeaderCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = {
  render?: (args: unknown) => React.ReactElement;
  args?: Record<string, unknown>;
  name?: string;
};

const mockClient: Pick<ClientDetail, 'name' | 'cpf' | 'phone' | 'email' | 'addresses'> = {
  name: 'Maria Oliveira Santos',
  cpf: '12345678901',
  phone: '47987654321',
  email: 'maria.oliveira@email.com',
  addresses: [
    {
      id: 'addr-1',
      cep: '88010-000',
      street: 'Rua Felipe Schmidt',
      number: '100',
      complement: 'Apto 302',
      city: 'Florianópolis',
      state: 'SC',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  ],
};

/** Estado padrão com botão de edição */
export const Default: Story = {
  name: 'Default (com edição)',
  args: {
    client: mockClient,
    onEditClient: () => alert('Editar cliente'),
  },
};

/** Sem callback de edição (server render) */
export const SemEdicao: Story = {
  name: 'Sem botão de edição',
  args: {
    client: mockClient,
  },
};

/** Sem endereço cadastrado */
export const SemEndereco: Story = {
  name: 'Sem endereço',
  args: {
    client: {
      ...mockClient,
      addresses: [],
    },
    onEditClient: () => alert('Editar cliente'),
  },
};

/** Nome longo */
export const NomeLongo: Story = {
  name: 'Nome longo',
  args: {
    client: {
      ...mockClient,
      name: 'Joana Figueiredo de Albuquerque Cavalcante e Silva',
      email: 'joana.figueiredo.albuquerque.cavalcante@empresa-longa.com.br',
    },
    onEditClient: () => alert('Editar cliente'),
  },
};
