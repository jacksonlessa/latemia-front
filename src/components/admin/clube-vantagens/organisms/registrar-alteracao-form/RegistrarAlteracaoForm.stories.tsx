/**
 * Storybook stories for the RegistrarAlteracaoForm organism.
 *
 * NOTE: Storybook is not yet configured in this project — these stories follow
 * the CSF convention (same as `CancelPlanDialog.stories.tsx`) and will be
 * picked up automatically once Storybook is installed.
 *
 * Because the form is fully stateful (all fields, submitting, error, success
 * are internal useState), stories that demonstrate non-default internal
 * states use parameter docs describing how to reproduce them manually during
 * visual QA.
 */

import type React from 'react';
import { RegistrarAlteracaoForm } from './RegistrarAlteracaoForm';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Admin/ClubeVantagens/Organisms/RegistrarAlteracaoForm',
  component: RegistrarAlteracaoForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Organism do painel admin para registrar uma alteração da Tabela do Clube de Vantagens. ' +
          'Aplica validações client-side (versão, janela D+30, tamanho do resumo) e exige confirmação dupla.',
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story type helper (minimal — no @storybook/react dependency)
// ---------------------------------------------------------------------------

type Story = {
  render?: (
    args: React.ComponentProps<typeof RegistrarAlteracaoForm>,
  ) => React.ReactElement;
  args?: Partial<React.ComponentProps<typeof RegistrarAlteracaoForm>>;
  name?: string;
  parameters?: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Estado padrão (idle) — campos vazios com versionFrom pré-preenchido a partir
 * de `CLUBE_VANTAGENS_VERSION`. Botão "Registrar e disparar comunicação"
 * desabilitado até que todas as validações passem.
 */
export const Idle: Story = {
  name: 'Idle (campos vazios)',
  args: {
    defaultVersionFrom: 'v1.0',
    onSuccess: () => {},
  },
};

/**
 * Estado idle sem `defaultVersionFrom` — admin precisa digitar manualmente
 * a versão atual.
 */
export const IdleWithoutDefaultVersion: Story = {
  name: 'Idle (sem versão padrão)',
  args: {
    onSuccess: () => {},
  },
};

/**
 * Estado "submitting" — botão exibe spinner "Registrando…" e todos os
 * campos ficam desabilitados.
 *
 * Para reproduzir: preencha um formulário válido, marque o checkbox e
 * clique em "Registrar e disparar comunicação". O estado dura enquanto
 * a requisição está em andamento.
 */
export const Submitting: Story = {
  name: 'Submetendo (loading)',
  parameters: {
    docs: {
      description: {
        story:
          'Para reproduzir: preencha versões válidas, data ≥ D+30, resumo ≥ 20 chars, ' +
          'marque o checkbox e clique "Registrar e disparar comunicação". O botão exibe ' +
          'spinner "Registrando…" enquanto aguarda resposta do servidor.',
      },
    },
  },
  args: {
    defaultVersionFrom: 'v1.0',
    onSuccess: () => {},
  },
};

/**
 * Estado de erro — backend retornou 400 (data efetiva < D+30).
 * Mensagem inline: "A data efetiva deve ser pelo menos 30 dias no futuro."
 *
 * Para reproduzir: configure o Route Handler para retornar 400 com code
 * `EFFECTIVE_DATE_TOO_EARLY` e clique "Registrar e disparar comunicação".
 */
export const ErrorEffectiveDateTooEarly: Story = {
  name: 'Erro — data efetiva inválida (400)',
  parameters: {
    docs: {
      description: {
        story:
          'Exibe mensagem inline de erro quando o backend retorna HTTP 400 / ' +
          'EffectiveDateTooEarlyError. ' +
          'Para reproduzir: simule retorno 400 no Route Handler e clique no botão de submit.',
      },
    },
  },
  args: {
    defaultVersionFrom: 'v1.0',
    onSuccess: () => {},
  },
};

/**
 * Estado de erro — backend retornou 409 (alteração duplicada).
 * Mensagem inline: "Já existe alteração registrada para essa versão e data."
 *
 * Para reproduzir: tente registrar duas vezes a mesma alteração
 * `(versionTo, effectiveDate)` ou simule retorno 409 no Route Handler.
 */
export const ErrorDuplicateAlteracao: Story = {
  name: 'Erro — alteração duplicada (409)',
  parameters: {
    docs: {
      description: {
        story:
          'Exibe mensagem inline "Já existe alteração registrada para essa versão e data." ' +
          'quando o servidor retorna HTTP 409 / DuplicateAlteracaoError. ' +
          'Para reproduzir: simule retorno 409 no Route Handler ou tente submeter ' +
          'duas vezes com o mesmo par (versionTo, effectiveDate).',
      },
    },
  },
  args: {
    defaultVersionFrom: 'v1.0',
    onSuccess: () => {},
  },
};

/**
 * Estado de erro — backend retornou 403 (usuário não-admin).
 * Mensagem inline: "Apenas administradores podem registrar alterações da tabela."
 *
 * Para reproduzir: efetue login como atendente e tente acessar a página
 * (em produção o Server Component redireciona antes, mas o erro permanece
 * para defesa em profundidade).
 */
export const ErrorForbidden: Story = {
  name: 'Erro — usuário não-admin (403)',
  parameters: {
    docs: {
      description: {
        story:
          'Exibe mensagem inline de erro quando o backend retorna HTTP 403 / ' +
          'ForbiddenAlteracaoError. Em produção o Server Component shell ' +
          'redireciona atendentes antes que esta tela apareça — esta variante ' +
          'é apenas defesa em profundidade.',
      },
    },
  },
  args: {
    defaultVersionFrom: 'v1.0',
    onSuccess: () => {},
  },
};

/**
 * Estado de sucesso — alteração registrada com sumário visível
 * ("85/87 e-mails enviados (2 falhas)"). Os campos são limpos
 * automaticamente para permitir um novo registro seguro.
 *
 * Para reproduzir: preencha o formulário com dados válidos, submeta e
 * aguarde a resposta 201 do backend.
 */
export const Success: Story = {
  name: 'Sucesso (com sumário)',
  parameters: {
    docs: {
      description: {
        story:
          'Após resposta 201 do backend, o componente exibe banner de sucesso ' +
          'com o sumário (X/Y e-mails enviados, Z falhas). Os campos são limpos ' +
          'e uma nova `Idempotency-Key` é gerada para o próximo registro. ' +
          'O callback `onSuccess` é chamado para que o orchestrator refresque a listagem.',
      },
    },
  },
  args: {
    defaultVersionFrom: 'v1.0',
    onSuccess: () => {},
  },
};
