/**
 * Centralised mapping between OTP backend error codes and pt-BR user-facing
 * messages. Shared by the three OTP use-cases (request/verify/resend) so we
 * never drift between them.
 *
 * Source of truth for the codes: `latemia-back/src/otp/exceptions/*.ts`.
 */

export const CONTRACT_OTP_ERROR_MESSAGES: Record<string, string> = {
  OTP_INVALID: 'Código incorreto. Verifique e tente novamente.',
  OTP_EXPIRED: 'Código expirado. Solicite um novo.',
  OTP_TOO_MANY_ATTEMPTS: 'Muitas tentativas. Solicite um novo código.',
  OTP_COOLDOWN_ACTIVE: 'Aguarde antes de reenviar.',
  OTP_NOT_FOUND: 'Código não encontrado. Solicite um novo.',
  SMS_PROVIDER_UNAVAILABLE:
    'Não conseguimos enviar o SMS agora. Tente em alguns instantes.',
};

export const GENERIC_NETWORK_ERROR_MESSAGE =
  'Erro de conexão. Tente novamente.';
