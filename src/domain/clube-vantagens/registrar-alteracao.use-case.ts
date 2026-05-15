/**
 * registrarAlteracaoClubeVantagensUseCase
 *
 * Chama `POST /api/admin/clube-vantagens/alteracoes` (Route Handler interno do
 * Next.js) para registrar uma alteração da Tabela do Clube de Vantagens e
 * disparar a comunicação aos clientes ativos. O Route Handler proxia para
 * `POST /v1/admin/clube-vantagens/alteracoes` no backend, anexando o JWT
 * obtido do cookie httpOnly `latemia_session`.
 *
 * O caller é responsável por gerar e fornecer o `idempotencyKey` (UUID v4)
 * — geramos uma chave por sessão de formulário e a reutilizamos em retries
 * para preservar idempotência conforme contrato do backend.
 *
 * Erros tipados:
 *  - `EffectiveDateTooEarlyError` — backend 400 quando `effectiveDate` é
 *    menor que hoje + 30 dias (regra contratual rígida).
 *  - `DuplicateAlteracaoError` — backend 409 quando já existe alteração
 *    registrada para o par `(versionTo, effectiveDate)`.
 *  - `ForbiddenAlteracaoError` — backend 403 quando o usuário não é admin
 *    (atendente que tenta registrar).
 *  - `ApiError` — qualquer outra resposta não-2xx (genérica).
 *
 * LGPD: o resumo da alteração não contém PII; apenas o `dispatchedBy`
 * (userId) é registrado pelo backend. Este use-case não loga PII.
 */

import { ApiError } from '@/lib/api-errors';
import type {
  AlteracaoClubeVantagens,
  RegistrarAlteracaoInput,
} from './types';

// ---------------------------------------------------------------------------
// Erros tipados
// ---------------------------------------------------------------------------

/**
 * Lançado quando o backend retorna 400 indicando que a data efetiva é menor
 * que hoje + 30 dias (regra contratual da Cláusula §2.2.2). O admin precisa
 * escolher uma data com pelo menos 30 dias de antecedência.
 */
export class EffectiveDateTooEarlyError extends Error {
  readonly code = 'EFFECTIVE_DATE_TOO_EARLY';
  readonly status = 400;

  constructor(
    message = 'A data efetiva deve ser pelo menos 30 dias no futuro.',
  ) {
    super(message);
    this.name = 'EffectiveDateTooEarlyError';
  }
}

/**
 * Lançado quando o backend retorna 409 indicando que já existe uma alteração
 * registrada para o par `(versionTo, effectiveDate)`. O Idempotency-Key também
 * pode disparar 409 quando duas requisições idênticas concorrentes chegam ao
 * servidor.
 */
export class DuplicateAlteracaoError extends Error {
  readonly code = 'DUPLICATE_ALTERACAO';
  readonly status = 409;

  constructor(
    message = 'Já existe alteração registrada para essa versão e data.',
  ) {
    super(message);
    this.name = 'DuplicateAlteracaoError';
  }
}

/**
 * Lançado quando o backend retorna 403 (usuário não é admin). A página admin
 * já redireciona não-admin antes do submit, mas o erro permanece para o caso
 * de a sessão expirar e o usuário re-logar como atendente sem refresh da rota.
 */
export class ForbiddenAlteracaoError extends Error {
  readonly code = 'FORBIDDEN';
  readonly status = 403;

  constructor(
    message = 'Apenas administradores podem registrar alterações da tabela.',
  ) {
    super(message);
    this.name = 'ForbiddenAlteracaoError';
  }
}

// ---------------------------------------------------------------------------
// Parâmetros do use-case
// ---------------------------------------------------------------------------

export interface RegistrarAlteracaoParams extends RegistrarAlteracaoInput {
  /** UUID v4 estável para a sessão de formulário (reusado em retries). */
  idempotencyKey: string;
}

// ---------------------------------------------------------------------------
// Use-case
// ---------------------------------------------------------------------------

/**
 * Registra uma alteração da Tabela do Clube de Vantagens via Route Handler
 * admin. O Route Handler injeta o JWT a partir do cookie de sessão e
 * encaminha o header `Idempotency-Key` ao backend.
 *
 * @returns o registro persistido (`AlteracaoClubeVantagens`) com os
 *          contadores finais de envio (`totalClientesAlvo`,
 *          `notificacoesEnviadas`, `notificacoesFalhas`).
 *
 * @throws `EffectiveDateTooEarlyError` quando `effectiveDate < D+30`.
 * @throws `DuplicateAlteracaoError` quando `(versionTo, effectiveDate)` já
 *         existe ou quando há colisão de `Idempotency-Key`.
 * @throws `ForbiddenAlteracaoError` quando o usuário não é admin.
 * @throws `ApiError` para qualquer outra resposta não-2xx.
 */
export async function registrarAlteracaoClubeVantagensUseCase(
  params: RegistrarAlteracaoParams,
): Promise<AlteracaoClubeVantagens> {
  const { idempotencyKey, ...body } = params;

  const res = await fetch('/api/admin/clube-vantagens/alteracoes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (res.ok) {
    return (await res.json()) as AlteracaoClubeVantagens;
  }

  let errBody: { code?: string; message?: string } = {};
  try {
    errBody = (await res.json()) as typeof errBody;
  } catch {
    // Resposta sem JSON — usa defaults.
  }

  const code = errBody.code ?? 'UNKNOWN_ERROR';

  if (res.status === 400) {
    throw new EffectiveDateTooEarlyError(errBody.message);
  }
  if (res.status === 409) {
    throw new DuplicateAlteracaoError(errBody.message);
  }
  if (res.status === 403) {
    throw new ForbiddenAlteracaoError(errBody.message);
  }

  throw new ApiError(res.status, code, errBody.message ?? `HTTP ${res.status}`);
}
