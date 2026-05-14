/**
 * Unit tests for RegisterContractUseCase.
 *
 * Mocks the global fetch to test the use-case in isolation.
 * No personal data is included in assertions or error messages.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  RegisterContractUseCase,
  type RegisterContractInput,
} from './register-contract.use-case';
import { ValidationError } from '@/lib/validation-error';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function validInput(
  overrides: Partial<RegisterContractInput> = {},
): RegisterContractInput {
  return {
    clientId: 'client-uuid-1',
    petIds: ['pet-uuid-1', 'pet-uuid-2'],
    contractVersion: 'v1',
    consentedAt: '2026-04-18T12:00:00.000Z',
    ...overrides,
  };
}

const successResponse = {
  contract_id: 'contract-uuid-1',
  plan_ids: ['plan-uuid-1', 'plan-uuid-2'],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFetchResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  delete process.env.NEXT_PUBLIC_API_URL;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------

describe('RegisterContractUseCase.execute — success', () => {
  it('should return contract_id and plan_ids when registration succeeds', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const useCase = new RegisterContractUseCase();
    const result = await useCase.execute(validInput());

    expect(result.contract_id).toBe('contract-uuid-1');
    expect(result.plan_ids).toEqual(['plan-uuid-1', 'plan-uuid-2']);
  });

  it('should call POST /v1/register/contract with the correct URL', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const useCase = new RegisterContractUseCase();
    await useCase.execute(validInput());

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('/v1/register/contract');
  });

  it('should send correct payload including consent_metadata', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const input = validInput();
    const useCase = new RegisterContractUseCase();
    await useCase.execute(input);

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);

    expect(body.client_id).toBe(input.clientId);
    expect(body.pet_ids).toEqual(input.petIds);
    expect(body.contract_version).toBe('v1');
    expect(body.consent_metadata.client_timestamp).toBe(input.consentedAt);
    expect(body.consent_metadata.accepted_at).toBe(input.consentedAt);
  });

  it('should return contract data when API responds with 200 (idempotency)', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 200));

    const useCase = new RegisterContractUseCase();
    const result = await useCase.execute(validInput());

    expect(result.contract_id).toBe('contract-uuid-1');
  });

  it('should send subscription object in payload when provided', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const useCase = new RegisterContractUseCase();
    await useCase.execute(
      validInput({
        subscription: {
          pagarme_subscription_id: 'sub_1',
          items: [
            { pet_id: 'pet-uuid-1', pagarme_subscription_item_id: 'si_1' },
            { pet_id: 'pet-uuid-2', pagarme_subscription_item_id: 'si_2' },
          ],
        },
      }),
    );

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.subscription.pagarme_subscription_id).toBe('sub_1');
    expect(body.subscription.items).toHaveLength(2);
    expect(body.subscription.items[0].pet_id).toBe('pet-uuid-1');
    expect(body.subscription.items[0].pagarme_subscription_item_id).toBe('si_1');
  });

  it('should omit subscription when not provided', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const useCase = new RegisterContractUseCase();
    await useCase.execute(validInput());

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.subscription).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Task 11.0 — OTP evidence fields propagation
// ---------------------------------------------------------------------------

describe('RegisterContractUseCase.execute — OTP evidence fields', () => {
  it('should include verification_token in body when verificationToken is provided', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const useCase = new RegisterContractUseCase();
    await useCase.execute(
      validInput({ verificationToken: 'opaque-token-1' }),
    );

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.verification_token).toBe('opaque-token-1');
  });

  it('should include contract_attempt_id in body when contractAttemptId is provided', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const useCase = new RegisterContractUseCase();
    await useCase.execute(
      validInput({ contractAttemptId: 'attempt-uuid-1' }),
    );

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.contract_attempt_id).toBe('attempt-uuid-1');
  });

  it('should include contract_text_hash in body when contractTextHash is provided', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const useCase = new RegisterContractUseCase();
    await useCase.execute(
      validInput({
        contractTextHash:
          'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
      }),
    );

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.contract_text_hash).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('should omit all three OTP fields when none are provided', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const useCase = new RegisterContractUseCase();
    await useCase.execute(validInput());

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.verification_token).toBeUndefined();
    expect(body.contract_attempt_id).toBeUndefined();
    expect(body.contract_text_hash).toBeUndefined();
  });

  it('should send all three OTP fields together when provided', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const useCase = new RegisterContractUseCase();
    await useCase.execute(
      validInput({
        verificationToken: 'opaque-token-1',
        contractAttemptId: 'attempt-uuid-1',
        contractTextHash: 'a'.repeat(64),
      }),
    );

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.verification_token).toBe('opaque-token-1');
    expect(body.contract_attempt_id).toBe('attempt-uuid-1');
    expect(body.contract_text_hash).toBe('a'.repeat(64));
  });

  it('should omit verification_token when verificationToken is an empty string', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const useCase = new RegisterContractUseCase();
    await useCase.execute(validInput({ verificationToken: '' }));

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.verification_token).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Task 11.0 — OTP 403 error mapping
// ---------------------------------------------------------------------------

describe('RegisterContractUseCase.execute — OTP verification errors', () => {
  it('should map 403 OTP_VERIFICATION_REQUIRED to user-facing OTP message', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'OTP_VERIFICATION_REQUIRED' }, 403),
    );

    const useCase = new RegisterContractUseCase();

    try {
      await useCase.execute(validInput());
      throw new Error('expected ValidationError');
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      const ve = e as ValidationError;
      expect(ve.fieldErrors._form).toContain('Sua verificação expirou');
      expect(ve.fieldErrors._code).toBe('OTP_VERIFICATION_REQUIRED');
    }
  });

  it('should map 403 OTP_VERIFICATION_TOKEN_INVALID to the same user-facing OTP message', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'OTP_VERIFICATION_TOKEN_INVALID' }, 403),
    );

    const useCase = new RegisterContractUseCase();

    try {
      await useCase.execute(validInput());
      throw new Error('expected ValidationError');
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      const ve = e as ValidationError;
      expect(ve.fieldErrors._form).toContain('Sua verificação expirou');
      expect(ve.fieldErrors._code).toBe('OTP_VERIFICATION_TOKEN_INVALID');
    }
  });
});

// ---------------------------------------------------------------------------
// Network failure
// ---------------------------------------------------------------------------

describe('RegisterContractUseCase.execute — network failure', () => {
  it('should throw ValidationError when network fails', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const useCase = new RegisterContractUseCase();

    await expect(useCase.execute(validInput())).rejects.toThrow(ValidationError);

    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).fieldErrors['_form']).toContain(
        'Erro de conexão',
      );
    }
  });
});

// ---------------------------------------------------------------------------
// API error mapping
// ---------------------------------------------------------------------------

describe('RegisterContractUseCase.execute — API error mapping', () => {
  it('should throw ValidationError when API returns error', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'UNKNOWN_ERROR' }, 500),
    );

    const useCase = new RegisterContractUseCase();

    await expect(useCase.execute(validInput())).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError with _form error when API returns CLIENT_NOT_FOUND', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'CLIENT_NOT_FOUND' }, 404),
    );

    const useCase = new RegisterContractUseCase();

    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).fieldErrors['_form']).toContain(
        'Cliente não encontrado',
      );
    }
  });

  it('should map PET_NOT_FOUND to ValidationError with specific message', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'PET_NOT_FOUND' }, 404),
    );

    const useCase = new RegisterContractUseCase();

    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).fieldErrors['_form']).toContain(
        'Um ou mais pets não foram encontrados',
      );
    }
  });

  it('should throw ValidationError with _form error when API returns PET_CLIENT_MISMATCH', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'PET_CLIENT_MISMATCH' }, 400),
    );

    const useCase = new RegisterContractUseCase();

    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).fieldErrors['_form']).toBeDefined();
    }
  });

  it('should map 429 status to ValidationError with retry message', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ message: 'ThrottlerException: Too Many Requests' }, 429),
    );

    const useCase = new RegisterContractUseCase();

    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).fieldErrors['_form']).toContain(
        'Muitas tentativas',
      );
    }
  });

  it('should throw ValidationError with _form error when API returns unknown error code', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'SOMETHING_UNEXPECTED' }, 503),
    );

    const useCase = new RegisterContractUseCase();

    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).fieldErrors['_form']).toBeDefined();
    }
  });
});
