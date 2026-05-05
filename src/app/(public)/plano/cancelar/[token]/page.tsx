import type { Metadata } from 'next';
import {
  previewCancelPlanUseCase,
  TokenExpiredError,
  TokenUsedError,
  TokenNotFoundError,
} from '@/domain/plan/preview-cancel-plan.use-case';
import { PublicCancelPlanForm } from './components/PublicCancelPlanForm';
import { InvalidTokenState } from './components/InvalidTokenState';

export const metadata: Metadata = {
  title: 'Cancelar Plano — Late & Mia',
  description: 'Confirme o cancelamento do seu plano de emergência veterinária.',
};

/**
 * CancelarPlanoPage
 *
 * Server Component that fetches the cancellation preview for a given token
 * and renders either the confirmation form or an appropriate error state.
 *
 * The token is masked in all log/error messages: only the first 4 characters
 * are exposed (`token=${token.slice(0,4)}…`).
 *
 * States:
 *   - valid token   → renders PublicCancelPlanForm with masked plan data
 *   - TOKEN_EXPIRED → renders InvalidTokenState reason="expired"
 *   - TOKEN_USED    → renders InvalidTokenState reason="used"
 *   - 404           → renders InvalidTokenState reason="not_found"
 *   - other error   → re-throws (Next.js error boundary handles it)
 */
export default async function CancelarPlanoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  try {
    const preview = await previewCancelPlanUseCase(token);
    return (
      <main className="mx-auto max-w-lg px-4 py-10">
        <div className="mb-8 text-center space-y-1">
          <h1 className="font-display text-2xl text-forest">
            Cancelar plano
          </h1>
          <p className="text-sm text-muted-foreground">
            Late &amp; Mia — Plano de Emergência Veterinária
          </p>
        </div>
        <PublicCancelPlanForm preview={preview} token={token} />
      </main>
    );
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return (
        <main className="mx-auto max-w-lg px-4 py-10">
          <InvalidTokenState reason="expired" />
        </main>
      );
    }

    if (err instanceof TokenUsedError) {
      return (
        <main className="mx-auto max-w-lg px-4 py-10">
          <InvalidTokenState reason="used" />
        </main>
      );
    }

    if (err instanceof TokenNotFoundError) {
      return (
        <main className="mx-auto max-w-lg px-4 py-10">
          <InvalidTokenState reason="not_found" />
        </main>
      );
    }

    // Unexpected error — let Next.js error boundary handle it
    throw err;
  }
}
