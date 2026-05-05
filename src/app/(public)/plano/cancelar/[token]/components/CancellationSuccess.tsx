import { CircleCheck } from 'lucide-react';
import { formatDateBR } from '@/lib/format/date';

interface CancellationSuccessProps {
  coveredUntil: string | null;
}

/**
 * Success screen displayed after the plan cancellation is confirmed.
 * Shows `coveredUntil` formatted in Brazilian Portuguese.
 */
export function CancellationSuccess({ coveredUntil }: CancellationSuccessProps) {
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
          Cancelamento confirmado
        </h2>
        <p className="text-base text-foreground max-w-sm mx-auto">
          O cancelamento do seu plano foi registrado com sucesso.
        </p>
        {coveredUntil && (
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Sua cobertura permanece ativa até{' '}
            <span className="font-semibold text-foreground">
              {formatDateBR(coveredUntil)}
            </span>
            .
          </p>
        )}
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4 max-w-sm w-full text-sm text-muted-foreground space-y-1">
        <p>
          O cancelamento é definitivo e não pode ser revertido. Se desejar
          contratar um novo plano no futuro, basta realizar uma nova contratação.
        </p>
        <p className="mt-2">
          Em caso de dúvidas, entre em contato com nossa equipe pelo WhatsApp.
        </p>
      </div>
    </div>
  );
}
