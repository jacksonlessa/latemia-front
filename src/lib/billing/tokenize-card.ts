/**
 * Tokeniza um cartão diretamente na Pagar.me a partir do browser.
 *
 * Chama `POST https://api.pagar.me/core/v5/tokens?appId=<NEXT_PUBLIC_PAGARME_PUBLIC_KEY>`
 * sem usar bibliotecas externas. O token retornado expira em 60s — quem chama
 * DEVE encaminhá-lo imediatamente ao backend.
 *
 * LGPD/PCI: nenhum dado de cartão é persistido pelo frontend; logs nunca
 * incluem PAN, CVV ou nome do titular. Apenas `last_four_digits` e `brand`
 * podem ser propagados para fins de exibição/debug.
 */
import { ValidationError } from '@/lib/validation-error';

const PAGARME_TOKENS_URL = 'https://api.pagar.me/core/v5/tokens';

export interface TokenizeCardBillingAddress {
  /** Apenas dígitos. */
  zipCode: string;
  city: string;
  /** UF de 2 letras. */
  state: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood?: string;
  /** ISO-2 (default 'BR'). */
  country?: string;
}

export interface TokenizeCardInput {
  /** Apenas dígitos (16–19). */
  number: string;
  holderName: string;
  /** "01"–"12". */
  expMonth: string;
  /** Ano com 2 ou 4 dígitos (ex.: "30" ou "2030"). */
  expYear: string;
  /** 3–4 dígitos. */
  cvv: string;
  /**
   * Endereço de cobrança — obrigatório para que o token gere `billing_address`
   * embutido. Sem isso, a Pagar.me responde `validation_error | billing |
   * "value" is required` ao processar a primeira charge da subscription.
   */
  billingAddress?: TokenizeCardBillingAddress;
}

export interface TokenizeCardResult {
  cardToken: string;
  brand?: string;
  lastFourDigits?: string;
}

interface PagarmeTokenResponse {
  id?: string;
  card?: {
    last_four_digits?: string;
    brand?: string;
  };
}

interface PagarmeErrorResponse {
  message?: string;
  errors?: Record<string, string[]> | unknown;
}

function getPublicKey(): string {
  const key = process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY;
  if (!key || key.trim() === '') {
    throw new Error(
      'Configuração ausente: NEXT_PUBLIC_PAGARME_PUBLIC_KEY não está definida.',
    );
  }
  return key;
}

/** Normaliza o ano para 2 dígitos (a Pagar.me aceita "30" para 2030). */
function normalizeExpYear(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 4) return digits.slice(2);
  return digits;
}

/** Mapeia a resposta de erro da Pagar.me para um {@link ValidationError} pt-BR. */
function mapErrorPayload(status: number, payload: PagarmeErrorResponse | null): ValidationError {
  // 422 => dados do cartão inválidos.
  if (status === 422) {
    return new ValidationError({
      _form: 'Dados do cartão inválidos. Confira número, validade e CVV.',
      _code: 'INVALID_CARD_DATA',
    });
  }

  // 401/403 normalmente indicam token expirado ou chave incorreta.
  if (status === 401 || status === 403) {
    return new ValidationError({
      _form: 'A sessão de pagamento expirou. Refaça o cartão e tente novamente.',
      _code: 'CARD_TOKEN_EXPIRED',
    });
  }

  const message =
    payload?.message ??
    'Não foi possível validar seu cartão agora. Tente novamente em instantes.';
  return new ValidationError({
    _form: message,
    _code: 'INVALID_CARD_DATA',
  });
}

export async function tokenizeCard(input: TokenizeCardInput): Promise<TokenizeCardResult> {
  const publicKey = getPublicKey();

  const number = input.number.replace(/\D/g, '');
  const cvv = input.cvv.replace(/\D/g, '');
  const expMonth = input.expMonth.replace(/\D/g, '').padStart(2, '0');
  const expYear = normalizeExpYear(input.expYear);
  const holderName = input.holderName.trim();

  const billing = input.billingAddress;
  const billingAddress = billing
    ? {
        line_1: `${billing.number} ${billing.street}${
          billing.complement ? ', ' + billing.complement : ''
        }`.trim(),
        line_2: billing.neighborhood ?? '',
        zip_code: billing.zipCode.replace(/\D/g, ''),
        city: billing.city,
        state: billing.state,
        country: billing.country ?? 'BR',
      }
    : undefined;

  const body: Record<string, unknown> = {
    type: 'card',
    card: {
      number,
      holder_name: holderName,
      exp_month: Number(expMonth),
      exp_year: Number(expYear),
      cvv,
      ...(billingAddress ? { billing_address: billingAddress } : {}),
    },
  };

  const url = `${PAGARME_TOKENS_URL}?appId=${encodeURIComponent(publicKey)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // Erro de rede — sem detalhes para evitar vazar contexto.
    throw new ValidationError({
      _form: 'Não foi possível contatar o provedor de pagamento. Verifique sua conexão e tente novamente.',
      _code: 'INVALID_CARD_DATA',
    });
  }

  if (!response.ok) {
    let payload: PagarmeErrorResponse | null = null;
    try {
      payload = (await response.json()) as PagarmeErrorResponse;
    } catch {
      payload = null;
    }
    throw mapErrorPayload(response.status, payload);
  }

  let payload: PagarmeTokenResponse;
  try {
    payload = (await response.json()) as PagarmeTokenResponse;
  } catch {
    throw new ValidationError({
      _form: 'Resposta inválida do provedor de pagamento. Tente novamente.',
      _code: 'INVALID_CARD_DATA',
    });
  }

  if (!payload?.id) {
    throw new ValidationError({
      _form: 'Resposta inválida do provedor de pagamento. Tente novamente.',
      _code: 'INVALID_CARD_DATA',
    });
  }

  return {
    cardToken: payload.id,
    brand: payload.card?.brand,
    lastFourDigits: payload.card?.last_four_digits,
  };
}
