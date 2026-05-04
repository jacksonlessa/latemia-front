/**
 * Unit tests for consumePaymentUpdateToken use-case.
 *
 * Mocks the global fetch to test the use-case in isolation.
 * PCI: cardToken is a Pagar.me tokenized reference — no real PAN/CVV is used in tests.
 * LGPD: no PII is used in fixtures or assertions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  consumePaymentUpdateToken,
  ConsumePaymentError,
} from './consume-payment-update-token.use-case';
import { TokenInvalidError } from './validate-payment-update-token.use-case';
import type { ConsumeResult } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeResponse(body: unknown, status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

function makeResponseNoBody(status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.reject(new SyntaxError('Unexpected end of JSON input')),
  } as unknown as Response;
}

const CARD_TOKEN = 'tok_test_abc123def456';

const cardUpdatedNoCharge: ConsumeResult = {
  outcome: 'card_updated_no_charge',
  chargesBehavior: 'next_cycle',
};

const chargePaid: ConsumeResult = {
  outcome: 'charge_paid',
  chargesBehavior: 'overdue_charge',
};

const chargePending: ConsumeResult = {
  outcome: 'charge_pending',
  chargesBehavior: 'first_charge',
};

const chargeFailedWithMessage: ConsumeResult = {
  outcome: 'charge_failed',
  chargesBehavior: 'overdue_charge',
  failureMessage: 'Cartão sem limite disponível.',
};

const chargeFailedWithoutMessage: ConsumeResult = {
  outcome: 'charge_failed',
  chargesBehavior: 'first_charge',
};

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Happy path — success outcomes
// ---------------------------------------------------------------------------

describe('consumePaymentUpdateToken — success outcomes', () => {
  it('should return outcome=card_updated_no_charge for ativo/carencia plans', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse(cardUpdatedNoCharge, 200));

    const result = await consumePaymentUpdateToken('valid-token', CARD_TOKEN);

    expect(result.outcome).toBe('card_updated_no_charge');
    expect(result.chargesBehavior).toBe('next_cycle');
    expect(result.failureMessage).toBeUndefined();
  });

  it('should return outcome=charge_paid when retry is approved', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse(chargePaid, 200));

    const result = await consumePaymentUpdateToken('valid-token', CARD_TOKEN);

    expect(result.outcome).toBe('charge_paid');
    expect(result.chargesBehavior).toBe('overdue_charge');
  });

  it('should return outcome=charge_pending when retry is still processing', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse(chargePending, 200));

    const result = await consumePaymentUpdateToken('valid-token', CARD_TOKEN);

    expect(result.outcome).toBe('charge_pending');
    expect(result.chargesBehavior).toBe('first_charge');
  });

  it('should call POST /api/public/payment-update/:token with cardToken in body', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeResponse(cardUpdatedNoCharge, 200));

    await consumePaymentUpdateToken('abc123', CARD_TOKEN);

    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('/api/public/payment-update/abc123');
    expect((init as RequestInit).method).toBe('POST');
    expect((init as RequestInit).headers).toMatchObject({
      'Content-Type': 'application/json',
    });
    const parsedBody = JSON.parse((init as RequestInit).body as string);
    expect(parsedBody).toEqual({ cardToken: CARD_TOKEN });
  });
});

// ---------------------------------------------------------------------------
// charge_failed — 200 response, but token stays alive for retry
// ---------------------------------------------------------------------------

describe('consumePaymentUpdateToken — charge_failed (200, inline retry)', () => {
  it('should return outcome=charge_failed with failureMessage from gateway', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse(chargeFailedWithMessage, 200),
    );

    const result = await consumePaymentUpdateToken('valid-token', CARD_TOKEN);

    expect(result.outcome).toBe('charge_failed');
    expect(result.failureMessage).toBe('Cartão sem limite disponível.');
    expect(result.chargesBehavior).toBe('overdue_charge');
  });

  it('should return outcome=charge_failed without failureMessage when gateway omits it', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse(chargeFailedWithoutMessage, 200),
    );

    const result = await consumePaymentUpdateToken('valid-token', CARD_TOKEN);

    expect(result.outcome).toBe('charge_failed');
    expect(result.failureMessage).toBeUndefined();
  });

  it('should NOT throw on charge_failed — caller decides UX inline', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse(chargeFailedWithMessage, 200),
    );

    await expect(
      consumePaymentUpdateToken('valid-token', CARD_TOKEN),
    ).resolves.toMatchObject({ outcome: 'charge_failed' });
  });
});

// ---------------------------------------------------------------------------
// Card declined / bad request
// ---------------------------------------------------------------------------

describe('consumePaymentUpdateToken — bad request (400)', () => {
  it('should throw ConsumePaymentError when API returns 400', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse({ code: 'CARD_DECLINED', message: 'Cartão recusado.' }, 400),
    );

    await expect(
      consumePaymentUpdateToken('valid-token', CARD_TOKEN),
    ).rejects.toThrow(ConsumePaymentError);
  });

  it('should use the backend message when API returns 400 with a message', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse({ message: 'Cartão sem limite disponível.' }, 400),
    );

    try {
      await consumePaymentUpdateToken('valid-token', CARD_TOKEN);
    } catch (e) {
      expect((e as ConsumePaymentError).message).toBe('Cartão sem limite disponível.');
      expect((e as ConsumePaymentError).code).toBe('CONSUME_ERROR');
    }
  });

  it('should use default message when 400 body has no message field', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse({ code: 'UNKNOWN' }, 400),
    );

    try {
      await consumePaymentUpdateToken('valid-token', CARD_TOKEN);
    } catch (e) {
      expect((e as ConsumePaymentError).message).toContain('Não foi possível atualizar o cartão');
    }
  });

  it('should use default message when 400 body is unparseable', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponseNoBody(400));

    try {
      await consumePaymentUpdateToken('valid-token', CARD_TOKEN);
    } catch (e) {
      expect((e as ConsumePaymentError).message).toContain('Não foi possível atualizar o cartão');
    }
  });
});

// ---------------------------------------------------------------------------
// Token invalid / expired / used
// ---------------------------------------------------------------------------

describe('consumePaymentUpdateToken — token invalid (404)', () => {
  it('should throw TokenInvalidError when API returns 404', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse({ message: 'Token not found' }, 404),
    );

    await expect(
      consumePaymentUpdateToken('expired-token', CARD_TOKEN),
    ).rejects.toThrow(TokenInvalidError);
  });
});

// ---------------------------------------------------------------------------
// Non-ok responses (5xx and other)
// ---------------------------------------------------------------------------

describe('consumePaymentUpdateToken — non-ok response', () => {
  it('should throw ConsumePaymentError on non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse({ message: 'Server error' }, 500));

    await expect(
      consumePaymentUpdateToken('valid-token', CARD_TOKEN),
    ).rejects.toThrow(ConsumePaymentError);
  });

  it('should include generic message on 500 error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse({ message: 'Server error' }, 500));

    try {
      await consumePaymentUpdateToken('valid-token', CARD_TOKEN);
    } catch (e) {
      expect((e as ConsumePaymentError).message).toContain('Erro inesperado ao atualizar o cartão');
    }
  });
});

// ---------------------------------------------------------------------------
// Network error
// ---------------------------------------------------------------------------

describe('consumePaymentUpdateToken — network error', () => {
  it('should throw ConsumePaymentError on network error', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(
      consumePaymentUpdateToken('any-token', CARD_TOKEN),
    ).rejects.toThrow(ConsumePaymentError);
  });

  it('should include connectivity message when fetch throws', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    try {
      await consumePaymentUpdateToken('any-token', CARD_TOKEN);
    } catch (e) {
      expect((e as ConsumePaymentError).message).toContain('Erro de conexão');
    }
  });
});
