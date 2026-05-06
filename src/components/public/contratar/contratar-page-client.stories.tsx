/**
 * Storybook stories for ContratarPageClient integration component.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 *
 * Because ContratarPageClient orchestrates sessionStorage, async use-cases, and
 * multi-step navigation, stories use module mocks (see .storybook/preview.ts)
 * in a real Storybook setup. Here they document the integration variants for
 * reference.
 */

import type React from 'react';
import { ContratarPageClient } from './contratar-page-client';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'public/contratar/ContratarPageClient',
  component: ContratarPageClient,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Wizard de contratação multi-passo. Passo 0 invoca o dry-run `validate-client` ' +
          'antes de avançar; ValidationError retorna automaticamente ao passo do campo com erro.',
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story type helper (minimal — no @storybook/react dependency)
// ---------------------------------------------------------------------------

type Story = {
  render?: () => React.ReactElement;
  name?: string;
  parameters?: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Passo 0 — estado padrão (vazio, sem erros).
 * O botão "Avançar" chama o dry-run e bloqueia duplo-clique durante a requisição.
 */
export const Passo0Padrao: Story = {
  name: 'Passo 0 — Padrão',
  render: () => <ContratarPageClient />,
};

/**
 * Passo 0 em loading — simula o estado enquanto o dry-run está em andamento.
 * O botão "Avançar" deve aparecer como "Validando…" e estar desabilitado.
 *
 * Para simular este estado em um ambiente Storybook real, o mock de
 * `validateClientUseCase` deve retornar uma Promise que nunca resolve.
 */
export const Passo0Loading: Story = {
  name: 'Passo 0 — Loading (validando)',
  parameters: {
    docs: {
      description: {
        story:
          'Para reproduzir: mock `validateClientUseCase` com `new Promise(() => {})` ' +
          'e clique em "Avançar". O botão deve exibir "Validando…" e ficar desabilitado.',
      },
    },
  },
  render: () => <ContratarPageClient />,
};

/**
 * Passo 0 com erro de cidade — city fora da área de atendimento.
 * O CEP retorna cidade não atendida; erro aparece no campo CEP.
 *
 * Para reproduzir manualmente: informe CEP de São Paulo (ex.: 01310-100).
 */
export const Passo0ErroCidade: Story = {
  name: 'Passo 0 — Erro de cidade',
  parameters: {
    docs: {
      description: {
        story:
          'Informe CEP 01310-100 (São Paulo) no campo CEP. ' +
          'A mensagem "No momento atendemos apenas Camboriú..." deve aparecer abaixo do campo.',
      },
    },
  },
  render: () => <ContratarPageClient />,
};

/**
 * Retorno automático do passo 3 para o passo 0.
 * Se o backend retornar ValidationError com campo de passo 0 (ex.: `phone`)
 * durante o registro no passo 3, o stepper volta automaticamente para o passo 0.
 *
 * Para reproduzir: mock `RegisterClientUseCase.execute` para lançar
 * `new ValidationError({ phone: 'Telefone inválido...' })` e confirme
 * que o stepper retorna ao passo 0 com o erro destacado no campo telefone.
 */
export const RetornoAutomaticoParaPasso0: Story = {
  name: 'Retorno automático passo 3 → passo 0',
  parameters: {
    docs: {
      description: {
        story:
          'Mock `RegisterClientUseCase.execute` para lançar ' +
          '`ValidationError({ phone: "..." })`. ' +
          'Após clicar "Concluir" no passo 3, o wizard deve retornar ao passo 0 ' +
          'com o erro exibido no campo telefone.',
      },
    },
  },
  render: () => <ContratarPageClient />,
};
