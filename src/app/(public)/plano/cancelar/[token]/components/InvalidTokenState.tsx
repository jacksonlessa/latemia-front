import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export type InvalidTokenReason = 'expired' | 'used' | 'not_found';

interface InvalidTokenStateProps {
  reason: InvalidTokenReason;
}

interface StateConfig {
  icon: React.ReactNode;
  title: string;
  message: string;
}

function buildConfig(reason: InvalidTokenReason): StateConfig {
  switch (reason) {
    case 'expired':
      return {
        icon: (
          <Clock
            size={64}
            className="text-amber-500"
            aria-hidden="true"
            strokeWidth={1.5}
          />
        ),
        title: 'Link expirado',
        message:
          'Este link expirou. Entre em contato com o atendimento para um novo link.',
      };
    case 'used':
      return {
        icon: (
          <CheckCircle2
            size={64}
            className="text-[#4E8C75]"
            aria-hidden="true"
            strokeWidth={1.5}
          />
        ),
        title: 'Link já utilizado',
        message:
          'Este link já foi utilizado. Se foi você, seu cancelamento já está registrado.',
      };
    case 'not_found':
    default:
      return {
        icon: (
          <AlertCircle
            size={64}
            className="text-amber-500"
            aria-hidden="true"
            strokeWidth={1.5}
          />
        ),
        title: 'Link inválido',
        message: 'Link inválido. Verifique se a URL está correta.',
      };
  }
}

/**
 * Displayed when the cancellation token is expired, already used, or not found.
 * Each reason shows a distinct message so the client knows what happened.
 */
export function InvalidTokenState({ reason }: InvalidTokenStateProps) {
  const { icon, title, message } = buildConfig(reason);

  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      {icon}

      <div className="space-y-2">
        <h2 className="font-display text-2xl text-forest">{title}</h2>
        <p className="text-base text-foreground max-w-sm mx-auto">{message}</p>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4 max-w-sm w-full text-sm text-muted-foreground">
        Em caso de dúvidas, entre em contato com nossa equipe pelo WhatsApp.
      </div>
    </div>
  );
}
