/**
 * Plan eligibility helpers for the payment-update flow.
 *
 * Centralizes the allow-list of plan statuses for which the admin can
 * generate (and the public client can consume) a payment-update link.
 *
 * Mirrors the backend rule defined in
 * `latemia-back/src/payment-update-tokens/use-cases/generate-token.use-case.ts`:
 *   - Allowed: `ativo`, `carencia`, `pendente`, `inadimplente`.
 *   - Blocked (HTTP 422): `cancelado`, `estornado`, `contestado`.
 *
 * Keeping the rule in a shared module avoids drift between the admin
 * detail page (visibility), the organism component (docs/error messages),
 * and any future surface that needs the same predicate.
 */

import type { PlanStatus } from '@/lib/types/plan';

/**
 * Plan statuses for which a payment-update link may be generated.
 *
 * Order is informational (matches the natural lifecycle: active → grace →
 * pending first charge → overdue) and does not affect predicate semantics.
 */
export const PAYMENT_UPDATE_ELIGIBLE_STATUSES = [
  'ativo',
  'carencia',
  'pendente',
  'inadimplente',
] as const satisfies readonly PlanStatus[];

export type PaymentUpdateEligibleStatus =
  (typeof PAYMENT_UPDATE_ELIGIBLE_STATUSES)[number];

/**
 * Returns `true` when the given plan status allows generating a
 * payment-update link, `false` for terminal statuses
 * (`cancelado`, `estornado`, `contestado`).
 */
export function canGeneratePaymentUpdateLink(status: PlanStatus): boolean {
  return (PAYMENT_UPDATE_ELIGIBLE_STATUSES as readonly PlanStatus[]).includes(
    status,
  );
}
