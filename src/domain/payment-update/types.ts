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
 * - `charge_paid`            — cartão atualizado e retry aprovado.
 * - `charge_pending`         — cartão atualizado e retry em processamento.
 * - `charge_failed`          — cartão atualizado mas retry recusado;
 *                              token permanece ativo para nova tentativa.
 */
export type ConsumeOutcome =
  | 'card_updated_no_charge'
  | 'charge_paid'
  | 'charge_pending'
  | 'charge_failed';

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
   * Mensagem do gateway quando `outcome === 'charge_failed'`.
   * Sem PII de cartão; usada apenas para exibição inline.
   */
  failureMessage?: string;
}
