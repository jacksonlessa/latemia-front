/**
 * FinalizeCheckoutUseCase
 *
 * Orquestra o passo 4 do `/contratar` em 8 estágios canônicos. Cada transição
 * dispara `onStageChange(stage, petName?)` para que o painel de progresso
 * possa refletir a operação real em curso (PRD RF6–RF15).
 *
 * Em qualquer falha após o stage 5 (já existe `pagarme_customer_id`), as
 * subscriptions Pagar.me já criadas são revertidas via
 * `POST /v1/checkout/rollback` em modo fire-and-forget — o usuário recebe
 * o erro imediatamente, sem aguardar o rollback.
 *
 * LGPD/PCI: o cartão é tokenizado no browser (`tokenizeCard`) e somente o
 * `card_token` trafega ao backend. Esta classe não loga, persiste ou expõe
 * dados de cartão.
 */

import { tokenizeCard } from '@/lib/billing/tokenize-card';
import { getApiUrl, extractErrorCode } from '@/lib/api-client';
import type { ApiErrorBody } from '@/lib/api-client';
import { ValidationError } from '@/lib/validation-error';
import { httpFetch } from '@/lib/http';
import { resetAttemptId, getOrCreateAttemptId } from '@/lib/observability/request-id';
import { createIdempotencyKey } from '@/lib/observability/idempotency-key';
import { reportClientError } from '@/lib/observability/client-error-reporter';
import { hashStack } from '@/lib/observability/stack-hash';
import { RegisterClientUseCase } from '@/domain/client/register-client.use-case';
import { RegisterPetUseCase } from '@/domain/pet/register-pet.use-case';
import { RegisterContractUseCase } from '@/domain/contract/register-contract.use-case';
import type { RegisterClientInput, Touchpoint } from '@/lib/types/client';
import type { RegisterPetInput } from '@/lib/types/pet';
import type { CardFormValue } from '@/components/public/contratar/organisms/card-form';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type CheckoutStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface FinalizeCheckoutPetInput {
  /** Nome exibido em mensagens e sub-stages (ex.: "Rex"). */
  name: string;
  data: RegisterPetInput;
}

export interface FinalizeCheckoutInput {
  clientInput: RegisterClientInput;
  pets: FinalizeCheckoutPetInput[];
  cardInput: CardFormValue;
  contractAcceptedAt: string;
  contractVersion: string;
  /**
   * Optional UTM/click-id attribution captured upstream by the
   * TouchpointProvider. Forwarded to `RegisterClientUseCase` at stage 3 only;
   * each side is omitted from the wire when undefined (PRD
   * seo-analytics-lgpd-utm §1.7 — task 7.0).
   */
  touchpoints?: {
    first?: Touchpoint;
    last?: Touchpoint;
  };
  /**
   * IDs já criados em uma tentativa anterior — usado para retomar de onde
   * parou e para o painel pré-marcar etapas concluídas (RF10).
   */
  resume?: {
    clientId?: string;
    petIds?: string[];
    pagarmeCustomerId?: string;
    pagarmeCardId?: string;
    /** Subscription consolidada já criada (se houver). */
    pagarmeSubscriptionId?: string;
  };
}

export interface FinalizeCheckoutResult {
  contractId: string;
  planIds: string[];
  clientId: string;
  petIds: string[];
  pagarmeCustomerId: string;
  pagarmeCardId: string;
  /** ID da subscription consolidada (1 por cliente). */
  pagarmeSubscriptionId: string;
}

export interface OnStageChangePayload {
  stage: CheckoutStage;
}

export type OnStageChange = (payload: OnStageChangePayload) => void;

/**
 * Erro estruturado do orquestrador. `stage` indica em qual etapa do painel
 * a falha deve ser destacada. `message` já vem em pt-BR (ou um fallback
 * neutro) — nunca contém PII.
 */
export class CheckoutError extends Error {
  readonly stage: CheckoutStage;
  readonly code: string;
  /** Subscription Pagar.me já criada no momento da falha (se houver). */
  readonly createdSubscriptionId?: string;
  /** pagarmeCustomerId já obtido (se houver). */
  readonly pagarmeCustomerId?: string;
  /**
   * ID de correlação da tentativa (UUID v4). Exibido na tela de erro para
   * que o cliente possa reportar ao suporte e o dev possa rastrear nos logs.
   */
  readonly requestId?: string;
  /**
   * false = erro terminal, não adianta tentar de novo (ex: já tem assinatura ativa).
   * true  = erro transitório, o cliente pode e deve tentar novamente.
   */
  readonly retryable: boolean;

  constructor(params: {
    stage: CheckoutStage;
    code: string;
    message: string;
    createdSubscriptionId?: string;
    pagarmeCustomerId?: string;
    requestId?: string;
    retryable?: boolean;
  }) {
    super(params.message);
    this.name = 'CheckoutError';
    this.stage = params.stage;
    this.code = params.code;
    this.createdSubscriptionId = params.createdSubscriptionId;
    this.pagarmeCustomerId = params.pagarmeCustomerId;
    this.requestId = params.requestId;
    this.retryable = params.retryable ?? true;
  }
}

// ---------------------------------------------------------------------------
// Internal helpers — stage 1 local validation
// ---------------------------------------------------------------------------

const HOLDER_NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ' .-]+$/;

function validateCardInput(card: CardFormValue): void {
  const number = card.number.replace(/\D/g, '');
  const cvv = card.cvv.replace(/\D/g, '');
  const expiry = card.expiry.replace(/\D/g, '');
  const holder = card.holderName.trim();

  if (number.length < 13 || number.length > 19) {
    throw new CheckoutError({
      stage: 1,
      code: 'INVALID_CARD_DATA',
      message: 'Número do cartão inválido. Verifique e tente novamente.',
    });
  }
  if (!holder || !HOLDER_NAME_REGEX.test(holder)) {
    throw new CheckoutError({
      stage: 1,
      code: 'INVALID_CARD_DATA',
      message: 'Nome impresso inválido. Use apenas letras, espaços e .-\'',
    });
  }
  if (expiry.length !== 4) {
    throw new CheckoutError({
      stage: 1,
      code: 'INVALID_CARD_DATA',
      message: 'Validade inválida. Use o formato MM/AA.',
    });
  }
  const month = Number(expiry.slice(0, 2));
  if (month < 1 || month > 12) {
    throw new CheckoutError({
      stage: 1,
      code: 'INVALID_CARD_DATA',
      message: 'Mês de validade inválido.',
    });
  }
  if (cvv.length < 3 || cvv.length > 4) {
    throw new CheckoutError({
      stage: 1,
      code: 'INVALID_CARD_DATA',
      message: 'CVV inválido.',
    });
  }
}

// ---------------------------------------------------------------------------
// Backend error message mapping (PRD/TechSpec — códigos estáveis)
// ---------------------------------------------------------------------------

const BACKEND_ERROR_MESSAGES: Record<string, string> = {
  CARD_DECLINED:
    'Seu cartão foi recusado. Verifique os dados ou tente outro cartão.',
  INSUFFICIENT_FUNDS: 'Saldo insuficiente. Tente outro cartão.',
  INVALID_CARD_DATA:
    'Dados do cartão inválidos. Confira número e validade.',
  EXPIRED_CARD: 'Cartão expirado. Tente outro cartão.',
  ANTIFRAUD_DENIED:
    'Cobrança não aprovada pela análise antifraude. Tente outro cartão.',
  CARD_TOKEN_EXPIRED:
    'A sessão de pagamento expirou. Refaça o cartão e tente novamente.',
  PAYMENT_NOT_CONFIGURED:
    'Sistema temporariamente indisponível. Tente em alguns minutos.',
  PROVIDER_UPSTREAM:
    'Provedor de pagamento indisponível. Tente novamente.',
  CLIENT_ALREADY_HAS_SUBSCRIPTION:
    'Você já possui um plano ativo. Para contratar novamente, cancele o plano atual. Se precisar de ajuda, fale com nosso suporte.',
};

// Erros terminais — não adianta tentar de novo. Oculta o botão "Tentar novamente"
// e direciona o cliente ao suporte em vez de gerar frustração com retentativas.
const NON_RETRYABLE_CODES = new Set([
  'CLIENT_ALREADY_HAS_SUBSCRIPTION',
]);

function fallbackMessageForStage(stage: CheckoutStage): string {
  switch (stage) {
    case 5:
      return 'Não foi possível conectar ao provedor de pagamento. Tente novamente.';
    case 6:
      return 'Não foi possível concluir a assinatura. Tente novamente.';
    case 7:
      return 'Não foi possível finalizar sua contratação. Tente novamente.';
    default:
      return 'Ocorreu um erro inesperado. Tente novamente.';
  }
}

async function readApiError(res: Response): Promise<{ code: string; message?: string }> {
  let body: ApiErrorBody = {};
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    /* ignore */
  }
  const code = extractErrorCode(body);
  const message = typeof body.message === 'string' ? body.message : undefined;
  return { code, message };
}

function buildCheckoutError(
  stage: CheckoutStage,
  code: string,
  createdSubscriptionId: string | undefined,
  pagarmeCustomerId: string | undefined,
  requestId?: string,
): CheckoutError {
  const message =
    BACKEND_ERROR_MESSAGES[code] ?? fallbackMessageForStage(stage);
  return new CheckoutError({
    stage,
    code,
    message,
    createdSubscriptionId,
    pagarmeCustomerId,
    requestId,
    retryable: !NON_RETRYABLE_CODES.has(code),
  });
}

// ---------------------------------------------------------------------------
// HTTP helpers — POST /v1/checkout/customer & subscription
// ---------------------------------------------------------------------------

interface CheckoutCustomerResponse {
  pagarme_customer_id: string;
  created?: boolean;
  /** Presente quando enviamos `card_token` (multi-pet flow). */
  pagarme_card_id?: string;
}

interface CheckoutSubscriptionResponse {
  pagarme_subscription_id: string;
  items: Array<{ pet_id: string; pagarme_subscription_item_id?: string }>;
}

async function postJson<T>(
  path: string,
  body: unknown,
  opts: { idempotent?: boolean; idempotencyKey?: string } = {},
  requestId?: string,
): Promise<{ ok: true; data: T } | { ok: false; res: Response }> {
  let res: Response;
  try {
    res = await httpFetch(getApiUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      idempotent: opts.idempotent,
      idempotencyKey: opts.idempotencyKey,
      // execute() is the sole reporter for these endpoints; suppress the
      // automatic http_5xx / network report from httpFetch so we never emit
      // two events for the same error (one generic + one with stage context).
      reportClientErrorOn5xx: false,
    });
  } catch {
    // Network error — synthesize a typed CheckoutError with correlation ID
    throw new CheckoutError({
      stage: 5,
      code: 'NETWORK_ERROR',
      message: 'Erro de conexão. Verifique sua internet e tente novamente.',
      requestId,
    });
  }
  if (!res.ok) {
    return { ok: false, res };
  }
  const data = (await res.json()) as T;
  return { ok: true, data };
}

// ---------------------------------------------------------------------------
// FinalizeCheckoutUseCase
// ---------------------------------------------------------------------------

export class FinalizeCheckoutUseCase {
  constructor(
    private readonly clientUseCase: RegisterClientUseCase = new RegisterClientUseCase(),
    private readonly petUseCase: RegisterPetUseCase = new RegisterPetUseCase(),
    private readonly contractUseCase: RegisterContractUseCase = new RegisterContractUseCase(),
  ) {}

  async execute(
    input: FinalizeCheckoutInput,
    onStageChange: OnStageChange = () => {},
  ): Promise<FinalizeCheckoutResult> {
    // -----------------------------------------------------------------------
    // Observability bootstrap — new UUID per "Concluir" click.
    // The same requestId propagates to all httpFetch calls via X-Request-Id.
    // -----------------------------------------------------------------------
    resetAttemptId();
    const requestId = getOrCreateAttemptId();
    const idempotencyKey = createIdempotencyKey();

    const resume = input.resume ?? {};
    let createdSubscriptionId: string | undefined = resume.pagarmeSubscriptionId;
    let pagarmeCustomerId: string | undefined = resume.pagarmeCustomerId;
    let pagarmeCardId: string | undefined = resume.pagarmeCardId;

    // -----------------------------------------------------------------------
    // Stage 1 — local card validation
    // -----------------------------------------------------------------------
    onStageChange({ stage: 1 });
    try {
      validateCardInput(input.cardInput);
    } catch (err) {
      const baseErr = err instanceof CheckoutError
        ? err
        : new CheckoutError({
            stage: 1,
            code: 'INVALID_CARD_DATA',
            message: 'Dados do cartão inválidos.',
          });
      const stackHash = await hashStack(err instanceof Error ? (err.stack ?? '') : '');
      reportClientError({
        requestId,
        stage: 'stage_1',
        message: (err instanceof Error ? err.message : String(err)).slice(0, 200),
        stackHash,
      }).catch(() => {});
      throw new CheckoutError({
        stage: baseErr.stage,
        code: baseErr.code,
        message: baseErr.message,
        createdSubscriptionId: baseErr.createdSubscriptionId,
        pagarmeCustomerId: baseErr.pagarmeCustomerId,
        requestId,
      });
    }

    // -----------------------------------------------------------------------
    // Stage 2 — tokenize card (external Pagar.me API — NOT wrapped in httpFetch)
    // -----------------------------------------------------------------------
    onStageChange({ stage: 2 });
    let cardToken: string;
    try {
      const addr = input.clientInput.address;
      const result = await tokenizeCard({
        number: input.cardInput.number,
        holderName: input.cardInput.holderName,
        expMonth: input.cardInput.expiry.slice(0, 2),
        expYear: input.cardInput.expiry.slice(2, 4),
        cvv: input.cardInput.cvv,
        billingAddress: {
          zipCode: addr.cep,
          city: addr.city,
          state: addr.state,
          street: addr.street,
          number: addr.number,
          complement: addr.complement,
          neighborhood: addr.neighborhood,
          country: 'BR',
        },
      });
      cardToken = result.cardToken;
    } catch (err) {
      const code =
        err instanceof ValidationError
          ? (err.fieldErrors._code ?? 'INVALID_CARD_DATA')
          : 'INVALID_CARD_DATA';
      const message =
        err instanceof ValidationError
          ? (err.fieldErrors._form ?? BACKEND_ERROR_MESSAGES.INVALID_CARD_DATA)
          : BACKEND_ERROR_MESSAGES.INVALID_CARD_DATA;
      const stackHash = await hashStack(err instanceof Error ? (err.stack ?? '') : '');
      reportClientError({
        requestId,
        stage: 'stage_2',
        message: message.slice(0, 200),
        stackHash,
      }).catch(() => {});
      throw new CheckoutError({ stage: 2, code, message, requestId });
    }

    // -----------------------------------------------------------------------
    // Stage 3 — register client (LateMia)
    // -----------------------------------------------------------------------
    let clientId = resume.clientId;
    if (!clientId) {
      onStageChange({ stage: 3 });
      try {
        const registered = await this.clientUseCase.execute(
          input.clientInput,
          input.touchpoints
            ? { touchpoints: input.touchpoints }
            : undefined,
        );
        clientId = registered.id;
      } catch (err) {
        const checkoutErr = mapDomainError(err, 3, undefined, undefined, requestId);
        const stackHash = await hashStack(err instanceof Error ? (err.stack ?? '') : '');
        reportClientError({
          requestId,
          stage: 'stage_3',
          message: checkoutErr.message.slice(0, 200),
          stackHash,
        }).catch(() => {});
        throw checkoutErr;
      }
    }

    // -----------------------------------------------------------------------
    // Stage 4 — register pets (LateMia, sequential)
    // -----------------------------------------------------------------------
    const petIds: string[] = [...(resume.petIds ?? [])];
    if (petIds.length < input.pets.length) {
      onStageChange({ stage: 4 });
      for (let i = petIds.length; i < input.pets.length; i++) {
        try {
          const created = await this.petUseCase.execute(
            clientId,
            input.pets[i].data,
          );
          petIds.push(created.id);
        } catch (err) {
          const checkoutErr = mapDomainError(err, 4, i, undefined, requestId);
          const stackHash = await hashStack(err instanceof Error ? (err.stack ?? '') : '');
          reportClientError({
            requestId,
            stage: 'stage_4',
            message: checkoutErr.message.slice(0, 200),
            stackHash,
          }).catch(() => {});
          throw checkoutErr;
        }
      }
    }

    // -----------------------------------------------------------------------
    // Stage 5 — ensure Pagar.me customer (sem vincular card_token ao customer;
    // o token é passado diretamente na stage 6 para a subscription).
    // -----------------------------------------------------------------------
    if (!pagarmeCustomerId) {
      onStageChange({ stage: 5 });
      const result = await postJson<CheckoutCustomerResponse>(
        '/v1/checkout/customer',
        { client_id: clientId },
        { idempotent: true, idempotencyKey },
        requestId,
      );
      if (!result.ok) {
        const { code } = await readApiError(result.res);
        const checkoutErr = buildCheckoutError(5, code, undefined, undefined, requestId);
        const stackHash = await hashStack('');
        reportClientError({
          requestId,
          stage: 'stage_5',
          message: checkoutErr.message.slice(0, 200),
          stackHash,
        }).catch(() => {});
        throw checkoutErr;
      }
      pagarmeCustomerId = result.data.pagarme_customer_id;
    }

    // -----------------------------------------------------------------------
    // Stage 6 — create consolidated Pagar.me subscription with all pets.
    // Passa card_token diretamente; a Pagar.me usa o token para autorizar a
    // primeira cobrança e armazena o cartão internamente na subscription.
    // -----------------------------------------------------------------------
    let subscriptionItems: CheckoutSubscriptionResponse['items'] = [];
    if (!createdSubscriptionId) {
      onStageChange({ stage: 6 });
      const result = await postJson<CheckoutSubscriptionResponse>(
        '/v1/checkout/subscription',
        {
          client_id: clientId,
          pet_ids: petIds,
          card_token: cardToken,
        },
        { idempotent: true, idempotencyKey },
        requestId,
      );
      if (!result.ok) {
        const { code } = await readApiError(result.res);
        const checkoutErr = buildCheckoutError(6, code, undefined, pagarmeCustomerId, requestId);
        const stackHash = await hashStack('');
        reportClientError({
          requestId,
          stage: 'stage_6',
          // Prefixar com código permite ao suporte identificar o problema via log
          // sem precisar do requestId do cliente. Ex: "[CLIENT_ALREADY_HAS_SUBSCRIPTION] Você já..."
          message: `[${code}] ${checkoutErr.message}`.slice(0, 200),
          stackHash,
        }).catch(() => {});
        throw checkoutErr;
      }
      createdSubscriptionId = result.data.pagarme_subscription_id;
      subscriptionItems = result.data.items;
    }

    // -----------------------------------------------------------------------
    // Stage 7 — finalize contract
    // -----------------------------------------------------------------------
    onStageChange({ stage: 7 });
    let contractId: string;
    let planIds: string[];
    try {
      const contractResult = await this.contractUseCase.execute({
        clientId,
        petIds,
        contractVersion: input.contractVersion,
        consentedAt: input.contractAcceptedAt,
        subscription: createdSubscriptionId
          ? {
              pagarme_subscription_id: createdSubscriptionId,
              items: subscriptionItems,
            }
          : undefined,
        idempotencyKey,
      });
      contractId = contractResult.contract_id;
      planIds = contractResult.plan_ids;
    } catch (err) {
      // Falha pós-stage 6 com subscription criada — rollback consolidado fire-and-forget
      if (createdSubscriptionId) {
        fireAndForgetRollback(createdSubscriptionId, requestId);
      }
      const checkoutErr = mapDomainError(err, 7, undefined, {
        createdSubscriptionId,
        pagarmeCustomerId,
      }, requestId);
      const stackHash = await hashStack(err instanceof Error ? (err.stack ?? '') : '');
      reportClientError({
        requestId,
        stage: 'stage_7',
        message: checkoutErr.message.slice(0, 200),
        stackHash,
      }).catch(() => {});
      throw checkoutErr;
    }

    // -----------------------------------------------------------------------
    // Stage 8 — success
    // -----------------------------------------------------------------------
    onStageChange({ stage: 8 });

    return {
      contractId,
      planIds,
      clientId,
      petIds,
      pagarmeCustomerId,
      pagarmeCardId: pagarmeCardId ?? '',
      pagarmeSubscriptionId: createdSubscriptionId ?? '',
    };
  }
}

// ---------------------------------------------------------------------------
// Helpers — domain error → CheckoutError (stages 3, 4, 7)
// ---------------------------------------------------------------------------

function mapDomainError(
  err: unknown,
  stage: CheckoutStage,
  petIndex?: number,
  carry?: {
    createdSubscriptionId?: string;
    pagarmeCustomerId?: string;
  },
  requestId?: string,
): CheckoutError {
  if (err instanceof CheckoutError) {
    // Preserve existing CheckoutError but inject requestId if not already set
    if (err.requestId) return err;
    return new CheckoutError({
      stage: err.stage,
      code: err.code,
      message: err.message,
      createdSubscriptionId: err.createdSubscriptionId,
      pagarmeCustomerId: err.pagarmeCustomerId,
      requestId,
    });
  }
  if (err instanceof ValidationError) {
    const message =
      err.fieldErrors._form ?? fallbackMessageForStage(stage);
    const code = err.fieldErrors._code ?? 'VALIDATION_ERROR';
    return new CheckoutError({
      stage,
      code,
      message,
      createdSubscriptionId: carry?.createdSubscriptionId,
      pagarmeCustomerId: carry?.pagarmeCustomerId,
      requestId,
    });
  }
  return new CheckoutError({
    stage,
    code: 'UNKNOWN_ERROR',
    message: fallbackMessageForStage(stage),
    createdSubscriptionId: carry?.createdSubscriptionId,
    pagarmeCustomerId: carry?.pagarmeCustomerId,
    requestId,
  });
}

// ---------------------------------------------------------------------------
// Rollback (fire-and-forget)
// ---------------------------------------------------------------------------

function fireAndForgetRollback(pagarmeSubscriptionId: string, requestId?: string): void {
  // Não aguardamos o resultado e não logamos detalhes — o backend é
  // responsável pela orquestração best-effort + outbox.
  // reportClientErrorOn5xx: false para não criar loop de relatórios.
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (requestId) {
      headers['X-Request-Id'] = requestId;
    }
    void httpFetch(getApiUrl('/v1/checkout/rollback'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ pagarme_subscription_id: pagarmeSubscriptionId }),
      keepalive: true,
      reportClientErrorOn5xx: false,
    }).catch(() => {
      /* swallow */
    });
  } catch {
    /* swallow */
  }
}
