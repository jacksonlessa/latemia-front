import { Ban } from 'lucide-react';

/**
 * Screen displayed when the payment-update token has been exhausted after
 * reaching the backend's failure limit for the link (RF-3.2/RF-3.3).
 *
 * Renders NO form — insisting with the same token is exactly what the limit
 * is designed to stop. The customer must ask the clinic for a brand-new link.
 */
export function PaymentUpdateExhausted() {
  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <Ban
        size={64}
        className="text-amber-500"
        aria-hidden="true"
        strokeWidth={1.5}
      />

      <div className="space-y-2">
        <h2 className="font-display text-2xl text-forest">
          Este link expirou
        </h2>
        <p className="text-base text-foreground max-w-sm mx-auto">
          Por segurança, o link é encerrado após duas tentativas sem sucesso.
        </p>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Entre em contato com a clínica para receber um link novo.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4 max-w-sm w-full text-sm text-muted-foreground">
        Fale com nossa equipe pelo WhatsApp para gerar um novo link de
        atualização.
      </div>
    </div>
  );
}
