import { CircleCheck } from 'lucide-react';

/**
 * Success outcomes that map to a dedicated success screen.
 * `charge_failed` is intentionally excluded — that case stays inline on
 * the form so the customer can try another card with the same token.
 */
export type PaymentUpdateSuccessOutcome =
  | 'card_updated_no_charge'
  | 'charge_paid'
  | 'charge_pending';

export interface PaymentUpdateSuccessProps {
  outcome: PaymentUpdateSuccessOutcome;
}

interface SuccessMessage {
  title: string;
  body: string;
}

const OUTCOME_MESSAGES: Record<PaymentUpdateSuccessOutcome, SuccessMessage> = {
  card_updated_no_charge: {
    title: 'Cartão atualizado!',
    body: 'A próxima cobrança seguirá o calendário normal do seu plano.',
  },
  charge_paid: {
    title: 'Pagamento aprovado!',
    body: 'Seu cartão foi atualizado e a cobrança foi processada com sucesso.',
  },
  charge_pending: {
    title: 'Recebemos seu pagamento',
    body: 'Estamos processando — você receberá a confirmação em instantes.',
  },
};

/**
 * Success screen displayed after the payment card is updated.
 * Title and body vary by `outcome` to reflect what actually happened
 * (card-only update vs. retry approved vs. retry pending).
 *
 * Mirrors the visual style of StepSucesso in /contratar.
 */
export function PaymentUpdateSuccess({ outcome }: PaymentUpdateSuccessProps) {
  const { title, body } = OUTCOME_MESSAGES[outcome];

  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <CircleCheck
        size={64}
        className="text-[#4E8C75]"
        aria-hidden="true"
        strokeWidth={1.5}
      />

      <div className="space-y-2">
        <h2 className="font-display text-2xl text-forest">{title}</h2>
        <p className="text-base text-foreground max-w-sm mx-auto">{body}</p>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4 max-w-sm w-full text-sm text-muted-foreground">
        Em caso de dúvidas, entre em contato com nossa equipe pelo WhatsApp.
      </div>
    </div>
  );
}
