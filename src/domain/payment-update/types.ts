/**
 * Shared types for the payment-update domain.
 *
 * LGPD: TokenContext intentionally excludes CPF, e-mail, and phone.
 * Only petName and planStatus are returned by the backend.
 */

/**
 * Comportamento de cobrança derivado do status do plano no momento da
 * geração do token. Mantido por compatibilidade retroativa com o frontend
 * legado — o novo contrato canônico do consumo é `outcome`.
 *
 * - `next_cycle`     — `ativo`/`carencia`: novo cartão usado no próximo ciclo.
 * - `first_charge`   — `pendente`: primeira cobrança será processada agora.
 * - `overdue_charge` — `inadimplente`: cobrança em atraso processada agora.
 */
export type ChargesBehavior = 'next_cycle' | 'first_charge' | 'overdue_charge';

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

export interface TokenContext {
  petName: string;
  planStatus: string;
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
