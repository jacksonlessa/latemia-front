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
import { RegisterClientUseCase } from '@/domain/client/register-client.use-case';
import { RegisterPetUseCase } from '@/domain/pet/register-pet.use-case';
import { RegisterContractUseCase } from '@/domain/contract/register-contract.use-case';
import type { RegisterClientInput } from '@/lib/types/client';
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
   * IDs já criados em uma tentativa anterior — usado para retomar de onde
   * parou e para o painel pré-marcar etapas concluídas (RF10).
   */
  resume?: {
    clientId?: string;
    petIds?: string[];
    pagarmeCustomerId?: string;
    pagarmeSubscriptionIds?: string[];
  };
}

export interface FinalizeCheckoutResult {
  contractId: string;
  planIds: string[];
  clientId: string;
  petIds: string[];
  pagarmeCustomerId: string;
  pagarmeSubscriptionIds: string[];
}

export interface OnStageChangePayload {
  stage: CheckoutStage;
  /** Quando definido, indica o pet em foco (estágio 6 sub-step). */
  petIndex?: number;
  petName?: string;
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
  readonly petIndex?: number;
  /** Subscriptions Pagar.me já criadas no momento da falha. */
  readonly createdSubscriptionIds: string[];
  /** pagarmeCustomerId já obtido (se houver). */
  readonly pagarmeCustomerId?: string;

  constructor(params: {
    stage: CheckoutStage;
    code: string;
    message: string;
    petIndex?: number;
    createdSubscriptionIds?: string[];
    pagarmeCustomerId?: string;
  }) {
    super(params.message);
    this.name = 'CheckoutError';
    this.stage = params.stage;
    this.code = params.code;
    this.petIndex = params.petIndex;
    this.createdSubscriptionIds = params.createdSubscriptionIds ?? [];
    this.pagarmeCustomerId = params.pagarmeCustomerId;
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
};

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
  petIndex: number | undefined,
  createdSubscriptionIds: string[],
  pagarmeCustomerId: string | undefined,
): CheckoutError {
  const message =
    BACKEND_ERROR_MESSAGES[code] ?? fallbackMessageForStage(stage);
  return new CheckoutError({
    stage,
    code,
    message,
    petIndex,
    createdSubscriptionIds,
    pagarmeCustomerId,
  });
}

// ---------------------------------------------------------------------------
// HTTP helpers — POST /v1/checkout/customer & subscription
// ---------------------------------------------------------------------------

interface CheckoutCustomerResponse {
  pagarme_customer_id: string;
  created?: boolean;
}

interface CheckoutSubscriptionResponse {
  pagarme_subscription_id: string;
}

async function postJson<T>(path: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; res: Response }> {
  let res: Response;
  try {
    res = await fetch(getApiUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // Network error — synthesize a Response-like rejection
    throw new CheckoutError({
      stage: 5,
      code: 'NETWORK_ERROR',
      message: 'Erro de conexão. Verifique sua internet e tente novamente.',
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
    const resume = input.resume ?? {};
    const createdSubscriptionIds: string[] = [
      ...(resume.pagarmeSubscriptionIds ?? []),
    ];
    let pagarmeCustomerId: string | undefined = resume.pagarmeCustomerId;

    // -----------------------------------------------------------------------
    // Stage 1 — local card validation
    // -----------------------------------------------------------------------
    onStageChange({ stage: 1 });
    try {
      validateCardInput(input.cardInput);
    } catch (err) {
      throw err instanceof CheckoutError
        ? err
        : new CheckoutError({
            stage: 1,
            code: 'INVALID_CARD_DATA',
            message: 'Dados do cartão inválidos.',
          });
    }

    // -----------------------------------------------------------------------
    // Stage 2 — tokenize card
    // -----------------------------------------------------------------------
    onStageChange({ stage: 2 });
    let cardToken: string;
    try {
      const result = await tokenizeCard({
        number: input.cardInput.number,
        holderName: input.cardInput.holderName,
        expMonth: input.cardInput.expiry.slice(0, 2),
        expYear: input.cardInput.expiry.slice(2, 4),
        cvv: input.cardInput.cvv,
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
      throw new CheckoutError({
        stage: 2,
        code,
        message,
      });
    }

    // -----------------------------------------------------------------------
    // Stage 3 — register client (LateMia)
    // -----------------------------------------------------------------------
    let clientId = resume.clientId;
    if (!clientId) {
      onStageChange({ stage: 3 });
      try {
        const registered = await this.clientUseCase.execute(input.clientInput);
        clientId = registered.id;
      } catch (err) {
        throw mapDomainError(err, 3);
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
          throw mapDomainError(err, 4, i);
        }
      }
    }

    // -----------------------------------------------------------------------
    // Stage 5 — ensure Pagar.me customer
    // -----------------------------------------------------------------------
    if (!pagarmeCustomerId) {
      onStageChange({ stage: 5 });
      const result = await postJson<CheckoutCustomerResponse>(
        '/v1/checkout/customer',
        { client_id: clientId },
      );
      if (!result.ok) {
        const { code } = await readApiError(result.res);
        throw buildCheckoutError(5, code, undefined, [], undefined);
      }
      pagarmeCustomerId = result.data.pagarme_customer_id;
    }

    // -----------------------------------------------------------------------
    // Stage 6 — create one Pagar.me subscription per pet (sequential)
    // -----------------------------------------------------------------------
    onStageChange({
      stage: 6,
      petIndex: createdSubscriptionIds.length,
      petName: input.pets[createdSubscriptionIds.length]?.name,
    });
    for (let i = createdSubscriptionIds.length; i < input.pets.length; i++) {
      onStageChange({
        stage: 6,
        petIndex: i,
        petName: input.pets[i].name,
      });
      const result = await postJson<CheckoutSubscriptionResponse>(
        '/v1/checkout/subscription',
        {
          client_id: clientId,
          pet_id: petIds[i],
          card_token: cardToken,
        },
      );
      if (!result.ok) {
        const { code } = await readApiError(result.res);
        const err = buildCheckoutError(
          6,
          code,
          i,
          createdSubscriptionIds,
          pagarmeCustomerId,
        );
        // Rollback fire-and-forget: erro pós-stage 5 e já temos subscriptions criadas
        if (createdSubscriptionIds.length > 0) {
          fireAndForgetRollback(createdSubscriptionIds);
        }
        throw err;
      }
      createdSubscriptionIds.push(result.data.pagarme_subscription_id);
    }

    // -----------------------------------------------------------------------
    // Stage 7 — finalize contract
    // -----------------------------------------------------------------------
    onStageChange({ stage: 7 });
    let contractId: string;
    let planIds: string[];
    try {
      const subscriptions = input.pets.map((_, i) => ({
        pet_id: petIds[i],
        pagarme_subscription_id: createdSubscriptionIds[i],
      }));
      const contractResult = await this.contractUseCase.execute({
        clientId,
        petIds,
        contractVersion: input.contractVersion,
        consentedAt: input.contractAcceptedAt,
        subscriptions,
      });
      contractId = contractResult.contract_id;
      planIds = contractResult.plan_ids;
    } catch (err) {
      // Falha pós-stage 5 com subscriptions criadas — rollback fire-and-forget
      if (createdSubscriptionIds.length > 0) {
        fireAndForgetRollback(createdSubscriptionIds);
      }
      throw mapDomainError(err, 7, undefined, {
        createdSubscriptionIds,
        pagarmeCustomerId,
      });
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
      pagarmeSubscriptionIds: createdSubscriptionIds,
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
    createdSubscriptionIds?: string[];
    pagarmeCustomerId?: string;
  },
): CheckoutError {
  if (err instanceof CheckoutError) return err;
  if (err instanceof ValidationError) {
    const message =
      err.fieldErrors._form ?? fallbackMessageForStage(stage);
    const code = err.fieldErrors._code ?? 'VALIDATION_ERROR';
    return new CheckoutError({
      stage,
      code,
      message,
      petIndex,
      createdSubscriptionIds: carry?.createdSubscriptionIds ?? [],
      pagarmeCustomerId: carry?.pagarmeCustomerId,
    });
  }
  return new CheckoutError({
    stage,
    code: 'UNKNOWN_ERROR',
    message: fallbackMessageForStage(stage),
    petIndex,
    createdSubscriptionIds: carry?.createdSubscriptionIds ?? [],
    pagarmeCustomerId: carry?.pagarmeCustomerId,
  });
}

// ---------------------------------------------------------------------------
// Rollback (fire-and-forget)
// ---------------------------------------------------------------------------

function fireAndForgetRollback(pagarmeSubscriptionIds: string[]): void {
  // Não aguardamos o resultado e não logamos detalhes — o backend é
  // responsável pela orquestração best-effort + outbox.
  try {
    void fetch(getApiUrl('/v1/checkout/rollback'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pagarme_subscription_ids: pagarmeSubscriptionIds }),
      keepalive: true,
    }).catch(() => {
      /* swallow */
    });
  } catch {
    /* swallow */
  }
}
