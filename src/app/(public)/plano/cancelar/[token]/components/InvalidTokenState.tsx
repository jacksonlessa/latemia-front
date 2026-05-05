import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export type InvalidTokenReason = 'expired' | 'used' | 'not_found';

interface InvalidTokenStateProps {
  reason: InvalidTokenReason;
}

interface StateConfig {
  icon: React.ReactNode;
  title: string;
  message: React.ReactNode;
}

/**
 * WhatsApp support link.
 * Configure NEXT_PUBLIC_SUPPORT_WHATSAPP in your environment (e.g. "5511999999999").
 * Falls back to a placeholder href if the variable is not set.
 */
const SUPPORT_WHATSAPP_HREF = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP
  ? `https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP}`
  : // TODO: replace placeholder with the real support number in NEXT_PUBLIC_SUPPORT_WHATSAPP
    'https://wa.me/5500000000000';

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
        message: (
          <>
            Este link expirou.{' '}
            <a
              href={SUPPORT_WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[#4E8C75] hover:text-[#3a6e5c]"
            >
              Entre em contato pelo WhatsApp
            </a>{' '}
            para solicitar um novo link.
          </>
        ),
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
 * For the "expired" case, a WhatsApp support link is shown so the client can
 * request a new link (configured via NEXT_PUBLIC_SUPPORT_WHATSAPP env var).
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
        Em caso de dúvidas,{' '}
        <a
          href={SUPPORT_WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-[#4E8C75] hover:text-[#3a6e5c]"
        >
          entre em contato com nossa equipe pelo WhatsApp
        </a>
        .
      </div>
    </div>
  );
}
