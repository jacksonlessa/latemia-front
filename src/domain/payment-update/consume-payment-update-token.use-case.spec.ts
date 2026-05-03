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

const consumeResult: ConsumeResult = {
  chargesBehavior: 'immediate',
};

const consumeResultNextCycle: ConsumeResult = {
  chargesBehavior: 'next_cycle',
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
// Happy path
// ---------------------------------------------------------------------------

describe('consumePaymentUpdateToken — success', () => {
  it('should return chargesBehavior when card update succeeds (immediate)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse(consumeResult, 200));

    const result = await consumePaymentUpdateToken('valid-token', CARD_TOKEN);

    expect(result).toEqual(consumeResult);
    expect(result.chargesBehavior).toBe('immediate');
  });

  it('should return chargesBehavior when card update succeeds (next_cycle)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse(consumeResultNextCycle, 200));

    const result = await consumePaymentUpdateToken('valid-token', CARD_TOKEN);

    expect(result.chargesBehavior).toBe('next_cycle');
  });

  it('should call POST /api/public/payment-update/:token with cardToken in body', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeResponse(consumeResult, 200));

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
// Card declined / bad request
// ---------------------------------------------------------------------------

describe('consumePaymentUpdateToken — card declined (400)', () => {
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
