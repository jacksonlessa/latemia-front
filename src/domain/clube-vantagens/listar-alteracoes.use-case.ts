/**
 * listarAlteracoesClubeVantagensUseCase
 *
 * Chama `GET /api/admin/clube-vantagens/alteracoes` (Route Handler interno)
 * para obter o histórico de alterações da Tabela do Clube de Vantagens. O
 * Route Handler proxia para `GET /v1/admin/clube-vantagens/alteracoes` no
 * backend, anexando o JWT do cookie httpOnly `latemia_session`.
 *
 * Ordenação descendente por `dispatchedAt` é garantida pelo backend; o
 * frontend confia nesta garantia e não reordena.
 *
 * Erros tipados:
 *  - `ApiError` — qualquer resposta não-2xx (o admin que acessa a página já
 *    foi validado no Server Component shell, então 401/403 são improváveis).
 */

import { ApiError } from '@/lib/api-errors';
import type { AlteracaoClubeVantagens } from './types';

/**
 * Resposta da listagem, espelhando `ListarAlteracoesResult` do backend.
 * O envelope `{ data: [...] }` é preservado para futuras expansões
 * (paginação, contadores agregados).
 */
export interface ListarAlteracoesResponse {
  data: AlteracaoClubeVantagens[];
}

/**
 * Busca o histórico de alterações da Tabela do Clube de Vantagens.
 *
 * @returns lista ordenada por `dispatchedAt DESC` (mais recente primeiro).
 * @throws  `ApiError` para qualquer resposta não-2xx.
 */
export async function listarAlteracoesClubeVantagensUseCase(): Promise<
  AlteracaoClubeVantagens[]
> {
  const res = await fetch('/api/admin/clube-vantagens/alteracoes', {
    method: 'GET',
    cache: 'no-store',
  });

  if (res.ok) {
    const body = (await res.json()) as ListarAlteracoesResponse;
    return body.data ?? [];
  }

  let errBody: { code?: string; message?: string } = {};
  try {
    errBody = (await res.json()) as typeof errBody;
  } catch {
    // Resposta sem JSON — usa defaults.
  }

  throw new ApiError(
    res.status,
    errBody.code ?? 'UNKNOWN_ERROR',
    errBody.message ?? `HTTP ${res.status}`,
  );
}
