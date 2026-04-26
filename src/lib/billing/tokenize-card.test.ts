import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tokenizeCard } from './tokenize-card';
import { ValidationError } from '@/lib/validation-error';

describe('tokenizeCard', () => {
  const ORIGINAL_KEY = process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY;
  const fetchMock = vi.fn();

  beforeEach(() => {
    process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY = 'pk_test_abc';
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY = ORIGINAL_KEY;
    vi.unstubAllGlobals();
  });

  it('should return cardToken when Pagar.me responds 200 with token id', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'token_abc123',
        card: { last_four_digits: '1234', brand: 'Visa' },
      }),
    } as Response);

    const result = await tokenizeCard({
      number: '4000 0000 0000 0010',
      holderName: 'JOAO TESTE',
      expMonth: '10',
      expYear: '2030',
      cvv: '123',
    });

    expect(result).toEqual({
      cardToken: 'token_abc123',
      brand: 'Visa',
      lastFourDigits: '1234',
    });

    const [calledUrl, calledInit] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe('https://api.pagar.me/core/v5/tokens?appId=pk_test_abc');
    const body = JSON.parse((calledInit as RequestInit).body as string);
    expect(body).toEqual({
      type: 'card',
      card: {
        number: '4000000000000010',
        holder_name: 'JOAO TESTE',
        exp_month: 10,
        exp_year: 30,
        cvv: '123',
      },
    });
  });

  it('should throw ValidationError with INVALID_CARD_DATA when response is 422', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({
        message: 'invalid card',
        errors: { 'card.number': ['invalid'] },
      }),
    } as Response);

    await expect(
      tokenizeCard({
        number: '1111111111111111',
        holderName: 'JOAO',
        expMonth: '13',
        expYear: '20',
        cvv: '12',
      }),
    ).rejects.toMatchObject({
      name: 'ValidationError',
      fieldErrors: {
        _form: expect.stringContaining('Dados do cartão inválidos'),
        _code: 'INVALID_CARD_DATA',
      },
    });
  });

  it('should map 401 to CARD_TOKEN_EXPIRED', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    } as Response);

    await expect(
      tokenizeCard({
        number: '4000000000000010',
        holderName: 'JOAO',
        expMonth: '10',
        expYear: '30',
        cvv: '123',
      }),
    ).rejects.toMatchObject({
      fieldErrors: { _code: 'CARD_TOKEN_EXPIRED' },
    });
  });

  it('should throw configuration error when public key is missing', async () => {
    process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY = '';
    await expect(
      tokenizeCard({
        number: '4000000000000010',
        holderName: 'JOAO',
        expMonth: '10',
        expYear: '30',
        cvv: '123',
      }),
    ).rejects.toThrow(/NEXT_PUBLIC_PAGARME_PUBLIC_KEY/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should wrap network failures in a ValidationError', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network down'));

    const promise = tokenizeCard({
      number: '4000000000000010',
      holderName: 'JOAO',
      expMonth: '10',
      expYear: '30',
      cvv: '123',
    });

    await expect(promise).rejects.toBeInstanceOf(ValidationError);
  });
});
