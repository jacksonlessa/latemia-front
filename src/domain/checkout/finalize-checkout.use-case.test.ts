/**
 * Unit tests for FinalizeCheckoutUseCase.
 *
 * Mocks fetch (used by tokenizeCard, /checkout/customer, /checkout/subscription,
 * and rollback) plus the RegisterClient/Pet/Contract use cases via constructor
 * injection — keeps tests isolated from real domain entities.
 *
 * No personal data appears in assertions or logs.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  FinalizeCheckoutUseCase,
  CheckoutError,
  type FinalizeCheckoutInput,
  type OnStageChangePayload,
} from './finalize-checkout.use-case';
import type { CardFormValue } from '@/components/public/contratar/organisms/card-form';
import type { RegisterClientInput } from '@/lib/types/client';
import type { RegisterPetInput } from '@/lib/types/pet';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const VALID_CARD: CardFormValue = {
  number: '4000000000000010',
  holderName: 'Maria da Silva',
  expiry: '1230',
  cvv: '123',
};

const VALID_CLIENT: RegisterClientInput = {
  name: 'Maria da Silva',
  cpf: '529.982.247-25',
  email: 'maria@example.com',
  phone: '(11) 98765-4321',
  address: {
    cep: '01310-100',
    street: 'Avenida Paulista',
    number: '1000',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
  },
};

function buildPet(name = 'Rex'): RegisterPetInput {
  const birth = new Date();
  birth.setFullYear(birth.getFullYear() - 3);
  return {
    name,
    species: 'canino',
    breed: 'Labrador',
    birthDate: birth,
    sex: 'male',
    weight: 28.5,
    castrated: true,
  };
}

function buildInput(petCount = 1, overrides: Partial<FinalizeCheckoutInput> = {}): FinalizeCheckoutInput {
  return {
    clientInput: VALID_CLIENT,
    pets: Array.from({ length: petCount }, (_, i) => ({
      name: `Pet${i + 1}`,
      data: buildPet(`Pet${i + 1}`),
    })),
    cardInput: VALID_CARD,
    contractAcceptedAt: '2026-04-18T12:00:00.000Z',
    contractVersion: 'v1',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Stub use cases (constructor-injected)
// ---------------------------------------------------------------------------

interface ClientLike {
  execute: (...a: unknown[]) => Promise<{ id: string }>;
}
interface PetLike {
  execute: (...a: unknown[]) => Promise<{ id: string }>;
}
interface ContractLike {
  execute: (...a: unknown[]) => Promise<{ contract_id: string; plan_ids: string[] }>;
}

function makeUseCase(opts: {
  client?: ClientLike;
  pet?: PetLike;
  contract?: ContractLike;
} = {}): FinalizeCheckoutUseCase {
  const client: ClientLike = opts.client ?? {
    execute: vi.fn().mockResolvedValue({ id: 'client-uuid-1' }),
  };
  let petCounter = 0;
  const pet: PetLike = opts.pet ?? {
    execute: vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ id: `pet-uuid-${++petCounter}` }),
      ),
  };
  const contract: ContractLike = opts.contract ?? {
    execute: vi.fn().mockResolvedValue({
      contract_id: 'contract-uuid-1',
      plan_ids: ['plan-uuid-1', 'plan-uuid-2'],
    }),
  };
  return new FinalizeCheckoutUseCase(
    client as unknown as ConstructorParameters<typeof FinalizeCheckoutUseCase>[0],
    pet as unknown as ConstructorParameters<typeof FinalizeCheckoutUseCase>[1],
    contract as unknown as ConstructorParameters<typeof FinalizeCheckoutUseCase>[2],
  );
}

// ---------------------------------------------------------------------------
// fetch helpers — tokenize-card + /checkout/customer + /checkout/subscription
// ---------------------------------------------------------------------------

interface FetchCall {
  url: string;
  body: unknown;
}

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

function setupFetchMock(
  routes: Record<string, (call: FetchCall) => Response | Promise<Response>>,
): { calls: FetchCall[]; fetchMock: ReturnType<typeof vi.fn> } {
  const calls: FetchCall[] = [];
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    let body: unknown = undefined;
    if (init?.body) {
      try {
        body = JSON.parse(init.body as string);
      } catch {
        body = init.body;
      }
    }
    const call: FetchCall = { url: String(url), body };
    calls.push(call);
    for (const [pattern, handler] of Object.entries(routes)) {
      if (call.url.includes(pattern)) {
        return handler(call);
      }
    }
    return jsonResponse({}, 404);
  });
  vi.stubGlobal('fetch', fetchMock);
  return { calls, fetchMock };
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY = 'pk_test_xxx';
  delete process.env.NEXT_PUBLIC_API_URL;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Happy paths
// ---------------------------------------------------------------------------

describe('FinalizeCheckoutUseCase — happy paths', () => {
  it('should orchestrate all 8 stages for a single pet', async () => {
    const { calls } = setupFetchMock({
      'api.pagar.me/core/v5/tokens': () =>
        jsonResponse({ id: 'token_abc', card: { brand: 'visa', last_four_digits: '0010' } }),
      '/v1/checkout/customer': () =>
        jsonResponse({ pagarme_customer_id: 'cus_1', created: true, pagarme_card_id: 'card_1' }, 201),
      '/v1/checkout/subscription': () =>
        jsonResponse({
          pagarme_subscription_id: 'sub_1',
          items: [{ pet_id: 'pet-uuid-1', pagarme_subscription_item_id: 'si_1' }],
        }, 201),
    });

    const stages: OnStageChangePayload[] = [];
    const useCase = makeUseCase();
    const result = await useCase.execute(buildInput(1), (p) => stages.push(p));

    expect(result.contractId).toBe('contract-uuid-1');
    expect(result.planIds).toEqual(['plan-uuid-1', 'plan-uuid-2']);
    expect(result.pagarmeSubscriptionId).toBe('sub_1');
    expect(result.pagarmeCustomerId).toBe('cus_1');

    const seenStages = stages.map((s) => s.stage);
    // Must include all canonical stages 1..8 in order
    expect(seenStages[0]).toBe(1);
    expect(seenStages).toContain(2);
    expect(seenStages).toContain(3);
    expect(seenStages).toContain(4);
    expect(seenStages).toContain(5);
    expect(seenStages).toContain(6);
    expect(seenStages).toContain(7);
    expect(seenStages.at(-1)).toBe(8);

    // tokens chamado, customer chamado, subscription 1x (não N), contract 1x
    expect(calls.filter((c) => c.url.includes('/tokens')).length).toBe(1);
    expect(calls.filter((c) => c.url.includes('/checkout/customer')).length).toBe(1);
    expect(calls.filter((c) => c.url.includes('/checkout/subscription')).length).toBe(1);
  });

  it('should call /checkout/subscription once with petIds array for 3 pets', async () => {
    const { calls } = setupFetchMock({
      'api.pagar.me/core/v5/tokens': () => jsonResponse({ id: 'token_abc' }),
      '/v1/checkout/customer': () =>
        jsonResponse({ pagarme_customer_id: 'cus_1', created: true, pagarme_card_id: 'card_1' }, 201),
      '/v1/checkout/subscription': () =>
        jsonResponse({
          pagarme_subscription_id: 'sub_1',
          items: [
            { pet_id: 'pet-uuid-1', pagarme_subscription_item_id: 'si_1' },
            { pet_id: 'pet-uuid-2', pagarme_subscription_item_id: 'si_2' },
            { pet_id: 'pet-uuid-3', pagarme_subscription_item_id: 'si_3' },
          ],
        }, 201),
    });

    const stages: OnStageChangePayload[] = [];
    const useCase = makeUseCase();
    const result = await useCase.execute(buildInput(3), (p) => stages.push(p));

    // Exactly 1 call to /checkout/subscription (not 3)
    const subscriptionCalls = calls.filter((c) => c.url.includes('/checkout/subscription'));
    expect(subscriptionCalls.length).toBe(1);

    // Body must contain pet_ids array with 3 ids
    const body = subscriptionCalls[0].body as { pet_ids: string[] };
    expect(body.pet_ids).toHaveLength(3);

    // Result has single subscription id
    expect(result.pagarmeSubscriptionId).toBe('sub_1');

    // Stage 6 emitted exactly once (no per-pet sub-stages)
    const stage6Events = stages.filter((s) => s.stage === 6);
    expect(stage6Events.length).toBe(1);
  });

  it('should pass consolidated subscription to register-contract', async () => {
    setupFetchMock({
      'api.pagar.me/core/v5/tokens': () => jsonResponse({ id: 'token_abc' }),
      '/v1/checkout/customer': () =>
        jsonResponse({ pagarme_customer_id: 'cus_1', pagarme_card_id: 'card_1' }, 201),
      '/v1/checkout/subscription': () =>
        jsonResponse({
          pagarme_subscription_id: 'sub_1',
          items: [
            { pet_id: 'pet-uuid-1', pagarme_subscription_item_id: 'si_1' },
            { pet_id: 'pet-uuid-2', pagarme_subscription_item_id: 'si_2' },
          ],
        }, 201),
    });

    const contractMock = {
      execute: vi.fn().mockResolvedValue({ contract_id: 'c1', plan_ids: ['p1', 'p2'] }),
    };
    const useCase = makeUseCase({ contract: contractMock });
    await useCase.execute(buildInput(2));

    expect(contractMock.execute).toHaveBeenCalledTimes(1);
    const callArg = contractMock.execute.mock.calls[0][0] as {
      subscription?: { pagarme_subscription_id: string; items: unknown[] };
    };
    expect(callArg.subscription?.pagarme_subscription_id).toBe('sub_1');
    expect(callArg.subscription?.items).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Errors per stage
// ---------------------------------------------------------------------------

describe('FinalizeCheckoutUseCase — errors per stage', () => {
  it('should throw CheckoutError(stage=1) on invalid card data', async () => {
    setupFetchMock({});
    const useCase = makeUseCase();
    await expect(
      useCase.execute({
        ...buildInput(1),
        cardInput: { ...VALID_CARD, number: '123' },
      }),
    ).rejects.toMatchObject({ name: 'CheckoutError', stage: 1 });
  });

  it('should throw CheckoutError(stage=2) when tokenize-card fails', async () => {
    setupFetchMock({
      'api.pagar.me/core/v5/tokens': () =>
        jsonResponse({ message: 'invalid card' }, 422),
    });
    const useCase = makeUseCase();
    await expect(useCase.execute(buildInput(1))).rejects.toMatchObject({
      name: 'CheckoutError',
      stage: 2,
    });
  });

  it('should throw CheckoutError(stage=3) when register-client fails', async () => {
    setupFetchMock({
      'api.pagar.me/core/v5/tokens': () => jsonResponse({ id: 'token_abc' }),
    });
    const useCase = makeUseCase({
      client: {
        execute: vi.fn().mockRejectedValue(new Error('boom')),
      },
    });
    await expect(useCase.execute(buildInput(1))).rejects.toMatchObject({
      name: 'CheckoutError',
      stage: 3,
    });
  });

  it('should throw CheckoutError(stage=4) when register-pet fails', async () => {
    setupFetchMock({
      'api.pagar.me/core/v5/tokens': () => jsonResponse({ id: 'token_abc' }),
    });
    const useCase = makeUseCase({
      pet: {
        execute: vi.fn().mockRejectedValue(new Error('boom')),
      },
    });
    await expect(useCase.execute(buildInput(1))).rejects.toMatchObject({
      name: 'CheckoutError',
      stage: 4,
    });
  });

  it('should throw CheckoutError(stage=5) when /checkout/customer fails', async () => {
    setupFetchMock({
      'api.pagar.me/core/v5/tokens': () => jsonResponse({ id: 'token_abc' }),
      '/v1/checkout/customer': () =>
        jsonResponse({ code: 'PROVIDER_UPSTREAM' }, 503),
    });
    const useCase = makeUseCase();
    await expect(useCase.execute(buildInput(1))).rejects.toMatchObject({
      name: 'CheckoutError',
      stage: 5,
      code: 'PROVIDER_UPSTREAM',
    });
  });

  it('should throw CheckoutError(stage=6) when /checkout/subscription fails', async () => {
    setupFetchMock({
      'api.pagar.me/core/v5/tokens': () => jsonResponse({ id: 'token_abc' }),
      '/v1/checkout/customer': () =>
        jsonResponse({ pagarme_customer_id: 'cus_1', pagarme_card_id: 'card_1' }, 201),
      '/v1/checkout/subscription': () =>
        jsonResponse({ code: 'CARD_DECLINED' }, 422),
    });
    const useCase = makeUseCase();
    await expect(useCase.execute(buildInput(1))).rejects.toMatchObject({
      name: 'CheckoutError',
      stage: 6,
      code: 'CARD_DECLINED',
    });
  });

  it('should throw CheckoutError(stage=7) when register-contract fails', async () => {
    setupFetchMock({
      'api.pagar.me/core/v5/tokens': () => jsonResponse({ id: 'token_abc' }),
      '/v1/checkout/customer': () =>
        jsonResponse({ pagarme_customer_id: 'cus_1', pagarme_card_id: 'card_1' }, 201),
      '/v1/checkout/subscription': () =>
        jsonResponse({
          pagarme_subscription_id: 'sub_1',
          items: [{ pet_id: 'pet-uuid-1', pagarme_subscription_item_id: 'si_1' }],
        }, 201),
    });
    const useCase = makeUseCase({
      contract: {
        execute: vi.fn().mockRejectedValue(new Error('boom')),
      },
    });
    await expect(useCase.execute(buildInput(1))).rejects.toMatchObject({
      name: 'CheckoutError',
      stage: 7,
    });
  });
});

// ---------------------------------------------------------------------------
// Rollback fire-and-forget (post-stage 6) — consolidated subscription
// ---------------------------------------------------------------------------

describe('FinalizeCheckoutUseCase — rollback', () => {
  it('should fire-and-forget POST /v1/checkout/rollback with single pagarme_subscription_id when stage 7 fails', async () => {
    const { calls } = setupFetchMock({
      'api.pagar.me/core/v5/tokens': () => jsonResponse({ id: 'token_abc' }),
      '/v1/checkout/customer': () =>
        jsonResponse({ pagarme_customer_id: 'cus_1', pagarme_card_id: 'card_1' }, 201),
      '/v1/checkout/subscription': () =>
        jsonResponse({
          pagarme_subscription_id: 'sub_1',
          items: [{ pet_id: 'pet-uuid-1', pagarme_subscription_item_id: 'si_1' }],
        }, 201),
      '/v1/checkout/rollback': () => jsonResponse({}, 200),
    });

    const useCase = makeUseCase({
      contract: {
        execute: vi.fn().mockRejectedValue(new Error('boom')),
      },
    });
    const error = await useCase.execute(buildInput(1)).catch((e) => e);
    expect(error).toBeInstanceOf(CheckoutError);
    expect(error.stage).toBe(7);

    await Promise.resolve();
    await Promise.resolve();
    const rollbackCalls = calls.filter((c) => c.url.includes('/checkout/rollback'));
    expect(rollbackCalls.length).toBe(1);
    const body = rollbackCalls[0].body as { pagarme_subscription_id: string };
    expect(body.pagarme_subscription_id).toBe('sub_1');
  });

  it('should NOT fire rollback when failure occurs before stage 6 creates the subscription', async () => {
    const { calls } = setupFetchMock({
      'api.pagar.me/core/v5/tokens': () => jsonResponse({ id: 'token_abc' }),
      '/v1/checkout/customer': () =>
        jsonResponse({ code: 'PROVIDER_UPSTREAM' }, 503),
    });
    const useCase = makeUseCase();
    await useCase.execute(buildInput(1)).catch(() => undefined);
    await Promise.resolve();
    expect(calls.filter((c) => c.url.includes('/checkout/rollback')).length).toBe(0);
  });

  it('should NOT fire rollback when stage 6 itself fails (no subscription was created)', async () => {
    const { calls } = setupFetchMock({
      'api.pagar.me/core/v5/tokens': () => jsonResponse({ id: 'token_abc' }),
      '/v1/checkout/customer': () =>
        jsonResponse({ pagarme_customer_id: 'cus_1', pagarme_card_id: 'card_1' }, 201),
      '/v1/checkout/subscription': () =>
        jsonResponse({ code: 'CARD_DECLINED' }, 422),
    });
    const useCase = makeUseCase();
    await useCase.execute(buildInput(3)).catch(() => undefined);
    await Promise.resolve();
    await Promise.resolve();
    expect(calls.filter((c) => c.url.includes('/checkout/rollback')).length).toBe(0);
  });
});
