/**
 * Shared types for the payment-update domain.
 *
 * LGPD: TokenContext intentionally excludes CPF, e-mail, and phone.
 * Only petName and planStatus are returned by the backend.
 */

export interface TokenContext {
  petName: string;
  planStatus: string;
  chargesBehavior: 'immediate' | 'next_cycle';
}

export interface ConsumeResult {
  chargesBehavior: 'immediate' | 'next_cycle';
}
