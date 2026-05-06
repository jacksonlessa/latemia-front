import { AlertCircle } from 'lucide-react';

/**
 * Screen displayed when the payment-update token is invalid, expired, or
 * already used.
 *
 * Intentionally generic — does not distinguish between cases to prevent
 * token enumeration.
 */
export function PaymentUpdateInvalid() {
  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <AlertCircle
        size={64}
        className="text-amber-500"
        aria-hidden="true"
        strokeWidth={1.5}
      />

      <div className="space-y-2">
        <h2 className="font-display text-2xl text-forest">
          Link indisponível
        </h2>
        <p className="text-base text-foreground max-w-sm mx-auto">
          Este link de atualização de pagamento não está mais disponível.
        </p>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Ele pode ter expirado, já ter sido utilizado, ou ser inválido.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4 max-w-sm w-full text-sm text-muted-foreground">
        Se precisar de um novo link, entre em contato com nossa equipe pelo
        WhatsApp.
      </div>
    </div>
  );
}
