import { CircleCheck } from 'lucide-react';

export interface PaymentUpdateSuccessProps {
  chargesBehavior: 'immediate' | 'next_cycle';
}

const MESSAGES: Record<'immediate' | 'next_cycle', string> = {
  immediate:
    'Dados atualizados com sucesso! Uma nova tentativa de cobrança será realizada em breve.',
  next_cycle:
    'Dados atualizados com sucesso! Seu novo cartão será utilizado na próxima cobrança.',
};

/**
 * Success screen displayed after the payment card is updated.
 * Mirrors the visual style of StepSucesso in /contratar.
 */
export function PaymentUpdateSuccess({
  chargesBehavior,
}: PaymentUpdateSuccessProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <CircleCheck
        size={64}
        className="text-[#4E8C75]"
        aria-hidden="true"
        strokeWidth={1.5}
      />

      <div className="space-y-2">
        <h2 className="font-display text-2xl text-forest">
          Cartão atualizado!
        </h2>
        <p className="text-base text-foreground max-w-sm mx-auto">
          {MESSAGES[chargesBehavior]}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4 max-w-sm w-full text-sm text-muted-foreground">
        Em caso de dúvidas, entre em contato com nossa equipe pelo WhatsApp.
      </div>
    </div>
  );
}
