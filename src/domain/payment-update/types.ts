/**
 * Shared types for the payment-update domain.
 *
 * LGPD: TokenContext intentionally excludes CPF, e-mail, and phone.
 * Only tutorMaskedName and petsCovered are returned by the backend.
 *
 * Model: 1 customer = 1 subscription with N items (pivô subscription consolidada).
 * The token is now per-client (not per-plan); all covered pets share one subscription.
 */

/**
 * Comportamento de cobrança agregado dos planos do cliente no momento da
 * geração do token.
 *
 * - `immediate`   — pelo menos 1 plano está em `pendente` ou `inadimplente`:
 *                   cobrança em atraso será processada agora para todos os pets.
 * - `next_cycle`  — todos os planos estão em `ativo`/`carencia`:
 *                   novo cartão usado apenas no próximo ciclo.
 */
export type ChargesBehavior = 'immediate' | 'next_cycle';

/**
 * Desfecho canônico do consumo do token.
 *
 * - `card_updated_no_charge` — cartão atualizado, nenhuma cobrança disparada.
 * - `charge_paid`            — cartão atualizado e a cobrança de recuperação foi aprovada.
 * - `charge_pending`         — cartão atualizado e a cobrança de recuperação está em processamento.
 * - `charge_failed`          — cartão atualizado mas a cobrança de recuperação foi recusada;
 *                              token permanece ativo para nova tentativa (até o limite de falhas).
 * - `token_exhausted`        — limite de falhas do link atingido; o link deixa de aceitar
 *                              novas tentativas e o cliente precisa pedir um link novo.
 */
export type ConsumeOutcome =
  | 'card_updated_no_charge'
  | 'charge_paid'
  | 'charge_pending'
  | 'charge_failed'
  | 'token_exhausted';

/**
 * Contexto retornado pelo backend ao validar o token.
 *
 * LGPD: apenas nome mascarado do tutor e nomes dos pets são expostos.
 * CPF, e-mail e telefone são omitidos.
 */
export interface TokenContext {
  tutorMaskedName: string;
  petsCovered: string[];
  chargesBehavior: ChargesBehavior;
}

export interface ConsumeResult {
  outcome: ConsumeOutcome;
  chargesBehavior: ChargesBehavior;
  /**
   * Mensagem crua do gateway quando `outcome === 'charge_failed'`.
   * Sem PII de cartão; mantida por compatibilidade — preferir `failureDetail`.
   */
  failureMessage?: string;
  /**
   * Código do gateway (ex.: '9201') quando `outcome === 'charge_failed'`.
   * Sem PII de cartão.
   */
  failureCode?: string;
  /**
   * Título fixo do desfecho de recusa, já formatado pelo backend
   * (ex.: "Não foi possível concluir a cobrança").
   */
  failureTitle?: string;
  /**
   * Mensagem + código já formatados pelo backend
   * (ex.: "Transação recusada por excesso de retentativas - Código: 9201").
   * Repassada crua ao cliente, sem tradução ou reescrita no frontend.
   */
  failureDetail?: string;
}
